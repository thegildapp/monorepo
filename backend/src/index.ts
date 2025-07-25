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
  verifyAuthentication,
  bufferToBase64url
} from './utils/webauthn';

// Polyfill for Web Crypto API in Node.js
import { webcrypto } from 'crypto';
if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

// Context type
interface Context {
  userId: string | undefined;
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



const resolvers = {
  Query: {
    listings: async (_: any, args: { limit?: number | null; offset?: number | null; filters?: { latitude?: number; longitude?: number; radius?: number } | null }) => {
      const { limit, offset, filters } = args;
      
      const where: any = {
        status: 'APPROVED',
      };
      
      // Add location filtering if provided
      if (filters?.latitude && filters?.longitude && filters?.radius) {
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
        include: { seller: true },
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
        include: { seller: true },
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
          include: { seller: true },
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
      });
    },
    
    me: async (_: any, __: any, context: YogaInitialContext & Context) => {
      if (!context.userId) return null;
      
      const user = await prisma.user.findUnique({
        where: { id: context.userId },
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
        include: { seller: true },
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
    createListing: async (_: any, { input }: { input: { title: string; description: string; price: number; images: string[]; city: string; state: string; latitude?: number; longitude?: number } }, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        throw new Error('You must be logged in to create a listing');
      }
      
      // Create listing with PENDING status by default
      const listing = await prisma.listing.create({
        data: {
          ...input,
          imageVariants: [],
          seller: {
            connect: { id: context.userId }
          },
          status: 'PENDING',
        },
        include: { seller: true },
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
              include: { seller: true },
            });
            if (fullListing) {
              await indexListing(fullListing);
              console.log('Listing indexed successfully:', listing.id);
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
        include: { seller: true },
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
        throw new Error('User with this email already exists');
      }
      
      // Hash password
      const hashedPassword = await hashPassword(input.password);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
          phone: input.phone,
        },
      });
      
      // Generate token
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
    
    login: async (_: any, { input }: { input: { email: string; password: string } }) => {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Check password
      const validPassword = await comparePassword(input.password, user.password);
      
      if (!validPassword) {
        throw new Error('Invalid email or password');
      }
      
      // Generate token
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
    
    refreshToken: async (_: any, __: any, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        throw new Error('You must be logged in to refresh token');
      }
      
      // Get the user
      const user = await prisma.user.findUnique({
        where: { id: context.userId },
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
        throw new Error('You must be logged in to register a passkey');
      }

      const user = await prisma.user.findUnique({
        where: { id: context.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const options = await generateRegistrationOptionsForUser(user.id, user.email, user.name);
      
      return {
        publicKey: JSON.stringify(options),
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

      // Save the passkey to database
      const passkey = await prisma.passkey.create({
        data: {
          userId: context.userId,
          credentialId: bufferToBase64url(Buffer.from(credentialID)),
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
        // Return a specific error code that the frontend can use
        throw new Error('User not found');
      }
      
      if (user.passkeys.length === 0) {
        // Return a specific error code for existing users without passkeys
        throw new Error('No passkeys found for this user');
      }

      const allowCredentials = user.passkeys.map(passkey => ({
        id: passkey.credentialId,
        transports: passkey.transports,
      }));

      const options = await generateAuthenticationOptionsForUser(user.id, allowCredentials);

      return {
        publicKey: JSON.stringify(options),
      };
    },

    verifyPasskeyAuthentication: async (_: any, { input }: { input: { email: string; response: string } }) => {
      const parsedResponse = JSON.parse(input.response);
      
      const user = await prisma.user.findUnique({
        where: { email: input.email },
        include: { passkeys: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Find the passkey used
      const passkey = user.passkeys.find(pk => pk.credentialId === parsedResponse.id);
      
      if (!passkey) {
        throw new Error('Passkey not found');
      }

      const verification = await verifyAuthentication(
        user.id,
        parsedResponse,
        Buffer.from(passkey.credentialPublicKey),
        passkey.counter
      );

      if (!verification.verified) {
        throw new Error('Authentication failed');
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

      return {
        token,
        user: {
          ...user,
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
        throw new Error('User with this email already exists');
      }

      // Create a temporary user ID for the registration process
      const tempUserId = `temp_${email}_${Date.now()}`;
      
      // Generate registration options
      const options = await generateRegistrationOptionsForUser(tempUserId, email, name);
      
      return {
        publicKey: JSON.stringify(options),
      };
    },

    completePasskeyRegistration: async (_: any, { input }: { input: { email: string; name: string; response: string; passkeyName?: string } }) => {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create a temporary user ID for verification
      const tempUserId = `temp_${input.email}_${Date.now()}`;
      
      // Verify the registration
      const parsedResponse = JSON.parse(input.response);
      const verification = await verifyRegistration(tempUserId, parsedResponse);

      if (!verification.verified || !verification.registrationInfo) {
        throw new Error('Passkey registration failed');
      }

      const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
      const { publicKey: credentialPublicKey, id: credentialID, counter } = credential;

      // Create the user with a random password (they won't use it)
      const randomPassword = await hashPassword(Math.random().toString(36).slice(-12));
      
      const user = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          password: randomPassword,
          passkeys: {
            create: {
              credentialId: bufferToBase64url(Buffer.from(credentialID)),
              credentialPublicKey: credentialPublicKey,
              counter: BigInt(counter),
              deviceType: credentialDeviceType,
              backedUp: credentialBackedUp,
              transports: parsedResponse.response.transports || [],
              name: input.passkeyName || `Passkey ${new Date().toLocaleDateString()}`,
            },
          },
        },
        include: {
          passkeys: true,
        },
      });

      // Generate JWT token
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
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});