/**
 * Role-Based Access Control (RBAC) utilities
 * Defines user roles, permissions, and dashboard access
 */

export type UserRole = 'citizen' | 'case_manager' | 'admin' | 'leadership';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface Permission {
  resource: string;
  action: string; // create, read, update, delete, approve, override
}

export interface RoleDefinition {
  name: UserRole;
  label: string;
  description: string;
  permissions: Permission[];
  dashboardPath: string;
  icon: string;
}

// Define role permissions
export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  citizen: {
    name: 'citizen',
    label: 'Citizen',
    description: 'Applies for exemptions and tracks application status',
    permissions: [
      { resource: 'exemptions', action: 'read' },
      { resource: 'cases', action: 'read' },
      { resource: 'profile', action: 'read' },
      { resource: 'profile', action: 'update' },
    ],
    dashboardPath: '/dashboard/citizen',
    icon: '👤',
  },
  case_manager: {
    name: 'case_manager',
    label: 'Case Manager',
    description: 'Reviews and processes exemption applications',
    permissions: [
      { resource: 'cases', action: 'read' },
      { resource: 'cases', action: 'update' },
      { resource: 'cases', action: 'approve' },
      { resource: 'cases', action: 'deny' },
      { resource: 'case_notes', action: 'create' },
      { resource: 'case_documents', action: 'read' },
    ],
    dashboardPath: '/dashboard/case-manager',
    icon: '📋',
  },
  admin: {
    name: 'admin',
    label: 'Administrator',
    description: 'Manages system configuration and all users',
    permissions: [
      { resource: 'users', action: 'read' },
      { resource: 'users', action: 'update' },
      { resource: 'cases', action: 'read' },
      { resource: 'cases', action: 'update' },
      { resource: 'cases', action: 'override' },
      { resource: 'compliance', action: 'read' },
      { resource: 'audit', action: 'read' },
      { resource: 'system', action: 'read' },
      { resource: 'system', action: 'update' },
    ],
    dashboardPath: '/dashboard/admin',
    icon: '⚙️',
  },
  leadership: {
    name: 'leadership',
    label: 'Leadership',
    description: 'Views KPIs, metrics, and team performance',
    permissions: [
      { resource: 'cases', action: 'read' },
      { resource: 'metrics', action: 'read' },
      { resource: 'team_performance', action: 'read' },
      { resource: 'compliance', action: 'read' },
      { resource: 'reports', action: 'read' },
    ],
    dashboardPath: '/dashboard/leadership',
    icon: '📊',
  },
};

/**
 * Check if a user has permission for a specific resource action
 */
export function hasPermission(user: User, resource: string, action: string): boolean {
  const role = ROLE_DEFINITIONS[user.role];
  if (!role) return false;

  return role.permissions.some((perm) => perm.resource === resource && perm.action === action);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasRole(user: User, ...roles: UserRole[]): boolean {
  return roles.includes(user.role);
}

/**
 * Get all permissions for a user's role
 */
export function getUserPermissions(user: User): Permission[] {
  const role = ROLE_DEFINITIONS[user.role];
  return role?.permissions || [];
}

/**
 * Get dashboard path for user's role
 */
export function getDashboardPath(user: User): string {
  const role = ROLE_DEFINITIONS[user.role];
  return role?.dashboardPath || '/dashboard';
}

/**
 * Check if a user can access a specific dashboard
 */
export function canAccessDashboard(user: User, role: UserRole): boolean {
  return user.role === role || user.role === 'admin' || user.role === 'leadership';
}

/**
 * Get readable role label
 */
export function getRoleLabel(role: UserRole): string {
  return ROLE_DEFINITIONS[role]?.label || role;
}

/**
 * Get role icon
 */
export function getRoleIcon(role: UserRole): string {
  return ROLE_DEFINITIONS[role]?.icon || '👤';
}
