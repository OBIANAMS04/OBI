import { useState, useEffect } from 'react';
import api from '../services/api';

interface ComplianceMetric {
  date: string;
  totalDecisions: number;
  compliantDecisions: number;
  complianceRate: number;
  alerts?: string[];
}

interface ComplianceDashboardProps {
  token?: string;
}

export const ComplianceDashboard = ({ token }: ComplianceDashboardProps) => {
  const [metrics, setMetrics] = useState<{
    period: { days: number; startDate: string; endDate: string };
    aggregates: { totalDecisions: number; compliantDecisions: number; averageComplianceRate: number };
    daily: ComplianceMetric[];
    alerts: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    loadDashboard();
  }, [days, token]);

  const loadDashboard = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/compliance/dashboard?days=${days}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMetrics(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load compliance dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getComplianceColor = (rate: number): string => {
    if (rate >= 99) return 'text-green-600';
    if (rate >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-700 text-sm">Unable to load compliance metrics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Control */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                days === d
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Alerts */}
      {metrics.alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 mb-2">⚠️ Compliance Alerts</h3>
          <ul className="space-y-1">
            {metrics.alerts.map((alert, idx) => (
              <li key={idx} className="text-red-700 text-sm">
                • {alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Total Decisions</p>
          <p className="text-4xl font-bold text-gray-900">{metrics.aggregates.totalDecisions}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Compliant Decisions</p>
          <p className="text-4xl font-bold text-green-600">{metrics.aggregates.compliantDecisions}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Compliance Rate</p>
          <p className={`text-4xl font-bold ${getComplianceColor(metrics.aggregates.averageComplianceRate)}`}>
            {metrics.aggregates.averageComplianceRate.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Daily Compliance Trend</h3>
        </div>

        {metrics.daily.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Compliant</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {metrics.daily.map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{day.totalDecisions}</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                      {day.compliantDecisions}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-semibold ${getComplianceColor(day.complianceRate)}`}>
                        {day.complianceRate.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-600">
            <p className="text-sm">No compliance data for this period.</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-900">
        <p className="font-semibold mb-2">Compliance Status:</p>
        <ul className="space-y-1">
          <li>🟢 <strong>Green (≥99%)</strong>: Exceeds compliance target</li>
          <li>🟡 <strong>Yellow (95-99%)</strong>: Meets minimum threshold</li>
          <li>🔴 <strong>Red (&lt;95%)</strong>: Below threshold - manual review required</li>
        </ul>
      </div>
    </div>
  );
};

export default ComplianceDashboard;
