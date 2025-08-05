import express from 'express';
import { createYoga, createSchema, YogaInitialContext } from 'graphql-yoga';
import cors from 'cors';
import { typeDefs } from '@gild/shared-schema';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prismaWrite, prismaRead } from './config/prisma';
import prisma from './config/prisma'; // Keep for backward compatibility
import prismaLogs from './config/prismaLogs';
import { searchListings } from './services/searchService';
import { ensureListingsIndex, indexListing } from './config/opensearch';
import { generateToken, verifyToken, hashPassword, comparePassword, extractTokenFromHeader } from './utils/auth';
import { moderateContent, updateListingStatus } from './utils/moderation';
import { 
  generateRegistrationOptionsForUser, 
  verifyRegistration,
  generateAuthenticationOptionsForUser,
  verifyAuthentication
} from './utils/webauthn';
import { inquiryResolvers } from './graphql/inquiryResolvers';
import { MIN_LISTING_IMAGES, MAX_LISTING_IMAGES } from './constants';
import { closeValkeyClient } from './utils/valkey';
import { 
  trackListingView, 
  getListingViewCount
} from './services/viewTrackingService';
import {
  generateVerificationToken,
  sendVerificationEmail,
  verifyEmailToken,
  resendVerificationEmail
} from './services/emailService';
import { ERROR_CODES } from './constants/errorCodes';
import { logger } from './services/loggingService';
import { logRetentionService } from './services/logRetentionService';
import { requestLoggingMiddleware, errorLoggingMiddleware } from './middleware/requestLogging';
import { cache } from './services/cacheService';

// Polyfill for Web Crypto API in Node.js
import { webcrypto } from 'crypto';
if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

// Context type
interface Context {
  userId: string | undefined;
  prisma: typeof prisma;
  prismaWrite: typeof prismaWrite;
  prismaRead: typeof prismaRead;
}

// Configure S3 client for Digital Ocean Spaces
const s3Client = new S3Client({
  endpoint: process.env['SPACES_ENDPOINT'] || 'https://sfo3.digitaloceanspaces.com',
  region: process.env['SPACES_REGION'] || 'sfo3',
  credentials: {
    accessKeyId: process.env['SPACES_ACCESS_KEY'] || '',
    secretAccessKey: process.env['SPACES_SECRET_KEY'] || '',
  },
});

// Safe user select to exclude password, email, and phone
const safeUserSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Full user select for authenticated user's own data
const fullUserSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;



const resolvers = {
  Query: {
    ...inquiryResolvers.Query,
    listings: async (_: any, args: { limit?: number | null; offset?: number | null; filters?: { latitude?: number; longitude?: number; radius?: number } | null }) => {
      const { limit, offset, filters } = args;
      
      // Return empty array if no location filters provided
      if (!filters?.latitude || !filters?.longitude || !filters?.radius) {
        return [];
      }

      // Create cache key based on query parameters
      const cacheKey = `listings:${JSON.stringify({ limit, offset, filters })}`;
      
      // Try to get from cache
      const cachedListings = await cache.get(cacheKey);
      if (cachedListings) {
        return cachedListings;
      }
      
      const where: any = {
        status: 'APPROVED',
      };
      
      // Add location filtering
      if (filters.latitude && filters.longitude && filters.radius) {
        // Convert radius from miles to degrees (approximate)
        const radiusInDegrees = filters.radius / 69;
        
        // Create a bounding box for initial filtering
        const minLat = filters.latitude - radiusInDegrees;
        const maxLat = filters.latitude + radiusInDegrees;
        const minLng = filters.longitude - radiusInDegrees;
        const maxLng = filters.longitude + radiusInDegrees;
        
        where.latitude = {
          gte: minLat,
          lte: maxLat,
          not: null
        };
        where.longitude = {
          gte: minLng,
          lte: maxLng,
          not: null
        };
      }
      
      const queryOptions: any = {
        where,
        orderBy: { createdAt: 'desc' },
        include: { 
          seller: {
            select: safeUserSelect
          }
        },
      };
      
      // Only add pagination options if they are actual numbers
      if (typeof limit === 'number') {
        queryOptions.take = limit;
      }
      if (typeof offset === 'number') {
        queryOptions.skip = offset;
      }
      
      let listings = await prismaRead.listing.findMany(queryOptions);
      
      // Filter by exact distance if location filter was applied
      if (filters?.latitude && filters?.longitude && filters?.radius) {
        const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
          const R = 3959; // Earth's radius in miles
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };
        
        listings = listings.filter((listing: any) => {
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
      
      // Convert dates to ISO strings
      const result = listings.map(listing => ({
        ...listing,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
      }));

      // Cache the results for 5 minutes
      await cache.set(cacheKey, result, { ttl: 300, tags: ['listings'] });

      return result;
    },
    
    listing: async (_: any, { id }: { id: string }) => {
      // Try cache first
      const cacheKey = `listing:${id}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const listing = await prismaRead.listing.findUnique({
        where: { id },
        include: { 
          seller: {
            select: safeUserSelect
          }
        },
      });
      
      if (!listing) return null;
      
      // Convert dates to ISO strings
      const result = {
        ...listing,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
      };

      // Cache for 10 minutes
      await cache.set(cacheKey, result, { ttl: 600, tags: ['listings', `listing:${id}`] });

      return result;
    },
    
    searchListings: async (_: any, args: { query: string; limit?: number | null; offset?: number | null; filters?: any }) => {
      const { query, limit, offset, filters } = args;
      
      // If query is empty or just whitespace, return empty results
      if (!query || !query.trim()) {
        return [];
      }
      
      try {
        const result = await searchListings({
          query,
          limit: typeof limit === 'number' ? limit : 20,
          offset: typeof offset === 'number' ? offset : 0,
          filters: filters ? {
            priceMin: filters.priceMin,
            priceMax: filters.priceMax,
            location: filters.location,
            latitude: filters.latitude,
            longitude: filters.longitude,
            radius: filters.radius,
            specifications: {
              ...(filters.yearMin && { year: { gte: filters.yearMin } }),
              ...(filters.yearMax && { year: { lte: filters.yearMax } }),
              ...(filters.make && { make: filters.make }),
              ...(filters.model && { model: filters.model })
            }
          } : undefined
        });
        
        return result.listings;
      } catch (error) {
        logger.error('Search failed', error as Error, { metadata: { query } });
        
        // Fallback to basic database search
        const where = {
          OR: [
            { title: { contains: query, mode: 'insensitive' as const } },
            { description: { contains: query, mode: 'insensitive' as const } },
          ],
        };
        
        const queryOptions: any = {
          where,
          orderBy: { createdAt: 'desc' },
          include: { 
            seller: {
              select: safeUserSelect
            }
          },
        };
        
        if (typeof limit === 'number') {
          queryOptions.take = limit;
        }
        if (typeof offset === 'number') {
          queryOptions.skip = offset;
        }
        
        const listings = await prismaRead.listing.findMany(queryOptions);
        
        return listings.map(listing => ({
          ...listing,
          createdAt: listing.createdAt.toISOString(),
          updatedAt: listing.updatedAt.toISOString(),
        }));
      }
    },
    
    user: async (_: any, { id }: { id: string }) => {
      return await prismaRead.user.findUnique({
        where: { id },
        select: safeUserSelect,
      });
    },
    
    me: async (_: any, __: any, context: YogaInitialContext & Context) => {
      if (!context.userId) return null;
      
      const user = await prismaRead.user.findUnique({
        where: { id: context.userId },
        select: fullUserSelect,
      });
      
      if (!user) return null;
      
      return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    },
    
    myListings: async (_: any, __: any, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        throw new Error('You must be logged in to view your listings');
      }
      
      const listings = await prismaRead.listing.findMany({
        where: {
          sellerId: context.userId,
        },
        include: { 
          seller: {
            select: safeUserSelect
          }
        },
        orderBy: { createdAt: 'desc' },
      });
      
      return listings.map(listing => ({
        ...listing,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
      }));
    },
  },
  
  Mutation: {
    ...inquiryResolvers.Mutation,
    
    trackListingView: async (_: any, { listingId }: { listingId: string }, context: YogaInitialContext & Context) => {
      try {
        // Get listing to check seller
        const listing = await prisma.listing.findUnique({
          where: { id: listingId },
          select: { sellerId: true }
        });
        
        if (!listing) {
          return {
            success: false,
            viewCount: 0
          };
        }
        
        // Get client info from request
        const request = context.request;
        const ipAddress = request.headers.get('x-forwarded-for') || 
                         request.headers.get('x-real-ip') || 
                         'unknown';
        const userAgent = request.headers.get('user-agent') || undefined;
        
        // Track the view
        const result = await trackListingView(
          listingId,
          context.userId,
          ipAddress,
          userAgent,
          listing.sellerId
        );
        
        return {
          success: result.success,
          viewCount: result.viewCount
        };
      } catch (error) {
        logger.error('Error in trackListingView mutation', error as Error, { metadata: { listingId } });
        return {
          success: false,
          viewCount: 0
        };
      }
    },
    createListing: async (_: any, { input }: { input: { title: string; description: string; price: number; images: string[]; city: string; state: string; latitude?: number; longitude?: number } }, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        throw new Error('You must be logged in to create a listing');
      }
      
      // Validate images
      if (!input.images || input.images.length < MIN_LISTING_IMAGES) {
        throw new Error(`A listing must have at least ${MIN_LISTING_IMAGES} images`);
      }
      
      if (input.images.length > MAX_LISTING_IMAGES) {
        throw new Error(`A listing cannot have more than ${MAX_LISTING_IMAGES} images`);
      }
      
      // Create listing with PENDING status by default
      const listing = await prismaWrite.listing.create({
        data: {
          ...input,
          seller: {
            connect: { id: context.userId }
          },
          status: 'PENDING',
        },
        include: { 
          seller: {
            select: safeUserSelect
          }
        },
      });
      
      // Perform content moderation asynchronously
      moderateContent(input.title, input.description).then(async (isApproved) => {
        await updateListingStatus(listing.id, isApproved);
        
        // If approved, add to search index
        if (isApproved) {
          try {
            // Fetch the full listing with seller info for indexing
            const fullListing = await prisma.listing.findUnique({
              where: { id: listing.id },
              include: { 
                seller: {
                  select: safeUserSelect
                }
              },
            });
            if (fullListing) {
              await indexListing(fullListing);
            }
          } catch (error) {
            logger.error('Error indexing listing', error as Error, { metadata: { listingId: listing.id } });
          }
        }
      }).catch(error => {
        logger.error('Error in content moderation', error as Error, { metadata: { listingId: listing.id } });
        // Default to approved if moderation fails
        updateListingStatus(listing.id, true);
      });
      
      // Invalidate listings cache
      await cache.invalidateTag('listings');

      return {
        ...listing,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
      };
    },
    
    generateUploadUrl: async (_: any, { filename, contentType, fileSize }: { filename: string; contentType: string; fileSize?: number }, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        throw new Error('You must be logged in to upload files');
      }
      
      // Validate content type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(contentType)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      }
      
      // Validate file size (10MB limit)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (fileSize && fileSize > MAX_FILE_SIZE) {
        throw new Error('File size exceeds the maximum limit of 10MB.');
      }
      
      // Generate unique key for the file
      const timestamp = Date.now();
      const key = `listings/${context.userId}/${timestamp}-${filename}`;
      
      const bucketName = process.env['SPACES_BUCKET'] || 'gild';
      
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read',
        ContentLength: fileSize, // Add content length constraint
      });
      
      try {
        const signedUrl = await getSignedUrl(s3Client, command, { 
          expiresIn: 900, // 15 minutes
          signableHeaders: new Set(['x-amz-acl'])
        });
        
        return {
          url: signedUrl,
          key: key,
        };
      } catch (error) {
        logger.error('Error generating upload URL', error as Error, { userId: context.userId });
        throw new Error('Failed to generate upload URL');
      }
    },
    
    generateAvatarUploadUrl: async (_: any, { filename, contentType, fileSize }: { filename: string; contentType: string; fileSize?: number }, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        throw new Error('You must be logged in to upload an avatar');
      }
      
      // Validate content type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(contentType)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      }
      
      // Validate file size (5MB limit for avatars)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (fileSize && fileSize > MAX_FILE_SIZE) {
        throw new Error('File size exceeds the maximum limit of 5MB for avatars.');
      }
      
      // Generate unique key for the avatar
      const timestamp = Date.now();
      const key = `avatars/${context.userId}/${timestamp}-${filename}`;
      
      const bucketName = process.env['SPACES_BUCKET'] || 'gild';
      
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read',
        ContentLength: fileSize, // Add content length constraint
      });
      
      try {
        const signedUrl = await getSignedUrl(s3Client, command, { 
          expiresIn: 900, // 15 minutes
          signableHeaders: new Set(['x-amz-acl'])
        });
        
        return {
          url: signedUrl,
          key: key,
        };
      } catch (error) {
        logger.error('Error generating avatar upload URL', error as Error, { userId: context.userId });
        throw new Error('Failed to generate avatar upload URL');
      }
    },
    
    updateListing: async (_: any, { id, input }: { id: string; input: any }, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        throw new Error('You must be logged in to update a listing');
      }
      
      // Check ownership
      const listing = await prisma.listing.findUnique({
        where: { id },
        select: { sellerId: true },
      });
      
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      if (listing.sellerId !== context.userId) {
        throw new Error('You can only update your own listings');
      }
      
      // Validate images if provided
      if (input.images) {
        if (input.images.length < MIN_LISTING_IMAGES) {
          throw new Error(`A listing must have at least ${MIN_LISTING_IMAGES} images`);
        }
        
        if (input.images.length > MAX_LISTING_IMAGES) {
          throw new Error(`A listing cannot have more than ${MAX_LISTING_IMAGES} images`);
        }
      }
      
      const updatedListing = await prismaWrite.listing.update({
        where: { id },
        data: input,
        include: { 
          seller: {
            select: safeUserSelect
          }
        },
      });
      
      // Invalidate caches
      await cache.invalidateTag('listings');
      await cache.invalidateTag(`listing:${id}`);
      await cache.delete(`listing:${id}`);

      return {
        ...updatedListing,
        createdAt: updatedListing.createdAt.toISOString(),
        updatedAt: updatedListing.updatedAt.toISOString(),
      };
    },
    
    deleteListing: async (_: any, { id }: { id: string }, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        throw new Error('You must be logged in to delete a listing');
      }
      
      // Check ownership
      const listing = await prisma.listing.findUnique({
        where: { id },
        select: { sellerId: true },
      });
      
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      if (listing.sellerId !== context.userId) {
        throw new Error('You can only delete your own listings');
      }
      
      await prismaWrite.listing.delete({
        where: { id },
      });
      
      // Invalidate caches
      await cache.invalidateTag('listings');
      await cache.invalidateTag(`listing:${id}`);
      await cache.delete(`listing:${id}`);
      
      return true;
    },
    
    register: async (_: any, { input }: { input: { email: string; password: string; name: string; phone?: string } }) => {
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });
      
      if (existingUser) {
        return {
          token: null,
          user: null,
          errors: [{
            field: 'email',
            message: 'An account with this email already exists',
            code: ERROR_CODES.USER_ALREADY_EXISTS
          }]
        };
      }

      // Check if there's already a pending user
      const existingPendingUser = await prisma.pendingUser.findUnique({
        where: { email: input.email },
      });

      if (existingPendingUser) {
        // Delete the old pending user if it exists
        await prisma.pendingUser.delete({
          where: { id: existingPendingUser.id },
        });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(input.password);
      
      // Generate verification token
      const token = await generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Create pending user
      await prisma.pendingUser.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
          phone: input.phone,
          token,
          expiresAt,
        },
      });
      
      // Send verification email
      await sendVerificationEmail({
        email: input.email,
        name: input.name,
        token,
      });
      
      
      // Return null token and user to indicate email verification is required
      return {
        token: null,
        user: null,
      };
    },
    
    login: async (_: any, { input }: { input: { email: string; password: string } }) => {
      // Import rate limit service
      const { checkRateLimit, RATE_LIMITS } = await import('./services/rateLimitService');
      
      // Rate limit login attempts
      const loginRateLimit = await checkRateLimit(input.email.toLowerCase(), RATE_LIMITS.LOGIN);
      if (!loginRateLimit.allowed) {
        return {
          token: null,
          user: null,
          errors: [{
            field: 'email',
            message: `Too many login attempts. Please wait ${loginRateLimit.retryAfter} seconds.`,
            code: 'RATE_LIMIT_EXCEEDED'
          }]
        };
      }
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });
      
      if (!user) {
        // Check if there's a pending user with this email
        const pendingUser = await prisma.pendingUser.findUnique({
          where: { email: input.email },
        });
        
        if (pendingUser) {
          // Return error to indicate email verification is required
          return {
            token: null,
            user: null,
            errors: [{
              field: 'email',
              message: 'Please verify your email before signing in',
              code: ERROR_CODES.EMAIL_NOT_VERIFIED
            }]
          };
        }
        
        return {
          token: null,
          user: null,
          errors: [{
            field: 'email',
            message: 'Invalid email or password',
            code: ERROR_CODES.INVALID_CREDENTIALS
          }]
        };
      }
      
      // Check password
      const validPassword = await comparePassword(input.password, user.password);
      
      if (!validPassword) {
        return {
          token: null,
          user: null,
          errors: [{
            field: 'password',
            message: 'Invalid email or password',
            code: ERROR_CODES.INVALID_CREDENTIALS
          }]
        };
      }
      
      // Generate token
      const token = generateToken(user.id);
      
      // Exclude password from the response
      const { password, ...userWithoutPassword } = user;
      
      return {
        token,
        user: {
          ...userWithoutPassword,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      };
    },
    
    refreshToken: async (_: any, __: any, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        throw new Error('You must be logged in to refresh token');
      }
      
      // Get the user
      const user = await prisma.user.findUnique({
        where: { id: context.userId },
        select: fullUserSelect,
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Generate new token
      const token = generateToken(user.id);
      
      return {
        token,
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      };
    },
    
    updateProfile: async (_: any, { input }: { input: { name?: string; phone?: string; avatarUrl?: string } }, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        throw new Error('You must be logged in to update your profile');
      }
      
      const user = await prisma.user.update({
        where: { id: context.userId },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.phone !== undefined && { phone: input.phone }),
          ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
        },
        select: fullUserSelect,
      });
      
      return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    },

    // Passkey operations
    createPasskeyRegistrationOptions: async (_: any, __: any, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        return {
          token: null,
          user: null,
          publicKey: null,
          errors: [{
            field: 'auth',
            message: 'You must be logged in to register a passkey',
            code: ERROR_CODES.UNAUTHORIZED
          }]
        };
      }

      const user = await prisma.user.findUnique({
        where: { id: context.userId },
      });

      if (!user) {
        return {
          token: null,
          user: null,
          publicKey: null,
          errors: [{
            field: 'user',
            message: 'User not found',
            code: ERROR_CODES.NOT_FOUND
          }]
        };
      }

      const options = await generateRegistrationOptionsForUser(user.id, user.email, user.name);
      
      return {
        token: null,
        user: null,
        publicKey: JSON.stringify(options),
        errors: null
      };
    },

    verifyPasskeyRegistration: async (_: any, { input }: { input: { response: string; name?: string } }, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        throw new Error('You must be logged in to register a passkey');
      }

      const parsedResponse = JSON.parse(input.response);
      const verification = await verifyRegistration(context.userId, parsedResponse);

      if (!verification.verified || !verification.registrationInfo) {
        throw new Error('Passkey registration failed');
      }

      const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
      const { publicKey: credentialPublicKey, id: credentialID, counter } = credential;

      // SimpleWebAuthn v13+ returns credentialID as a base64url string
      // We'll use it directly without any conversion
      
      // Save the passkey to database
      const passkey = await prisma.passkey.create({
        data: {
          userId: context.userId,
          credentialId: credentialID,
          credentialPublicKey: credentialPublicKey,
          counter: BigInt(counter),
          deviceType: credentialDeviceType,
          backedUp: credentialBackedUp,
          transports: parsedResponse.response.transports || [],
          name: input.name || `Passkey ${new Date().toLocaleDateString()}`,
        },
      });

      return {
        id: passkey.id,
        name: passkey.name,
        createdAt: passkey.createdAt.toISOString(),
        lastUsedAt: passkey.lastUsedAt?.toISOString() || null,
      };
    },

    createPasskeyAuthenticationOptions: async (_: any, { email }: { email: string }) => {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { passkeys: true },
      });

      if (!user) {
        return {
          token: null,
          user: null,
          publicKey: null,
          errors: [{
            field: 'email',
            message: 'No account found. Please create one first.',
            code: ERROR_CODES.NOT_FOUND
          }]
        };
      }
      
      if (user.passkeys.length === 0) {
        return {
          token: null,
          user: null,
          publicKey: null,
          errors: [{
            field: 'passkey',
            message: 'No passkeys found. Please use password.',
            code: ERROR_CODES.NOT_FOUND
          }]
        };
      }

      const allowCredentials = user.passkeys.map(passkey => ({
        id: passkey.credentialId,
        transports: passkey.transports,
      }));

      const options = await generateAuthenticationOptionsForUser(user.id, allowCredentials);

      return {
        token: null,
        user: null,
        publicKey: JSON.stringify(options),
        errors: null
      };
    },

    verifyPasskeyAuthentication: async (_: any, { input }: { input: { email: string; response: string } }) => {
      const parsedResponse = JSON.parse(input.response);
      
      const user = await prisma.user.findUnique({
        where: { email: input.email },
        include: { passkeys: true },
      });

      if (!user) {
        return {
          token: null,
          user: null,
          errors: [{
            field: 'email',
            message: 'User not found',
            code: ERROR_CODES.NOT_FOUND
          }]
        };
      }

      // Find the passkey used
      const passkey = user.passkeys.find(pk => pk.credentialId === parsedResponse.id);
      
      if (!passkey) {
        return {
          token: null,
          user: null,
          errors: [{
            field: 'passkey',
            message: 'Passkey not found',
            code: ERROR_CODES.NOT_FOUND
          }]
        };
      }

      const verification = await verifyAuthentication(
        user.id,
        parsedResponse,
        Buffer.from(passkey.credentialPublicKey),
        passkey.counter
      );

      if (!verification.verified) {
        return {
          token: null,
          user: null,
          errors: [{
            field: 'passkey',
            message: 'Authentication failed',
            code: ERROR_CODES.INVALID_CREDENTIALS
          }]
        };
      }

      // Update counter and last used
      await prisma.passkey.update({
        where: { id: passkey.id },
        data: {
          counter: BigInt(verification.authenticationInfo.newCounter),
          lastUsedAt: new Date(),
        },
      });

      // Generate JWT token
      const token = generateToken(user.id);
      
      // Exclude password and passkeys from the response
      const { password, passkeys, ...userWithoutPassword } = user;

      return {
        token,
        user: {
          ...userWithoutPassword,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      };
    },

    deletePasskey: async (_: any, { id }: { id: string }, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        throw new Error('You must be logged in to delete a passkey');
      }

      const passkey = await prisma.passkey.findUnique({
        where: { id },
      });

      if (!passkey || passkey.userId !== context.userId) {
        throw new Error('Passkey not found');
      }

      await prisma.passkey.delete({
        where: { id },
      });

      return true;
    },

    // Passkey-first registration
    startPasskeyRegistration: async (_: any, { email, name }: { email: string; name: string }) => {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return {
          token: null,
          user: null,
          publicKey: null,
          errors: [{
            field: 'email',
            message: 'An account with this email already exists',
            code: ERROR_CODES.USER_ALREADY_EXISTS
          }]
        };
      }

      // Create a temporary user ID for the registration process
      // Use a consistent ID based on email so we can retrieve the challenge later
      const tempUserId = `temp_${email}`;
      
      // Generate registration options
      const options = await generateRegistrationOptionsForUser(tempUserId, email, name);
      
      return {
        token: null,
        user: null,
        publicKey: JSON.stringify(options),
        errors: null
      };
    },

    completePasskeyRegistration: async (_: any, { input }: { input: { email: string; name: string; response: string; passkeyName?: string } }) => {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        return {
          publicKey: null,
          errors: [{
            field: 'email',
            message: 'An account with this email already exists',
            code: ERROR_CODES.USER_ALREADY_EXISTS
          }]
        };
      }

      // Check if there's already a pending user
      const existingPendingUser = await prisma.pendingUser.findUnique({
        where: { email: input.email },
      });

      if (existingPendingUser) {
        // Delete the old pending user if it exists
        await prisma.pendingUser.delete({
          where: { id: existingPendingUser.id },
        });
      }

      // Use the same temporary user ID that was used in startPasskeyRegistration
      const tempUserId = `temp_${input.email}`;
      
      // Verify the registration
      const parsedResponse = JSON.parse(input.response);
      const verification = await verifyRegistration(tempUserId, parsedResponse);

      if (!verification.verified || !verification.registrationInfo) {
        throw new Error('Passkey registration failed');
      }

      const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
      const { publicKey: credentialPublicKey, id: credentialID, counter } = credential;

      // Generate verification token
      const token = await generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Create a random password for the pending user
      const randomPassword = await hashPassword(Math.random().toString(36).slice(-12));
      
      // Create pending user with passkey data
      await prisma.pendingUser.create({
        data: {
          email: input.email,
          password: randomPassword,
          name: input.name,
          token,
          expiresAt,
          passkeyData: {
            credentialId: credentialID,
            credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64'),
            counter: counter.toString(),
            deviceType: credentialDeviceType,
            backedUp: credentialBackedUp,
            transports: parsedResponse.response.transports || [],
            name: input.passkeyName || `Passkey ${new Date().toLocaleDateString()}`,
          },
        },
      });
      
      // Send verification email
      await sendVerificationEmail({
        email: input.email,
        name: input.name,
        token,
      });

      // Return null token and user to indicate email verification is required
      return {
        token: null,
        user: null,
      };
    },

    verifyEmail: async (_: any, { token }: { token: string }) => {
      const userId = await verifyEmailToken(token);
      
      if (!userId) {
        return {
          token: null,
          user: null,
          errors: [{
            field: 'token',
            message: 'Invalid or expired verification token',
            code: ERROR_CODES.INVALID_VERIFICATION_TOKEN
          }]
        };
      }
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: fullUserSelect,
      });
      
      if (!user) {
        return {
          token: null,
          user: null,
          errors: [{
            field: 'token',
            message: 'User not found',
            code: ERROR_CODES.NOT_FOUND
          }]
        };
      }
      
      // Generate token
      const authToken = generateToken(user.id);
      
      return {
        token: authToken,
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      };
    },

    resendVerificationEmail: async (_: any, { email }: { email: string }) => {
      try {
        await resendVerificationEmail(email);
        return true;
      } catch (error) {
        logger.error('Error resending verification email', error as Error, { metadata: { email } });
        return false;
      }
    },

    requestPasswordReset: async (_: any, { email }: { email: string }, context: YogaInitialContext & Context) => {
      const { requestPasswordReset } = await import('./services/passwordResetService');
      
      // Get IP address from request
      const request = context.request;
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       request.headers.get('cf-connecting-ip') || // Cloudflare
                       'unknown';
      
      return await requestPasswordReset(email, ipAddress);
    },

    resetPassword: async (_: any, { token, newPassword }: { token: string; newPassword: string }) => {
      const { resetPassword } = await import('./services/passwordResetService');
      return await resetPassword(token, newPassword);
    },

    validatePasswordResetToken: async (_: any, { token }: { token: string }) => {
      const { validatePasswordResetToken } = await import('./services/passwordResetService');
      return await validatePasswordResetToken(token);
    },

    createPasskeyWithResetToken: async (_: any, { resetToken }: { resetToken: string }) => {
      const { validatePasswordResetToken } = await import('./services/passwordResetService');
      
      // Validate the reset token first
      const validation = await validatePasswordResetToken(resetToken);
      
      if (!validation.valid || !validation.user) {
        return {
          publicKey: null,
          user: null,
          errors: validation.errors
        };
      }
      
      // Generate passkey registration options for this user
      const options = await generateRegistrationOptionsForUser(
        validation.user.id,
        validation.user.email,
        validation.user.name
      );
      
      return {
        publicKey: JSON.stringify(options),
        user: validation.user,
        errors: []
      };
    },

    verifyPasskeyWithResetToken: async (_: any, { resetToken, response, name }: { resetToken: string; response: string; name?: string }) => {
      const { validatePasswordResetToken } = await import('./services/passwordResetService');
      
      // Validate the reset token first
      const validation = await validatePasswordResetToken(resetToken);
      
      if (!validation.valid || !validation.user) {
        return {
          token: null,
          user: null,
          errors: validation.errors
        };
      }
      
      try {
        // Verify the passkey registration
        const verification = await verifyRegistration(
          validation.user.id,
          JSON.parse(response)
        );
        
        if (!verification.verified || !verification.registrationInfo) {
          return {
            token: null,
            user: null,
            errors: [{
              field: 'passkey',
              message: 'Failed to verify passkey',
              code: 'VERIFICATION_FAILED'
            }]
          };
        }
        
        // Mark the reset token as used
        await prisma.passwordResetToken.update({
          where: { token: resetToken },
          data: { usedAt: new Date() }
        });
        
        // Extract properties from registrationInfo
        const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
        const { publicKey: credentialPublicKey, id: credentialID, counter } = credential;
        
        // Save the passkey
        await prisma.passkey.create({
          data: {
            userId: validation.user.id,
            credentialId: credentialID,
            credentialPublicKey: credentialPublicKey,
            counter: BigInt(counter),
            deviceType: credentialDeviceType,
            backedUp: credentialBackedUp,
            transports: JSON.parse(response).response.transports || [],
            name: name || `Passkey ${new Date().toLocaleDateString()}`,
          },
        });
        
        // Generate auth token
        const authToken = generateToken(validation.user.id);
        
        return {
          token: authToken,
          user: validation.user,
          errors: []
        };
      } catch (error: any) {
        logger.error('Failed to verify passkey with reset token', error, { 
          metadata: { userId: validation.user.id } 
        });
        
        return {
          token: null,
          user: null,
          errors: [{
            field: 'passkey',
            message: 'Failed to add passkey',
            code: 'PASSKEY_ERROR'
          }]
        };
      }
    },
  },
  
  // Field resolvers
  Listing: {
    createdAt: (parent: any) => {
      // If it's already a Date object, convert to ISO string
      if (parent.createdAt instanceof Date) {
        return parent.createdAt.toISOString();
      }
      // If it's a timestamp, convert to Date first
      if (typeof parent.createdAt === 'number') {
        return new Date(parent.createdAt).toISOString();
      }
      if (typeof parent.createdAt === 'string' && /^\d+$/.test(parent.createdAt)) {
        return new Date(parseInt(parent.createdAt)).toISOString();
      }
      return parent.createdAt;
    },
    updatedAt: (parent: any) => {
      // If it's already a Date object, convert to ISO string
      if (parent.updatedAt instanceof Date) {
        return parent.updatedAt.toISOString();
      }
      // If it's a timestamp, convert to Date first
      if (typeof parent.updatedAt === 'number') {
        return new Date(parent.updatedAt).toISOString();
      }
      if (typeof parent.updatedAt === 'string' && /^\d+$/.test(parent.updatedAt)) {
        return new Date(parseInt(parent.updatedAt)).toISOString();
      }
      return parent.updatedAt;
    },
    ...inquiryResolvers.Listing,
    viewCount: async (parent: any) => {
      return await getListingViewCount(parent.id);
    },
  },
  User: {
    createdAt: (parent: any) => {
      // If it's already a Date object, convert to ISO string
      if (parent.createdAt instanceof Date) {
        return parent.createdAt.toISOString();
      }
      // If it's a timestamp, convert to Date first
      if (typeof parent.createdAt === 'number' || typeof parent.createdAt === 'string') {
        return new Date(parent.createdAt).toISOString();
      }
      return parent.createdAt;
    },
    updatedAt: (parent: any) => {
      // If it's already a Date object, convert to ISO string
      if (parent.updatedAt instanceof Date) {
        return parent.updatedAt.toISOString();
      }
      // If it's a timestamp, convert to Date first
      if (typeof parent.updatedAt === 'number' || typeof parent.updatedAt === 'string') {
        return new Date(parent.updatedAt).toISOString();
      }
      return parent.updatedAt;
    },
    passkeys: async (parent: any) => {
      const passkeys = await prisma.passkey.findMany({
        where: { userId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
      
      return passkeys.map(passkey => ({
        id: passkey.id,
        name: passkey.name,
        createdAt: passkey.createdAt.toISOString(),
        lastUsedAt: passkey.lastUsedAt?.toISOString() || null,
      }));
    },
  },
  Inquiry: {
    ...inquiryResolvers.Inquiry,
    createdAt: (parent: any) => parent.createdAt.toISOString(),
    updatedAt: (parent: any) => parent.updatedAt.toISOString(),
    respondedAt: (parent: any) => parent.respondedAt?.toISOString() || null,
  },
};

async function startServer(): Promise<void> {
  // Test database connection
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed', error as Error);
    throw error;
  }

  // Initialize OpenSearch index
  try {
    await ensureListingsIndex();
    logger.info('OpenSearch index initialized');
  } catch (error) {
    logger.warn('OpenSearch initialization failed, will use database fallback', { metadata: { error: error instanceof Error ? error.message : String(error) } });
  }
  
  const app = express();
  
  // Configure CORS for production and development
  const corsOptions = {
    origin: process.env['NODE_ENV'] === 'production' 
      ? ['https://thegild.app', 'https://www.thegild.app']
      : true, // Allow all origins in development
    credentials: true,
  };
  
  app.use(cors(corsOptions));
  app.use(requestLoggingMiddleware);
  
  // Start log processing
  logger.startProcessing();
  
  const schema = createSchema({
    typeDefs,
    resolvers,
  });
  
  const yoga = createYoga({
    schema,
    graphqlEndpoint: '/graphql',
    cors: {
      origin: process.env['NODE_ENV'] === 'production' 
        ? ['https://thegild.app', 'https://www.thegild.app']
        : '*', // Allow all origins in development
      credentials: true,
    },
    context: async (initialContext) => {
      // Extract token from Authorization header
      const token = extractTokenFromHeader(initialContext.request.headers.get('authorization') || undefined);
      
      let userId: string | undefined;
      
      if (token) {
        try {
          const payload = verifyToken(token);
          userId = payload.userId;
        } catch (error) {
          // Invalid token, continue without user context
        }
      }
      
      return {
        ...initialContext,
        userId,
        prisma, // Keep for backward compatibility
        prismaWrite,
        prismaRead,
      };
    },
  });
  
  app.use('/graphql', yoga);
  app.use(errorLoggingMiddleware);

  const PORT = Number(process.env['PORT']) || 4000;
  const HOST = process.env['HOST'] || '0.0.0.0';
  
  app.listen(PORT, HOST, () => {
    logger.info('Server ready', { 
      metadata: {
        host: HOST, 
        port: PORT, 
        endpoint: `http://${HOST}:${PORT}/graphql`
      }
    });

    // Start log retention service
    logRetentionService.startRetentionJob();
    logger.info('Log retention service initialized');
  });
}

startServer().catch(error => {
  logger.error('Error starting server', error as Error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  logRetentionService.stopRetentionJob();
  logger.stopProcessing();
  await prisma.$disconnect();
  await prismaLogs.$disconnect();
  await closeValkeyClient();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  logRetentionService.stopRetentionJob();
  logger.stopProcessing();
  await prisma.$disconnect();
  await prismaLogs.$disconnect();
  await closeValkeyClient();
  process.exit(0);
});