import { useState, useEffect, useCallback, useRef } from 'react';
import { createLogger } from '../lib/logger';

const logger = createLogger('Performance');

// 防抖Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 节流Hook
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, delay - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
}

// 缓存Hook
export function useCache<T>(key: string, fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const depsRef = useRef(deps);

  // Update deps ref when deps change
  useEffect(() => {
    depsRef.current = deps;
  }, [deps]);

  const fetchData = useCallback(async () => {
    const cached = cacheRef.current.get(key);
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();

      cacheRef.current.set(key, { data: result, timestamp: now });
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, ...deps]);

  const invalidateCache = useCallback(() => {
    cacheRef.current.delete(key);
  }, [key]);

  const refetch = useCallback(() => {
    invalidateCache();
    fetchData();
  }, [invalidateCache, fetchData]);

  return { data, loading, error, refetch, invalidateCache };
}

// 智能预加载Hook
export function usePrefetch() {
  const prefetchRef = useRef<Map<string, Promise<unknown>>>(new Map());

  const prefetch = useCallback((key: string, fetcher: () => Promise<unknown>) => {
    if (!prefetchRef.current.has(key)) {
      const promise = fetcher();
      prefetchRef.current.set(key, promise);

      promise.finally(() => {
        // 完成后可以从预加载缓存中移除
        setTimeout(() => {
          prefetchRef.current?.delete(key);
        }, 60000); // 1分钟后移除
      });
    }
  }, []);

  const getPrefetched = useCallback((key: string) => {
    return prefetchRef.current.get(key);
  }, []);

  return { prefetch, getPrefetched };
}

// 资源预加载Hook
export function useResourcePreloader() {
  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const loadScript = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  const preloadResource = useCallback(async (resource: { type: 'image' | 'script'; src: string }) => {
    try {
      if (resource.type === 'image') {
        await loadImage(resource.src);
      } else if (resource.type === 'script') {
        await loadScript(resource.src);
      }
    } catch (error) {
      logger.warn(`Failed to preload ${resource.type}`, { src: resource.src, error });
    }
  }, [loadImage, loadScript]);

  return { preloadResource };
}

// 内存优化Hook
export function useMemoryOptimization<T>(data: T[], options?: {
  maxItems?: number;
  enableVirtualization?: boolean;
}) {
  const { maxItems = 100, enableVirtualization = true } = options || {};
  
  const optimizedData = useCallback(() => {
    if (!enableVirtualization) return data;
    
    // 只保留最近的数据，释放旧数据内存
    if (data.length > maxItems) {
      return data.slice(-maxItems);
    }
    return data;
  }, [data, maxItems, enableVirtualization]);

  return optimizedData();
}