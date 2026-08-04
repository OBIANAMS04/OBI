import { useState, useEffect } from 'react';
import api from '../services/api';

interface EntityStats {
  entityType: string;
  operation: string;
  count: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  withinSLO: number;
  sloViolationRate: number;
}

interface LatencyMetrics {
  period: { startTime: string; endTime: string; hours: number };
  globalStats: { totalOperations: number; operationsWithinSLO: number; globalSLORate: number };
  byEntity: EntityStats[];
}

interface LatencyMonitoringProps {
  token?: string;
}

export const LatencyMonitoring = ({ token }: LatencyMonitoringProps) => {
  const [metrics, setMetrics] = useState<LatencyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState(1);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    loadMetrics();
  }, [hours, token]);

  const loadMetrics = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      const [metricsRes, healthRes] = await Promise.all([
        api.get(`/latency/metrics?hours=${hours}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/latency/health', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setMetrics(metricsRes.data);
      setHealth(healthRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load latency metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const getSLOColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadgeColor = (healthy: boolean) => {
    return healthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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
        <p className="text-yellow-700 text-sm">Unable to load latency metrics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Control */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {[1, 6, 24].map((h) => (
              <button
                key={h}
                onClick={() => setHours(h)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  hours === h
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
          {health && (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getHealthBadgeColor(health.healthy)}`}>
              {health.status}
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Global SLO Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Global Data Pipeline Status</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Operations</p>
            <p className="text-3xl font-bold text-gray-900">{metrics.globalStats.totalOperations}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Within SLO</p>
            <p className="text-3xl font-bold text-green-600">{metrics.globalStats.operationsWithinSLO}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">SLO Rate</p>
            <p className={`text-3xl font-bold ${getSLOColor(metrics.globalStats.globalSLORate)}`}>
              {metrics.globalStats.globalSLORate.toFixed(1)}%
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Target</p>
            <p className="text-3xl font-bold text-primary-600">≥95%</p>
          </div>
        </div>

        <div className="mt-4 bg-gray-50 rounded p-3 text-xs text-gray-600">
          <p>
            <strong>Target SLO:</strong> 95% of all operations complete within 30 seconds
          </p>
        </div>
      </div>

      {/* Per-Entity Performance */}
      {metrics.byEntity.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900">Performance by Entity Type</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Entity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Operation</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Count</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Avg</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">p95</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">p99</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Violation %</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {metrics.byEntity.map((entity, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{entity.entityType}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{entity.operation}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{entity.count}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{entity.averageLatency}ms</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={entity.p95Latency > 30000 ? 'text-red-600 font-medium' : 'text-green-600'}>
                        {Math.round(entity.p95Latency / 1000)}s
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{Math.round(entity.p99Latency / 1000)}s</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={entity.sloViolationRate > 5 ? 'text-red-600 font-medium' : 'text-green-600'}>
                        {entity.sloViolationRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700 text-sm">No latency data available for the selected period.</p>
        </div>
      )}

      {/* SLO Legend */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-900">
        <p className="font-semibold mb-2">Data Freshness SLO Target:</p>
        <ul className="space-y-1">
          <li>🟢 <strong>Green (≥95%):</strong> Exceeds SLO target</li>
          <li>🟡 <strong>Yellow (90-95%):</strong> Meets minimum, monitor closely</li>
          <li>🔴 <strong>Red (&lt;90%):</strong> Below target - escalate</li>
          <li className="mt-2">
            <strong>p95 Latency:</strong> 95th percentile operation time (target: ≤30s)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LatencyMonitoring;
