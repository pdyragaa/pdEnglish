import { useState, useEffect, useCallback } from 'react';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.DEFAULT_TTL;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStaleData<T>(key: string): T | null {
    const entry = this.cache.get(key);
    return entry ? (entry.data as T) : null;
  }
}

const memoryCache = new MemoryCache();

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  clearCache: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (retryCount = 0) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      memoryCache.set(key, result, options);
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error(`Cache fetch error for ${key} (attempt ${retryCount + 1}):`, error);

      // Retry once for network errors
      if (retryCount === 0 && (error.message.includes('503') || error.message.includes('Network'))) {
        console.log(`Retrying fetch for ${key}...`);
        setTimeout(() => fetchData(1), 1000);
        return;
      }

      setError(error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, options]);

  const refetch = useCallback(() => {
    memoryCache.delete(key);
    fetchData();
  }, [key, fetchData]);

  const clearCache = useCallback(() => {
    memoryCache.delete(key);
    setData(null);
  }, [key]);

  useEffect(() => {
    // Check cache first
    const cachedData = memoryCache.get<T>(key);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);

      // If stale-while-revalidate is enabled, refetch in background
      if (options.staleWhileRevalidate) {
        fetchData();
      }
      return;
    }

    // No cache, fetch data
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // Only depend on key to prevent infinite loops

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
  };
}

// Specialized hook for vocabulary data with longer cache
export function useVocabularyCache<T>(
  fetcher: () => Promise<T>,
  cacheKey?: string
) {
  return useCache(
    cacheKey || 'vocabulary-data',
    fetcher,
    {
      ttl: 10 * 60 * 1000, // 10 minutes
      staleWhileRevalidate: true,
    }
  );
}

// Specialized hook for quiz options with shorter cache
export function useQuizCache<T>(
  fetcher: () => Promise<T>,
  cacheKey?: string
) {
  return useCache(
    cacheKey || 'quiz-options',
    fetcher,
    {
      ttl: 2 * 60 * 1000, // 2 minutes
      staleWhileRevalidate: true,
    }
  );
}

export { memoryCache };
