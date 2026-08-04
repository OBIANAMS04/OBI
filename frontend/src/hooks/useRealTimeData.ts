import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export interface DataFreshness {
  lastRefresh: string;
  dataAge: number;
  freshness: 'fresh' | 'stale' | 'very_stale';
  cachedAt: string;
}

interface FreshnessCheckResponse extends DataFreshness {
  slo: {
    target: number;
    met: boolean;
  };
  indicators: {
    isGreen: boolean;
    isYellow: boolean;
    isRed: boolean;
  };
}

export const useRealTimeData = (userId?: string, pollInterval: number = 5000) => {
  const [data, setData] = useState<FreshnessCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/data/freshness-check', {
        params: userId ? { userId } : undefined,
      });
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch data freshness');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, pollInterval);

    return () => clearInterval(interval);
  }, [fetchData, pollInterval]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
    freshness: data?.freshness || null,
    dataAge: data?.dataAge || null,
    isSLOMet: data?.slo.met || false,
    indicators: data?.indicators || { isGreen: false, isYellow: false, isRed: false },
  };
};
