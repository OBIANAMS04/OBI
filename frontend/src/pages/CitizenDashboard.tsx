import { useAuthStore } from '../store/authStore';
import DashboardLayout from './DashboardLayout';

export const CitizenDashboard = () => {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.fullName}!</h2>
          <p className="text-gray-600">Track your exemption application status and eligibility</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Application Status</p>
            <p className="text-3xl font-bold text-blue-600">Pending Review</p>
          </div>
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <p className="text-sm text-gray-600 mb-2">Eligibility</p>
            <p className="text-3xl font-bold text-green-600">Eligible</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <p className="text-sm text-gray-600 mb-2">Profile Completion</p>
            <p className="text-3xl font-bold text-purple-600">100%</p>
          </div>
        </div>

        {/* Application Timeline */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Timeline</h3>
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div className="w-1 h-8 bg-gray-200"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Application Submitted</p>
                <p className="text-sm text-gray-600">August 1, 2026</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Under Review</p>
                <p className="text-sm text-gray-600">Case Manager: John Smith</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
              View Application Details
            </button>
            <button className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300">
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CitizenDashboard;
