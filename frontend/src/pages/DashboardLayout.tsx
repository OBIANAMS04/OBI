import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { ROLE_DEFINITIONS, getDashboardPath, getRoleLabel, getRoleIcon, User } from '../utils/rbac';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuthStore();
  const [userInfo, setUserInfo] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      setUserInfo(user as User);
    }
  }, [user]);

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const roleConfig = ROLE_DEFINITIONS[userInfo.role as keyof typeof ROLE_DEFINITIONS];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                {getRoleIcon(userInfo.role as any)} {getRoleLabel(userInfo.role as any)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{userInfo.fullName}</p>
              <p className="text-xs text-gray-600">{userInfo.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-gray-500">
          Role: {roleConfig?.label} • Access Level: {userInfo.role}
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
