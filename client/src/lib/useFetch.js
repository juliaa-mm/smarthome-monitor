import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

export function useFetch(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      setData(await api.get(url));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [url, ...deps]);

  useEffect(() => { reload(); }, [reload]);

  return { data, loading, error, reload, setData };
}
