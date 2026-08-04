# Accessibility (WCAG 2.1 Level AA)

This document outlines accessibility standards and testing procedures for the SSS Modernization frontend.

## Standards Compliance

All components must meet **WCAG 2.1 Level AA** standards:
- ✅ Perceivable: Information is perceivable to users
- ✅ Operable: UI components are operable via keyboard and other inputs
- ✅ Understandable: Content is understandable to all users
- ✅ Robust: Code is robust and compatible with assistive technologies

**Compliance Target**: 100% of user-facing components

---

## Testing Procedures

### Automated Testing

Use jest-axe for automated accessibility checks:

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MyComponent } from './MyComponent';

expect.extend(toHaveNoViolations);

describe('MyComponent Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Testing Checklist

#### 1. Keyboard Navigation
- [ ] All interactive elements are reachable via Tab/Shift+Tab
- [ ] Focus order is logical (top-to-bottom, left-to-right)
- [ ] No keyboard traps (can always Tab away)
- [ ] Enter key activates buttons/links
- [ ] Space key activates checkboxes/radio buttons
- [ ] Escape key closes modals/dropdowns

**Test**: Use keyboard only to navigate the entire page. Use Ctrl+F5 or Tab+Enter to verify all interactions work.

#### 2. Screen Reader Testing

Test with free screen readers:
- **NVDA** (Windows) — https://www.nvaccess.org/
- **JAWS** (Windows, paid) — https://www.freedomscientific.com/products/software/jaws/
- **VoiceOver** (macOS/iOS) — Built-in, Cmd+F5

**Test**: Turn on screen reader and navigate the page without looking at the screen. Verify:
- [ ] All text is announced clearly
- [ ] Form labels are associated with inputs
- [ ] Images have meaningful alt text
- [ ] Page structure is clear (headings, landmarks, lists)
- [ ] Error messages are announced

#### 3. Color Contrast

Verify color contrast ratios:
- Normal text: **4.5:1** (or 3:1 for large text ≥18pt or 14pt bold)
- Graphics/UI components: **3:1**

Use tools:
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- axe DevTools browser extension

**Test**: Check all text, buttons, links, and UI elements have sufficient contrast.

#### 4. Zoom and Magnification

- [ ] Content reflows at 200% zoom
- [ ] No horizontal scrolling at 200% zoom
- [ ] All content is readable and usable at 200% zoom

**Test**: Browser Ctrl++ to 200% and verify page remains usable.

#### 5. Text and Language

- [ ] Page language is declared (html lang="en")
- [ ] No unexplained acronyms (WCAG = Web Content Accessibility Guidelines on first use)
- [ ] Instructions don't rely on color alone ("Click the red button" → "Click the Submit button (red)")
- [ ] Text is clear and simple

#### 6. Forms and Error Handling

- [ ] All form fields have associated labels
- [ ] Required fields are marked (visually + aria-required)
- [ ] Error messages are clear and specific
- [ ] Error messages are linked to the field causing the error
- [ ] Users can recover from errors

**Test**: Submit form with missing fields and verify error messages are helpful.

---

## Component Implementation Guidelines

### HTML Semantics

Use semantic HTML elements:

```html
<!-- ✅ Good: Semantic elements -->
<nav>Navigation menu</nav>
<main>Main content</main>
<article>Article content</article>
<aside>Sidebar</aside>
<section>Section title</section>
<header>Page header</header>
<footer>Page footer</footer>

<!-- ❌ Bad: Non-semantic divs -->
<div class="nav">Navigation menu</div>
<div class="main">Main content</div>
```

### Forms

All form inputs must have associated labels:

```jsx
// ✅ Good
<label htmlFor="email">Email Address</label>
<input id="email" type="email" required aria-required="true" />

// ✅ Alternative: aria-label
<input type="email" aria-label="Email Address" required />

// ❌ Bad: No label
<input type="email" placeholder="Enter email" />
```

### Buttons and Links

- Buttons perform actions: `<button>Click me</button>`
- Links navigate: `<a href="/path">Go to page</a>`
- Button text should describe action clearly

```jsx
// ✅ Good
<button>Save Changes</button>
<a href="/help">Help documentation</a>

// ❌ Bad
<button>Click here</button>
<a href="/help">Click here</a>
```

### Images

Always provide alt text:

```jsx
// ✅ Good
<img src="chart.png" alt="Q3 revenue chart showing 15% growth" />

// ✅ Decorative image
<img src="icon.png" alt="" aria-hidden="true" />

// ❌ Bad: No alt text
<img src="chart.png" />

// ❌ Bad: Unhelpful alt text
<img src="chart.png" alt="Chart" />
```

### Focus Management

Provide visible focus indicators:

```css
/* ✅ Good: Visible focus */
button:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* ❌ Bad: No focus indicator */
button:focus {
  outline: none;
}
```

### ARIA Attributes

Use ARIA appropriately (semantic HTML first):

```jsx
// ✅ Good: Use ARIA when needed
<button aria-expanded={isOpen} onClick={toggle}>
  Menu
</button>
<div aria-hidden={!isOpen} role="navigation">
  {/* menu content */}
</div>

// ✅ Good: Label required fields
<input type="email" aria-required="true" required />

// ❌ Bad: Over-use of ARIA
<div role="button" onClick={handleClick}>
  Click me
</div>
// Use <button> instead
```

---

## Accessibility Resources

- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM**: https://webaim.org/
- **MDN Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **WAI-ARIA Practices**: https://www.w3.org/WAI/ARIA/apg/
- **axe DevTools**: https://www.deque.com/axe/devtools/

---

## Testing Tools Setup

### Install jest-axe

```bash
npm install --save-dev jest-axe @types/jest-axe
```

### Configure in test setup

```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);
```

---

## Continuous Compliance

- Run automated accessibility tests in CI/CD pipeline
- Perform manual testing on all new/modified components
- Use browser accessibility extensions during development
- Test with real assistive technologies (screen readers)
- Get feedback from users with disabilities

---

## Questions?

Refer to WCAG 2.1 Level AA guidelines or ask for guidance before implementing a component.
