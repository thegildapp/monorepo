import { getValkeyClient } from '../utils/valkey';
import { logger } from './loggingService';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for cache invalidation
}

const DEFAULT_TTL = 300; // 5 minutes
const CACHE_PREFIX = 'cache:';
const TAG_PREFIX = 'tag:';

class CacheService {
  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const valkey = getValkeyClient();
      const value = await valkey.get(`${CACHE_PREFIX}${key}`);
      
      if (!value) {
        return null;
      }
      
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache get error', error as Error, {
        metadata: { key }
      });
      return null;
    }
  }

  /**
   * Set a value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const valkey = getValkeyClient();
      const ttl = options.ttl || DEFAULT_TTL;
      const cacheKey = `${CACHE_PREFIX}${key}`;
      
      await valkey.setex(cacheKey, ttl, JSON.stringify(value));
      
      // Handle tags for cache invalidation
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          await valkey.sadd(`${TAG_PREFIX}${tag}`, cacheKey);
          await valkey.expire(`${TAG_PREFIX}${tag}`, ttl);
        }
      }
    } catch (error) {
      logger.error('Cache set error', error as Error, {
        metadata: { key }
      });
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      const valkey = getValkeyClient();
      await valkey.del(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      logger.error('Cache delete error', error as Error, {
        metadata: { key }
      });
    }
  }

  /**
   * Invalidate all cache entries with a specific tag
   */
  async invalidateTag(tag: string): Promise<void> {
    try {
      const valkey = getValkeyClient();
      const tagKey = `${TAG_PREFIX}${tag}`;
      
      // Get all cache keys with this tag
      const cacheKeys = await valkey.smembers(tagKey);
      
      if (cacheKeys.length > 0) {
        // Delete all cache entries
        await valkey.del(...cacheKeys);
        // Delete the tag set
        await valkey.del(tagKey);
        
        logger.info('Cache tag invalidated', {
          metadata: { tag, keysInvalidated: cacheKeys.length }
        });
      }
    } catch (error) {
      logger.error('Cache tag invalidation error', error as Error, {
        metadata: { tag }
      });
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      const valkey = getValkeyClient();
      const keys = await valkey.keys(`${CACHE_PREFIX}*`);
      
      if (keys.length > 0) {
        await valkey.del(...keys);
        logger.info('Cache cleared', {
          metadata: { keysDeleted: keys.length }
        });
      }
    } catch (error) {
      logger.error('Cache clear error', error as Error);
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch the data
    const data = await fetchFn();
    
    // Cache it
    await this.set(key, data, options);
    
    return data;
  }

  /**
   * Wrap a function to automatically cache its results
   */
  wrap<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keyGenerator: (...args: Parameters<T>) => string,
    options: CacheOptions = {}
  ): T {
    return (async (...args: Parameters<T>) => {
      const key = keyGenerator(...args);
      return this.getOrSet(key, () => fn(...args), options);
    }) as T;
  }
}

// Export singleton instance
export const cache = new CacheService();