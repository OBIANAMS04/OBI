/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 * Includes contrast checking, ARIA validation, and keyboard navigation helpers
 */

export interface A11yCheckResult {
  passed: boolean;
  issues: A11yIssue[];
  stats: {
    total: number;
    passed: number;
    failed: number;
  };
}

export interface A11yIssue {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  nodes: string[];
  help: string;
  helpUrl: string;
}

/**
 * WCAG 2.1 Level AA color contrast ratios
 * https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
 */
export const CONTRAST_RATIOS = {
  AA_NORMAL: 4.5, // For normal text
  AA_LARGE: 3, // For large text (18pt+ or 14pt+ bold)
};

/**
 * Common keyboard shortcuts for accessibility
 */
export const KEYBOARD_SHORTCUTS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  SHIFT_TAB: 'Shift+Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
};

/**
 * Calculate contrast ratio between two colors (hex or rgb)
 * Returns the WCAG contrast ratio (1-21)
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  const fgLuminance = getRelativeLuminance(foreground);
  const bgLuminance = getRelativeLuminance(background);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get relative luminance of a color for contrast ratio calculation
 * https://www.w3.org/WAI/WCAG21/Relative_luminance
 */
function getRelativeLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Check if an element has visible focus
 */
export function hasFocusRing(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  const outline = style.outline;
  const boxShadow = style.boxShadow;

  return outline !== 'none' || (boxShadow && boxShadow !== 'none');
}

/**
 * Get all focusable elements in a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]',
  ].join(',');

  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
}

/**
 * Check if form inputs have associated labels
 */
export function validateFormLabels(form: HTMLFormElement): Map<HTMLElement, string[]> {
  const issues = new Map<HTMLElement, string[]>();

  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    const inputElement = input as HTMLElement;
    const label = form.querySelector(`label[for="${input.id}"]`);
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');

    if (!label && !ariaLabel && !ariaLabelledBy) {
      const problems = issues.get(inputElement) || [];
      problems.push('No associated label found');
      issues.set(inputElement, problems);
    }
  });

  return issues;
}

/**
 * Simulate keyboard navigation through focusable elements
 */
export function navigateWithKeyboard(
  container: HTMLElement,
  key: string
): HTMLElement | null {
  const focusables = getFocusableElements(container);
  const currentFocused = document.activeElement as HTMLElement;

  if (key === KEYBOARD_SHORTCUTS.TAB) {
    const currentIndex = focusables.indexOf(currentFocused);
    const nextIndex = (currentIndex + 1) % focusables.length;
    return focusables[nextIndex] || null;
  }

  if (key === KEYBOARD_SHORTCUTS.SHIFT_TAB) {
    const currentIndex = focusables.indexOf(currentFocused);
    const prevIndex = currentIndex - 1 < 0 ? focusables.length - 1 : currentIndex - 1;
    return focusables[prevIndex] || null;
  }

  return null;
}

/**
 * Announce message to screen readers using aria-live region
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  let liveRegion = document.getElementById('a11y-announcement');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'a11y-announcement';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only'; // Screen reader only
    document.body.appendChild(liveRegion);
  }

  liveRegion.textContent = message;
  liveRegion.setAttribute('aria-live', priority);
}

/**
 * WCAG compliance checklist for manual testing
 */
export const A11Y_CHECKLIST = {
  WCAG_2_1_AA: {
    'Perceivable': [
      'Images have alt text (1.1.1)',
      'Text color has 4.5:1 contrast (1.4.3)',
      'Large text has 3:1 contrast (1.4.3)',
    ],
    'Operable': [
      'All features accessible via keyboard (2.1.1)',
      'Focus indicator visible (2.4.7)',
      'No keyboard traps (2.1.2)',
      'No seizure-inducing flashes (2.3.1)',
    ],
    'Understandable': [
      'Form labels present (3.3.2)',
      'Error messages clear (3.3.1)',
      'Required fields marked (3.3.2)',
      'Focus changes don\'t cause unexpected actions (3.2.1)',
    ],
    'Robust': [
      'Valid HTML (4.1.1)',
      'ARIA attributes correct (4.1.2)',
      'Form inputs have type attribute (4.1.2)',
      'Sufficient heading hierarchy (1.3.1)',
    ],
  },
};
