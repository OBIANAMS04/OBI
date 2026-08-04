import { useAuthStore } from '../store/authStore';
import DashboardLayout from './DashboardLayout';

export const AdminDashboard = () => {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">System Administration</h2>
          <p className="text-gray-600">Manage users, system configuration, and monitoring</p>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <p className="text-sm text-gray-600 mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <p className="text-lg font-bold text-green-600">Operational</p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Active Users</p>
            <p className="text-3xl font-bold text-blue-600">47</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <p className="text-sm text-gray-600 mb-2">API Uptime</p>
            <p className="text-3xl font-bold text-purple-600">99.97%</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
            <p className="text-sm text-gray-600 mb-2">Database Size</p>
            <p className="text-3xl font-bold text-orange-600">2.3 GB</p>
          </div>
        </div>

        {/* User Management */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
          <div className="space-y-2">
            <button className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900">👥 Manage Users</p>
              <p className="text-sm text-gray-600">Add, edit, disable user accounts</p>
            </button>
            <button className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900">🔑 Role Management</p>
              <p className="text-sm text-gray-600">Configure user roles and permissions</p>
            </button>
            <button className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900">📋 Audit Logs</p>
              <p className="text-sm text-gray-600">View system activity and security events</p>
            </button>
          </div>
        </div>

        {/* System Configuration */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
          <div className="space-y-2">
            <button className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900">⚙️ System Settings</p>
              <p className="text-sm text-gray-600">Configure application parameters</p>
            </button>
            <button className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900">🔐 Security Settings</p>
              <p className="text-sm text-gray-600">Manage MFA, password policies, encryption</p>
            </button>
            <button className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900">📧 Email Configuration</p>
              <p className="text-sm text-gray-600">Setup email service provider</p>
            </button>
          </div>
        </div>

        {/* Monitoring */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoring & Alerts</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-700">
              ⚠️ 1 Alert: Database connection pool approaching limit
            </p>
            <button className="text-sm text-yellow-600 hover:text-yellow-700 mt-2">View Details</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
