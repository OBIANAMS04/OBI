import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

interface ComplianceCheck {
  id: string;
  requirementId: string;
  caseId?: string;
  userId?: string;
  controlName: string;
  passed: boolean;
  evidence?: string;
  checkedBy?: string;
  checkedAt: string;
}

export const AuditLog = () => {
  const { token } = useAuthStore();

  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [checks, setChecks] = useState<ComplianceCheck[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState('100');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/compliance/audit?startDate=${startDate}&endDate=${endDate}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setChecks(response.data.checks || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load audit log');
    } finally {
      setIsLoading(false);
    }
  };

  const getPassedColor = (passed: boolean) => {
    return passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Compliance Audit Log</h1>

          {/* Filter Form */}
          <form onSubmit={handleSearch} className="bg-blue-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 transition-colors"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Results Summary */}
          {checks.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                <strong>{checks.length}</strong> compliance checks found
                {checks.filter((c) => c.passed).length > 0 && (
                  <>
                    {' '}
                    • <strong className="text-green-600">{checks.filter((c) => c.passed).length} passed</strong>
                  </>
                )}
                {checks.filter((c) => !c.passed).length > 0 && (
                  <>
                    {' '}
                    • <strong className="text-red-600">{checks.filter((c) => !c.passed).length} failed</strong>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Audit Log Table */}
          {checks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Requirement</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Control</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Case ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Checked At</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Checked By</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {checks.map((check) => (
                    <tr key={check.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">{check.requirementId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{check.controlName}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPassedColor(check.passed)}`}>
                          {check.passed ? '✓ Passed' : '✗ Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {check.caseId ? check.caseId.substring(0, 8) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(check.checkedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{check.checkedBy || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {isLoading ? 'Loading...' : 'No audit log entries found. Try adjusting your filters.'}
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
            <p className="font-semibold mb-2">Compliance Requirements:</p>
            <ul className="space-y-1 text-xs">
              <li>
                <strong>FAR 52.209-2</strong>: Integrity (Previous Contractor Performance) - Audit logging 100%
              </li>
              <li>
                <strong>FAR 52.210-1</strong>: Default Risk (Terminations for Default) - Credit check on file
              </li>
              <li>
                <strong>FAR 52.212-1</strong>: Flow-downs (Contractor Requirements) - Exemption rules enforced
              </li>
              <li>
                <strong>NIST 800-53</strong>: AC-2/AC-3/SC-8 - Account management, access control, TLS encryption
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
