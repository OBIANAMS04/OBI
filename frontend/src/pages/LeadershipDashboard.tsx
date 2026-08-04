import { useAuthStore } from '../store/authStore';
import DashboardLayout from './DashboardLayout';

export const LeadershipDashboard = () => {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Executive Dashboard</h2>
          <p className="text-gray-600">Key performance indicators and organizational metrics</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Total Applications</p>
            <p className="text-3xl font-bold text-blue-600">1,247</p>
            <p className="text-xs text-gray-600 mt-2">↑ 12% from last month</p>
          </div>
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <p className="text-sm text-gray-600 mb-2">Approval Rate</p>
            <p className="text-3xl font-bold text-green-600">73.4%</p>
            <p className="text-xs text-gray-600 mt-2">↑ 2.1% improvement</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <p className="text-sm text-gray-600 mb-2">Avg Processing Time</p>
            <p className="text-3xl font-bold text-purple-600">3.2 days</p>
            <p className="text-xs text-gray-600 mt-2">↓ 0.8 days improvement</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
            <p className="text-sm text-gray-600 mb-2">Compliance Score</p>
            <p className="text-3xl font-bold text-orange-600">99.2%</p>
            <p className="text-xs text-gray-600 mt-2">↑ 0.3% from last month</p>
          </div>
        </div>

        {/* Team Performance */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
          <div className="space-y-3">
            {[
              { team: 'Northern Region', cases: 187, approvalRate: 75, efficiency: 94 },
              { team: 'Southern Region', cases: 223, approvalRate: 72, efficiency: 91 },
              { team: 'Central Region', cases: 156, approvalRate: 74, efficiency: 95 },
              { team: 'Western Region', cases: 198, approvalRate: 71, efficiency: 88 },
            ].map((team) => (
              <div key={team.team} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-medium text-gray-900">{team.team}</p>
                  <p className="text-sm font-semibold text-gray-600">{team.cases} cases</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Approval Rate</p>
                    <p className="text-lg font-bold text-gray-900">{team.approvalRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Efficiency</p>
                    <p className="text-lg font-bold text-gray-900">{team.efficiency}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trends */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-medium text-gray-900 mb-3">Application Submissions</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-sm font-semibold text-gray-900">412 applications</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Month</span>
                  <span className="text-sm font-semibold text-gray-900">368 applications</span>
                </div>
                <div className="h-2 bg-blue-200 rounded-full mt-2">
                  <div className="h-2 bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-medium text-gray-900 mb-3">Case Resolution</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Resolved</span>
                  <span className="text-sm font-semibold text-gray-900">342 cases</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-semibold text-gray-900">98 cases</span>
                </div>
                <div className="h-2 bg-green-200 rounded-full mt-2">
                  <div className="h-2 bg-green-600 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
              📊 Download Report
            </button>
            <button className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300">
              📅 Schedule Meeting
            </button>
            <button className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300">
              📧 Send Memo
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeadershipDashboard;
