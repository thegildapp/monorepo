import express from 'express';
import { createYoga, createSchema, YogaInitialContext } from 'graphql-yoga';
import cors from 'cors';
import { typeDefs } from '@gild/shared-schema';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import prisma from './config/prisma';
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

// Polyfill for Web Crypto API in Node.js
import { webcrypto } from 'crypto';
if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

// Context type
interface Context {
  userId: string | undefined;
  prisma: typeof prisma;
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
      
      let listings = await prisma.listing.findMany(queryOptions);
      
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
      return listings.map(listing => ({
        ...listing,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
      }));
    },
    
    listing: async (_: any, { id }: { id: string }) => {
      const listing = await prisma.listing.findUnique({
        where: { id },
        include: { 
          seller: {
            select: safeUserSelect
          }
        },
      });
      
      if (!listing) return null;
      
      // Convert dates to ISO strings
      return {
        ...listing,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
      };
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
        
        console.log(`Search completed in ${result.took}ms, found ${result.total} results`);
        return result.listings;
      } catch (error) {
        console.error('Search failed:', error);
        
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
        
        const listings = await prisma.listing.findMany(queryOptions);
        
        return listings.map(listing => ({
          ...listing,
          createdAt: listing.createdAt.toISOString(),
          updatedAt: listing.updatedAt.toISOString(),
        }));
      }
    },
    
    user: async (_: any, { id }: { id: string }) => {
      return await prisma.user.findUnique({
        where: { id },
        select: safeUserSelect,
      });
    },
    
    me: async (_: any, __: any, context: YogaInitialContext & Context) => {
      if (!context.userId) return null;
      
      const user = await prisma.user.findUnique({
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
      
      const listings = await prisma.listing.findMany({
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
        console.error('Error in trackListingView mutation:', error);
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
      
      // Create listing with PENDING status by default
      const listing = await prisma.listing.create({
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
            console.error('Error indexing listing:', error);
          }
        }
      }).catch(error => {
        console.error('Error in content moderation:', error);
        // Default to approved if moderation fails
        updateListingStatus(listing.id, true);
      });
      
      return {
        ...listing,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
      };
    },
    
    generateUploadUrl: async (_: any, { filename, contentType }: { filename: string; contentType: string }, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        throw new Error('You must be logged in to upload files');
      }
      
      // Validate content type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(contentType)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
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
        console.error('Error generating upload URL:', error);
        throw new Error('Failed to generate upload URL');
      }
    },
    
    generateAvatarUploadUrl: async (_: any, { filename, contentType }: { filename: string; contentType: string }, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        throw new Error('You must be logged in to upload an avatar');
      }
      
      // Validate content type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(contentType)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
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
        console.error('Error generating avatar upload URL:', error);
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
      
      const updatedListing = await prisma.listing.update({
        where: { id },
        data: input,
        include: { 
          seller: {
            select: safeUserSelect
          }
        },
      });
      
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
      
      await prisma.listing.delete({
        where: { id },
      });
      
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
        console.error('Error resending verification email:', error);
        return false;
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
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }

  // Initialize OpenSearch index
  try {
    await ensureListingsIndex();
    console.log('✅ OpenSearch index initialized');
  } catch (error) {
    console.warn('⚠️ OpenSearch initialization failed, will use database fallback:', error);
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
        prisma,
      };
    },
  });
  
  app.use('/graphql', yoga);

  const PORT = Number(process.env['PORT']) || 4000;
  const HOST = process.env['HOST'] || '0.0.0.0';
  
  app.listen(PORT, HOST, () => {
    console.log(`Server ready at http://${HOST}:${PORT}/graphql`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  await closeValkeyClient();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  await closeValkeyClient();
  process.exit(0);
});