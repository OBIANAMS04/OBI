import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import DashboardLayout from './DashboardLayout';

interface CaseWorkload {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export const CaseManagerDashboard = () => {
  const { user } = useAuthStore();
  const [workload, setWorkload] = useState<CaseWorkload>({
    total: 24,
    pending: 8,
    inProgress: 14,
    completed: 2,
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user?.fullName}!</h2>
          <p className="text-gray-600">Review and process exemption applications</p>
        </div>

        {/* Workload Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Total Cases</p>
            <p className="text-3xl font-bold text-blue-600">{workload.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
            <p className="text-sm text-gray-600 mb-2">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600">{workload.pending}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <p className="text-sm text-gray-600 mb-2">In Progress</p>
            <p className="text-3xl font-bold text-purple-600">{workload.inProgress}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <p className="text-sm text-gray-600 mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-600">{workload.completed}</p>
          </div>
        </div>

        {/* Priority Queue */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Queue</h3>
          <div className="space-y-3">
            {[
              { id: 1, citizen: 'John Doe', status: 'Urgent', daysWaiting: 5 },
              { id: 2, citizen: 'Jane Smith', status: 'High', daysWaiting: 3 },
              { id: 3, citizen: 'Bob Johnson', status: 'Medium', daysWaiting: 1 },
            ].map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.citizen}</p>
                  <p className="text-sm text-gray-600">Waiting {item.daysWaiting} day(s)</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.status === 'Urgent'
                        ? 'bg-red-100 text-red-700'
                        : item.status === 'High'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.status}
                  </span>
                  <button className="bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 text-sm">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month's Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Avg Processing Time</p>
              <p className="text-2xl font-bold text-blue-600">2.3 days</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-2">Approval Rate</p>
              <p className="text-2xl font-bold text-green-600">76%</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-2">Appeals Received</p>
              <p className="text-2xl font-bold text-purple-600">3</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CaseManagerDashboard;
