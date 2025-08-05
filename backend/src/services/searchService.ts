import client, { LISTINGS_INDEX, isOpenSearchAvailable } from '../config/opensearch';
import prisma from '../config/prisma';
import { logger } from './loggingService';

// Safe user select to exclude password, email, and phone
const safeUserSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
  filters?: {
    priceMin?: number;
    priceMax?: number;
    location?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    specifications?: Record<string, any>;
  };
}

export interface SearchResult {
  listings: any[];
  total: number;
  took: number;
}

export async function searchListings(options: SearchOptions): Promise<SearchResult> {

  // Try OpenSearch first, fallback to database search
  const useOpenSearch = await isOpenSearchAvailable();
  
  if (useOpenSearch) {
    try {
      return await searchWithOpenSearch(options);
    } catch (error) {
      logger.warn('OpenSearch failed, falling back to database', { metadata: { error: error instanceof Error ? error.message : String(error), query: options.query } });
      return await searchWithDatabase(options);
    }
  } else {
    return await searchWithDatabase(options);
  }
}

async function searchWithOpenSearch(options: SearchOptions): Promise<SearchResult> {
  const { query, limit = 20, offset = 0, filters } = options;

  // Build OpenSearch query
  const searchBody: any = {
    query: {
      bool: {
        must: [],
        filter: []
      }
    },
    from: offset,
    size: limit,
    sort: [
      { _score: { order: 'desc' } },
      { createdAt: { order: 'desc' } }
    ]
  };

  // Add text search
  if (query && query.trim()) {
    searchBody.query.bool.must.push({
      multi_match: {
        query: query.trim(),
        fields: [
          'title^3',
          'description^2',
          'city',
          'seller.name'
        ],
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    });
  } else {
    // If no query, return no results
    return {
      listings: [],
      total: 0,
      took: 0
    };
  }

  // Add price range filter
  if (filters?.priceMin || filters?.priceMax) {
    const priceFilter: any = { range: { price: {} } };
    if (filters.priceMin) priceFilter.range.price.gte = filters.priceMin;
    if (filters.priceMax) priceFilter.range.price.lte = filters.priceMax;
    searchBody.query.bool.filter.push(priceFilter);
  }

  // Add location filter
  if (filters?.location) {
    searchBody.query.bool.filter.push({
      multi_match: {
        query: filters.location,
        fields: ['city', 'state'],
        type: 'phrase_prefix'
      }
    });
  }

  // Add geospatial filter
  if (filters?.latitude && filters?.longitude && filters?.radius) {
    searchBody.query.bool.filter.push({
      geo_distance: {
        distance: `${filters.radius}mi`,
        location: {
          lat: filters.latitude,
          lon: filters.longitude
        }
      }
    });
  }

  // Only show approved listings
  searchBody.query.bool.filter.push({
    term: { status: 'APPROVED' }
  });

  // Add specification filters
  if (filters?.specifications) {
    Object.entries(filters.specifications).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && (value.gte || value.lte)) {
          // Handle range queries (like year)
          const rangeFilter: any = { range: { [`specifications.${key}`]: {} } };
          if (value.gte) rangeFilter.range[`specifications.${key}`].gte = value.gte;
          if (value.lte) rangeFilter.range[`specifications.${key}`].lte = value.lte;
          searchBody.query.bool.filter.push(rangeFilter);
        } else {
          // Handle exact match
          searchBody.query.bool.filter.push({
            term: { [`specifications.${key}`]: value }
          });
        }
      }
    });
  }


  // Execute search
  const response: any = await client.search({
    index: LISTINGS_INDEX,
    body: searchBody
  });


  const hits = response.body.hits.hits;
  const total = typeof response.body.hits.total === 'object' 
    ? response.body.hits.total.value 
    : response.body.hits.total || 0;
  const took = response.body.took;

  // Extract listing IDs and fetch full data from database
  const listingIds = hits.map((hit: any) => hit._source.id);
  
  if (listingIds.length === 0) {
    return { listings: [], total: 0, took };
  }

  // Fetch full listing data from database to ensure consistency
  const listings = await prisma.listing.findMany({
    where: {
      id: { in: listingIds }
    },
    include: { 
      seller: {
        select: safeUserSelect
      }
    },
    orderBy: [
      // Maintain OpenSearch score order by using the original order
      { createdAt: 'desc' }
    ]
  });

  // Reorder listings to match OpenSearch score order
  const orderedListings = listingIds
    .map((id: string) => listings.find((listing: any) => listing.id === id))
    .filter(Boolean);

  return {
    listings: orderedListings.map((listing: any) => ({
      ...listing,
      createdAt: listing!.createdAt.toISOString(),
      updatedAt: listing!.updatedAt.toISOString(),
    })),
    total,
    took
  };
}

async function searchWithDatabase(options: SearchOptions): Promise<SearchResult> {
  const { query, limit = 20, offset = 0, filters } = options;

  const where: any = {
    AND: [
      // Only show approved listings
      { status: 'APPROVED' }
    ]
  };

  // Add text search
  if (query && query.trim()) {
    where.AND.push({
      OR: [
        { title: { contains: query.trim(), mode: 'insensitive' } },
        { description: { contains: query.trim(), mode: 'insensitive' } },
        { city: { contains: query.trim(), mode: 'insensitive' } },
        { state: { contains: query.trim(), mode: 'insensitive' } }
      ]
    });
  } else {
    // If no query, return no results
    return {
      listings: [],
      total: 0,
      took: 0
    };
  }

  // Add price range filter
  if (filters?.priceMin || filters?.priceMax) {
    const priceFilter: any = {};
    if (filters.priceMin) priceFilter.gte = filters.priceMin;
    if (filters.priceMax) priceFilter.lte = filters.priceMax;
    where.AND.push({ price: priceFilter });
  }

  // Add location filter
  if (filters?.location) {
    where.AND.push({
      OR: [
        { city: { contains: filters.location, mode: 'insensitive' } },
        { state: { contains: filters.location, mode: 'insensitive' } }
      ]
    });
  }

  // Add geospatial filter using Haversine formula for distance calculation
  if (filters?.latitude && filters?.longitude && filters?.radius) {
    // Convert radius from miles to degrees (approximate)
    // 1 degree of latitude ≈ 69 miles
    const radiusInDegrees = filters.radius / 69;
    
    // Create a bounding box for initial filtering (more efficient)
    const minLat = filters.latitude - radiusInDegrees;
    const maxLat = filters.latitude + radiusInDegrees;
    const minLng = filters.longitude - radiusInDegrees;
    const maxLng = filters.longitude + radiusInDegrees;
    
    where.AND.push({
      latitude: {
        gte: minLat,
        lte: maxLat,
        not: null
      },
      longitude: {
        gte: minLng,
        lte: maxLng,
        not: null
      }
    });
  }

  const startTime = Date.now();

  // Get listings
  const listings = await prisma.listing.findMany({
    where,
    include: { 
      seller: {
        select: safeUserSelect
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit
  });

  const took = Date.now() - startTime;

  // Filter by exact distance if geospatial filter was applied
  let filteredListings = listings;
  if (filters?.latitude && filters?.longitude && filters?.radius) {
    filteredListings = listings.filter((listing: any) => {
      if (!listing.latitude || !listing.longitude) return false;
      const distance = calculateDistance(
        filters.latitude!,
        filters.longitude!,
        listing.latitude,
        listing.longitude
      );
      return distance <= filters.radius!;
    });
  }

  return {
    listings: filteredListings.map((listing: any) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
    })),
    total: filteredListings.length,
    took
  };
}

// Helper function to suggest search terms
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
  if (!query || query.length < 2) return [];

  const useOpenSearch = await isOpenSearchAvailable();

  if (useOpenSearch) {
    try {
      const response: any = await client.search({
        index: LISTINGS_INDEX,
        body: {
          suggest: {
            title_suggest: {
              prefix: query,
              completion: {
                field: 'title.suggest',
                size: limit
              }
            }
          },
          _source: false,
          size: 0
        }
      });

      const suggestions = response.body.suggest?.title_suggest?.[0]?.options;
      if (Array.isArray(suggestions)) {
        return suggestions.map((option: any) => option.text);
      }
      return [];
    } catch (error) {
      logger.warn('OpenSearch suggestions failed', { metadata: { error: error instanceof Error ? error.message : String(error), query } });
    }
  }

  // Fallback to simple database search for suggestions
  const suggestions = await prisma.listing.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    },
    select: { title: true },
    take: limit
  });

  return suggestions.map((s: any) => s.title);
}