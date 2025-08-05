import { getValkeyClient } from '../utils/valkey';
import crypto from 'crypto';
import { logger } from './loggingService';

const VIEW_COUNT_PREFIX = 'listing:views:';
const UNIQUE_VIEWERS_PREFIX = 'listing:viewers:';
const VIEW_RATE_LIMIT_PREFIX = 'listing:viewed:';
const RATE_LIMIT_SECONDS = 3600; // 1 hour

export interface ViewTrackingResult {
  success: boolean;
  isNewView: boolean;
  viewCount: number;
}

/**
 * Generate a hash for anonymous users based on IP and User-Agent
 */
function generateUserHash(ipAddress: string, userAgent?: string): string {
  const data = `${ipAddress}:${userAgent || 'unknown'}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Track a view for a listing
 */
export async function trackListingView(
  listingId: string,
  userId?: string | null,
  ipAddress?: string,
  userAgent?: string,
  sellerId?: string
): Promise<ViewTrackingResult> {
  const valkey = getValkeyClient();
  
  // Don't count seller's own views
  if (userId && userId === sellerId) {
    const currentCount = await getListingViewCount(listingId);
    return {
      success: true,
      isNewView: false,
      viewCount: currentCount
    };
  }
  
  // Generate viewer identifier
  const viewerId = userId || generateUserHash(ipAddress || '0.0.0.0', userAgent);
  const rateLimitKey = `${VIEW_RATE_LIMIT_PREFIX}${listingId}:${viewerId}`;
  
  try {
    // Check rate limit
    const hasViewed = await valkey.get(rateLimitKey);
    if (hasViewed) {
      const currentCount = await getListingViewCount(listingId);
      return {
        success: true,
        isNewView: false,
        viewCount: currentCount
      };
    }
    
    // Set rate limit
    await valkey.setex(rateLimitKey, RATE_LIMIT_SECONDS, '1');
    
    // Increment view count
    const viewCountKey = `${VIEW_COUNT_PREFIX}${listingId}`;
    const newCount = await valkey.incr(viewCountKey);
    
    // Track unique viewer
    const uniqueViewersKey = `${UNIQUE_VIEWERS_PREFIX}${listingId}`;
    await valkey.sadd(uniqueViewersKey, viewerId);
    
    return {
      success: true,
      isNewView: true,
      viewCount: newCount
    };
  } catch (error) {
    logger.error('Error tracking listing view', error as Error, { userId: userId ?? undefined, metadata: { listingId } });
    return {
      success: false,
      isNewView: false,
      viewCount: 0
    };
  }
}

/**
 * Get the view count for a listing
 */
export async function getListingViewCount(listingId: string): Promise<number> {
  const valkey = getValkeyClient();
  const key = `${VIEW_COUNT_PREFIX}${listingId}`;
  
  try {
    const count = await valkey.get(key);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    logger.error('Error getting view count', error as Error, { metadata: { listingId } });
    return 0;
  }
}

/**
 * Get view counts for multiple listings in batch
 */
export async function getBatchViewCounts(listingIds: string[]): Promise<Map<string, number>> {
  if (listingIds.length === 0) {
    return new Map();
  }
  
  const valkey = getValkeyClient();
  const pipeline = valkey.pipeline();
  
  // Add all get commands to pipeline
  listingIds.forEach(id => {
    pipeline.get(`${VIEW_COUNT_PREFIX}${id}`);
  });
  
  try {
    const results = await pipeline.exec();
    const viewCounts = new Map<string, number>();
    
    if (results) {
      results.forEach((result, index) => {
        const listingId = listingIds[index];
        if (listingId) {
          const [error, value] = result;
          if (!error && value) {
            viewCounts.set(listingId, parseInt(value as string, 10));
          } else {
            viewCounts.set(listingId, 0);
          }
        }
      });
    }
    
    return viewCounts;
  } catch (error) {
    logger.error('Error getting batch view counts', error as Error, { metadata: { count: listingIds.length } });
    return new Map();
  }
}

/**
 * Get the number of unique viewers for a listing
 */
export async function getUniqueViewerCount(listingId: string): Promise<number> {
  const valkey = getValkeyClient();
  const key = `${UNIQUE_VIEWERS_PREFIX}${listingId}`;
  
  try {
    return await valkey.scard(key);
  } catch (error) {
    logger.error('Error getting unique viewer count', error as Error, { metadata: { listingId } });
    return 0;
  }
}

/**
 * Sync view counts to database (for background job)
 */
export async function syncViewCountsToDatabase(
  listingId: string,
  updateFn: (listingId: string, viewCount: number) => Promise<void>
): Promise<void> {
  try {
    const viewCount = await getListingViewCount(listingId);
    await updateFn(listingId, viewCount);
  } catch (error) {
    logger.error('Error syncing view count to database', error as Error, { metadata: { listingId } });
  }
}