import express from 'express';
import { createYoga, createSchema, YogaInitialContext } from 'graphql-yoga';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join } from 'path';
import prisma from './config/prisma';
import { searchListings } from './services/searchService';
import { ensureListingsIndex } from './config/opensearch';
import { generateToken, verifyToken, hashPassword, comparePassword, extractTokenFromHeader } from './utils/auth';

// Context type
interface Context {
  userId: string | undefined;
}

// Read the schema from the single source of truth
const schemaPath = join(__dirname, '../schema.graphql');
const typeDefs = readFileSync(schemaPath, 'utf8');

const resolvers = {
  Query: {
    listings: async (_: any, args: { limit?: number | null; offset?: number | null }) => {
      const { limit, offset } = args;
      
      const where = {};
      
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
      
      const listings = await prisma.listing.findMany(queryOptions);
      
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
      
      try {
        const result = await searchListings({
          query,
          limit: typeof limit === 'number' ? limit : 20,
          offset: typeof offset === 'number' ? offset : 0,
          filters: filters ? {
            priceMin: filters.priceMin,
            priceMax: filters.priceMax,
            location: filters.location,
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
  },
  
  Mutation: {
    createListing: async (_: any, { input }: { input: { title: string; description: string; price: number; images: string[]; city: string; state: string } }, context: YogaInitialContext & Context) => {
      if (!context.userId) {
        throw new Error('You must be logged in to create a listing');
      }
      
      const listing = await prisma.listing.create({
        data: {
          ...input,
          sellerId: context.userId,
        },
        include: { seller: true },
      });
      
      return {
        ...listing,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
      };
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
      : ['http://localhost:5173', 'http://localhost:3000'],
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
        : ['http://localhost:5173', 'http://localhost:3000'],
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

  const PORT = process.env['PORT'] || 4000;
  
  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
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