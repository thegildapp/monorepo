import { logger } from './loggingService';
import { getValkeyClient } from '../utils/valkey';
import type { Redis } from 'ioredis';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory fallback store for development
const rateLimitStore = new Map<string, RateLimitEntry>();
let useInMemoryFallback = false;

// Get Valkey client with fallback handling
let valkeyClient: Redis | null = null;
try {
  valkeyClient = getValkeyClient();
} catch (error) {
  logger.warn('Valkey not available, using in-memory rate limiting', { 
    metadata: { error: error instanceof Error ? error.message : String(error) } 
  });
  useInMemoryFallback = true;
}

// Cleanup expired entries every 5 minutes (only for in-memory fallback)
if (useInMemoryFallback) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  keyPrefix?: string;  // Prefix for the rate limit key
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;  // Seconds until next request allowed
}

/**
 * Check if a request is allowed based on rate limiting rules
 * @param identifier - Unique identifier (e.g., IP address, user ID, email)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { windowMs, maxRequests, keyPrefix = 'default' } = config;
  const key = `rate_limit:${keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  // Use in-memory fallback if Valkey is not available
  if (useInMemoryFallback) {
    return checkRateLimitInMemory(identifier, config);
  }

  try {
    // Use Valkey sliding window rate limiting with atomic operations
    const pipeline = valkeyClient!.pipeline();
    
    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, '-inf', windowStart);
    
    // Count current entries in the window
    pipeline.zcard(key);
    
    // Execute pipeline
    const results = await pipeline.exec();
    
    if (!results) {
      throw new Error('Pipeline execution failed');
    }
    
    const currentCount = results[1]?.[1] as number || 0;
    const allowed = currentCount < maxRequests;
    
    if (allowed) {
      // Add new entry with current timestamp as score
      await valkeyClient!.zadd(key, now, `${now}-${Math.random()}`);
      // Set expiration to window duration
      await valkeyClient!.expire(key, Math.ceil(windowMs / 1000));
    }
    
    const remaining = Math.max(0, maxRequests - (allowed ? currentCount + 1 : currentCount));
    const resetTime = now + windowMs;
    
    // Calculate retry after by finding the oldest entry that would need to expire
    let retryAfter: number | undefined;
    if (!allowed && currentCount >= maxRequests) {
      const oldestEntries = await valkeyClient!.zrange(key, 0, 0, 'WITHSCORES');
      if (oldestEntries.length >= 2) {
        const oldestTimestamp = parseInt(oldestEntries[1] as string);
        const timeUntilOldestExpires = (oldestTimestamp + windowMs) - now;
        retryAfter = Math.ceil(timeUntilOldestExpires / 1000);
      }
    }
    
    // Log rate limit hit
    if (!allowed) {
      logger.warn('Rate limit exceeded', {
        metadata: {
          identifier,
          keyPrefix,
          count: currentCount,
          maxRequests,
          retryAfter
        }
      });
    }
    
    return {
      allowed,
      remaining,
      resetTime,
      retryAfter
    };
  } catch (error) {
    logger.error('Valkey rate limit check failed, falling back to in-memory', error as Error);
    
    // Fallback to in-memory rate limiting
    return checkRateLimitInMemory(identifier, config);
  }
}

/**
 * In-memory fallback for rate limiting
 */
function checkRateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const { windowMs, maxRequests, keyPrefix = 'default' } = config;
  const key = `${keyPrefix}:${identifier}`;
  const now = Date.now();
  const resetTime = now + windowMs;

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetTime: resetTime
    };
    rateLimitStore.set(key, entry);
  }

  // Check if request is allowed
  const allowed = entry.count < maxRequests;
  
  if (allowed) {
    entry.count++;
  }

  const remaining = Math.max(0, maxRequests - entry.count);
  const retryAfter = allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000);

  // Log rate limit hit
  if (!allowed) {
    logger.warn('Rate limit exceeded (in-memory)', {
      metadata: {
        identifier,
        keyPrefix,
        count: entry.count,
        maxRequests,
        retryAfter
      }
    });
  }

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    retryAfter
  };
}

/**
 * Reset rate limit for a specific identifier
 * @param identifier - Unique identifier
 * @param keyPrefix - Key prefix
 */
export async function resetRateLimit(identifier: string, keyPrefix: string = 'default'): Promise<void> {
  const key = `rate_limit:${keyPrefix}:${identifier}`;
  
  if (useInMemoryFallback) {
    const memKey = `${keyPrefix}:${identifier}`;
    rateLimitStore.delete(memKey);
    return;
  }
  
  try {
    await valkeyClient!.del(key);
  } catch (error) {
    logger.error('Failed to reset rate limit in Valkey', error as Error, { 
      metadata: { key } 
    });
    
    // Fallback to in-memory deletion
    const memKey = `${keyPrefix}:${identifier}`;
    rateLimitStore.delete(memKey);
  }
}

// Common rate limit configurations
export const RATE_LIMITS = {
  // Password reset: 2 requests per 24 hours per email
  PASSWORD_RESET: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 2,
    keyPrefix: 'password_reset'
  },
  
  // Password reset by IP: 5 requests per 24 hours per IP
  PASSWORD_RESET_IP: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 5,
    keyPrefix: 'password_reset_ip'
  },
  
  // Login attempts: 5 attempts per 15 minutes per email
  LOGIN: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    keyPrefix: 'login'
  },
  
  // Registration: 5 attempts per hour per IP
  REGISTRATION: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    keyPrefix: 'registration'
  },
  
  // Email verification resend: 3 requests per hour per email
  EMAIL_VERIFICATION: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    keyPrefix: 'email_verification'
  }
};

/**
 * Format rate limit headers for HTTP response
 * @param result - Rate limit result
 * @returns Headers object
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.resetTime / 1000))
  };

  if (result.retryAfter) {
    headers['Retry-After'] = String(result.retryAfter);
  }

  return headers;
}