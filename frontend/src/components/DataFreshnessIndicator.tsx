import { useRealTimeData } from '../hooks/useRealTimeData';

interface DataFreshnessIndicatorProps {
  userId?: string;
  compact?: boolean;
  showDetails?: boolean;
}

export const DataFreshnessIndicator = ({
  userId,
  compact = false,
  showDetails = true,
}: DataFreshnessIndicatorProps) => {
  const { data, isLoading, error, indicators, freshness, dataAge, isSLOMet } = useRealTimeData(
    userId,
    5000
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-full bg-gray-400" />
        <span className="text-xs text-gray-500">Unavailable</span>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const statusColor = indicators.isGreen
    ? 'bg-green-500'
    : indicators.isYellow
    ? 'bg-yellow-500'
    : 'bg-red-500';

  const statusLabel = freshness === 'fresh' ? 'Fresh' : freshness === 'stale' ? 'Stale' : 'Very Stale';

  const statusTextColor = indicators.isGreen
    ? 'text-green-700'
    : indicators.isYellow
    ? 'text-yellow-700'
    : 'text-red-700';

  const formatDataAge = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s ago`;
    }
    return `${seconds}s ago`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${statusColor} animate-pulse`} />
        <span className={`text-xs font-medium ${statusTextColor}`}>{statusLabel}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">Data Freshness</h4>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${statusColor} animate-pulse`} />
          <span className={`text-sm font-bold ${statusTextColor}`}>{statusLabel}</span>
        </div>
      </div>

      {showDetails && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Data Age:</span>
            <span className={`font-mono ${dataAge && dataAge > 20000 ? 'text-red-600' : 'text-gray-700'}`}>
              {dataAge ? formatDataAge(dataAge) : 'Unknown'}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-600">SLO (< 30s):</span>
            <span className={isSLOMet ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {isSLOMet ? '✓ Met' : '✗ Exceeded'}
            </span>
          </div>

          <div className="flex justify-between text-xs mt-2">
            <span className="text-gray-600">Last Updated:</span>
            <span className="text-gray-500 font-mono text-xs">
              {data.lastRefresh ? new Date(data.lastRefresh).toLocaleTimeString() : '—'}
            </span>
          </div>

          {/* Visual progress bar */}
          <div className="mt-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  indicators.isGreen
                    ? 'bg-green-500 w-1/4'
                    : indicators.isYellow
                    ? 'bg-yellow-500 w-2/3'
                    : 'bg-red-500 w-full'
                }`}
                style={{
                  width: dataAge ? `${Math.min((dataAge / 30000) * 100, 100)}%` : '0%',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataFreshnessIndicator;
