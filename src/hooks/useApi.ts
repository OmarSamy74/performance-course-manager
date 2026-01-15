import { useState, useEffect, useCallback } from 'react';

export function useApi<T>(
  apiCall: () => Promise<{ [key: string]: T[] | T }>,
  dataKey: string,
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      const result = response[dataKey];
      setData(Array.isArray(result) ? result : [result]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall, dataKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, setData };
}
