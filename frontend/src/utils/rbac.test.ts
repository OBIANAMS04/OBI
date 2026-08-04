import {
  hasPermission,
  hasRole,
  getUserPermissions,
  getDashboardPath,
  canAccessDashboard,
  getRoleLabel,
  getRoleIcon,
  User,
  UserRole,
} from './rbac';

describe('RBAC Utilities', () => {
  const mockUsers: Record<UserRole, User> = {
    citizen: {
      id: '1',
      email: 'citizen@example.com',
      role: 'citizen',
      fullName: 'John Citizen',
    },
    case_manager: {
      id: '2',
      email: 'manager@example.com',
      role: 'case_manager',
      fullName: 'Jane Manager',
    },
    admin: {
      id: '3',
      email: 'admin@example.com',
      role: 'admin',
      fullName: 'Admin User',
    },
    leadership: {
      id: '4',
      email: 'leader@example.com',
      role: 'leadership',
      fullName: 'Leader User',
    },
  };

  describe('hasPermission', () => {
    it('should return true for citizen reading exemptions', () => {
      const has = hasPermission(mockUsers.citizen, 'exemptions', 'read');
      expect(has).toBe(true);
    });

    it('should return false for citizen creating cases', () => {
      const has = hasPermission(mockUsers.citizen, 'cases', 'create');
      expect(has).toBe(false);
    });

    it('should return true for case_manager approving cases', () => {
      const has = hasPermission(mockUsers.case_manager, 'cases', 'approve');
      expect(has).toBe(true);
    });

    it('should return true for admin overriding cases', () => {
      const has = hasPermission(mockUsers.admin, 'cases', 'override');
      expect(has).toBe(true);
    });

    it('should return true for admin reading audit logs', () => {
      const has = hasPermission(mockUsers.admin, 'audit', 'read');
      expect(has).toBe(true);
    });

    it('should return true for leadership reading metrics', () => {
      const has = hasPermission(mockUsers.leadership, 'metrics', 'read');
      expect(has).toBe(true);
    });

    it('should return false for invalid user role', () => {
      const invalidUser = { ...mockUsers.citizen, role: 'invalid' as UserRole };
      const has = hasPermission(invalidUser, 'exemptions', 'read');
      expect(has).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has specified role', () => {
      const has = hasRole(mockUsers.citizen, 'citizen');
      expect(has).toBe(true);
    });

    it('should return true when user has one of multiple roles', () => {
      const has = hasRole(mockUsers.case_manager, 'citizen', 'case_manager', 'admin');
      expect(has).toBe(true);
    });

    it('should return false when user does not have role', () => {
      const has = hasRole(mockUsers.citizen, 'admin', 'leadership');
      expect(has).toBe(false);
    });
  });

  describe('getUserPermissions', () => {
    it('should return permissions for citizen role', () => {
      const perms = getUserPermissions(mockUsers.citizen);
      expect(perms.length).toBeGreaterThan(0);
      expect(perms.some((p) => p.resource === 'exemptions')).toBe(true);
    });

    it('should return more permissions for case_manager than citizen', () => {
      const citizenPerms = getUserPermissions(mockUsers.citizen);
      const managerPerms = getUserPermissions(mockUsers.case_manager);
      expect(managerPerms.length).toBeGreaterThan(citizenPerms.length);
    });

    it('should return most permissions for admin', () => {
      const adminPerms = getUserPermissions(mockUsers.admin);
      expect(adminPerms.length).toBeGreaterThan(5);
    });
  });

  describe('getDashboardPath', () => {
    it('should return citizen dashboard path', () => {
      const path = getDashboardPath(mockUsers.citizen);
      expect(path).toBe('/dashboard/citizen');
    });

    it('should return case-manager dashboard path', () => {
      const path = getDashboardPath(mockUsers.case_manager);
      expect(path).toBe('/dashboard/case-manager');
    });

    it('should return admin dashboard path', () => {
      const path = getDashboardPath(mockUsers.admin);
      expect(path).toBe('/dashboard/admin');
    });

    it('should return leadership dashboard path', () => {
      const path = getDashboardPath(mockUsers.leadership);
      expect(path).toBe('/dashboard/leadership');
    });
  });

  describe('canAccessDashboard', () => {
    it('should allow citizen to access own dashboard', () => {
      const can = canAccessDashboard(mockUsers.citizen, 'citizen');
      expect(can).toBe(true);
    });

    it('should prevent citizen from accessing case_manager dashboard', () => {
      const can = canAccessDashboard(mockUsers.citizen, 'case_manager');
      expect(can).toBe(false);
    });

    it('should allow admin to access any dashboard', () => {
      expect(canAccessDashboard(mockUsers.admin, 'citizen')).toBe(true);
      expect(canAccessDashboard(mockUsers.admin, 'case_manager')).toBe(true);
      expect(canAccessDashboard(mockUsers.admin, 'leadership')).toBe(true);
    });

    it('should allow leadership to access any dashboard', () => {
      expect(canAccessDashboard(mockUsers.leadership, 'citizen')).toBe(true);
      expect(canAccessDashboard(mockUsers.leadership, 'case_manager')).toBe(true);
    });
  });

  describe('getRoleLabel', () => {
    it('should return readable labels for all roles', () => {
      expect(getRoleLabel('citizen')).toBe('Citizen');
      expect(getRoleLabel('case_manager')).toBe('Case Manager');
      expect(getRoleLabel('admin')).toBe('Administrator');
      expect(getRoleLabel('leadership')).toBe('Leadership');
    });
  });

  describe('getRoleIcon', () => {
    it('should return icons for all roles', () => {
      expect(getRoleIcon('citizen')).toBe('👤');
      expect(getRoleIcon('case_manager')).toBe('📋');
      expect(getRoleIcon('admin')).toBe('⚙️');
      expect(getRoleIcon('leadership')).toBe('📊');
    });
  });

  describe('Permission Matrix', () => {
    it('should enforce least privilege principle', () => {
      const citizenPerms = getUserPermissions(mockUsers.citizen);
      const managerPerms = getUserPermissions(mockUsers.case_manager);

      // Citizen should not have override capability
      expect(citizenPerms.some((p) => p.action === 'override')).toBe(false);
      // Manager should not have system update capability
      expect(managerPerms.some((p) => p.resource === 'system')).toBe(false);
    });

    it('should grant admin full system access', () => {
      const adminPerms = getUserPermissions(mockUsers.admin);
      const hasSysRead = adminPerms.some((p) => p.resource === 'system' && p.action === 'read');
      const hasSysUpdate = adminPerms.some((p) => p.resource === 'system' && p.action === 'update');

      expect(hasSysRead).toBe(true);
      expect(hasSysUpdate).toBe(true);
    });

    it('should grant leadership read-only access to KPIs', () => {
      const leaderPerms = getUserPermissions(mockUsers.leadership);
      const hasMetricsRead = leaderPerms.some((p) => p.resource === 'metrics' && p.action === 'read');
      expect(hasMetricsRead).toBe(true);

      // Leadership should not have modify permissions
      expect(leaderPerms.some((p) => p.action === 'update' || p.action === 'delete')).toBe(false);
    });
  });
});
