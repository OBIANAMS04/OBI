import { useState, useEffect } from 'react';
import api from '../services/api';

interface Exemption {
  id: string;
  userId: string;
  exemptionType: string;
  status: string;
  reason?: string;
  determinedAt: string;
  determinedBy: string;
}

interface ExemptionsDisplayProps {
  userId?: string;
  token?: string;
}

export const ExemptionsDisplay = ({ userId, token }: ExemptionsDisplayProps) => {
  const [exemptions, setExemptions] = useState<Exemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    loadExemptions();
  }, [userId, token]);

  const loadExemptions = async () => {
    if (!userId || !token) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/exemptions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExemptions(response.data.exemptions || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load exemptions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckExemptions = async () => {
    if (!token) return;

    try {
      setIsChecking(true);
      setError(null);

      const response = await api.post('/exemptions/check', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Reload exemptions after check
      await loadExemptions();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to check exemptions');
    } finally {
      setIsChecking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">Exemption Status</p>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Exemptions Summary */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-600 mb-1">Exemption Status</p>
            {exemptions.length > 0 ? (
              <p className="text-lg font-bold text-green-700">
                ✓ Eligible for {exemptions.length} exemption{exemptions.length !== 1 ? 's' : ''}
              </p>
            ) : (
              <p className="text-lg font-medium text-gray-700">
                No exemptions currently available
              </p>
            )}
          </div>
          <button
            onClick={handleCheckExemptions}
            disabled={isChecking}
            className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 disabled:bg-gray-400 transition-colors"
          >
            {isChecking ? 'Checking...' : 'Check Now'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Exemptions List */}
      {exemptions.length > 0 && (
        <div className="space-y-3">
          {exemptions.map((exemption) => (
            <div key={exemption.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900">{exemption.exemptionType}</h4>
                  <p className="text-sm text-green-700 mt-1">Status: {exemption.status}</p>
                  {exemption.reason && (
                    <p className="text-sm text-green-600 mt-2">{exemption.reason}</p>
                  )}
                </div>
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-xs text-green-600 mt-3">
                Determined: {new Date(exemption.determinedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {exemptions.length === 0 && !error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700 text-sm">
            You don't currently qualify for any exemptions. Complete your profile to check your eligibility.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExemptionsDisplay;
