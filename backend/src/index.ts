import express from 'express';
import { createYoga, createSchema } from 'graphql-yoga';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join } from 'path';
import prisma from './config/prisma';
import { CategoryType } from '@prisma/client';
import { searchListings } from './services/searchService';
import { ensureListingsIndex } from './config/opensearch';

// Read the schema from the single source of truth
const schemaPath = join(__dirname, '../schema.graphql');
const typeDefs = readFileSync(schemaPath, 'utf8');

const resolvers = {
  Query: {
    listings: async (_: any, args: { category?: CategoryType; limit?: number | null; offset?: number | null }) => {
      const { category, limit, offset } = args;
      
      const where = category ? { category } : {};
      
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
    
    searchListings: async (_: any, args: { query: string; category?: CategoryType; limit?: number | null; offset?: number | null; filters?: any }) => {
      const { query, category, limit, offset, filters } = args;
      
      try {
        const result = await searchListings({
          query,
          category,
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
          AND: [
            category ? { category } : {},
            {
              OR: [
                { title: { contains: query, mode: 'insensitive' as const } },
                { description: { contains: query, mode: 'insensitive' as const } },
              ],
            },
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
    
    me: async (_: any, __: any, context: any) => {
      // TODO: Implement with authentication context
      // For now, returning null as auth is not implemented
      return null;
    },
  },
  
  Mutation: {
    createListing: async (_: any, { input }: { input: any }, context: any) => {
      // TODO: Get userId from auth context
      // For now, throwing error as auth is not implemented
      throw new Error('Authentication not implemented');
    },
    
    updateListing: async (_: any, { id, input }: { id: string; input: any }, context: any) => {
      // TODO: Verify ownership with auth context
      // For now, throwing error as auth is not implemented
      throw new Error('Authentication not implemented');
    },
    
    deleteListing: async (_: any, { id }: { id: string }, context: any) => {
      // TODO: Verify ownership with auth context
      // For now, throwing error as auth is not implemented
      throw new Error('Authentication not implemented');
    },
    
    register: async (_: any, { input }: { input: any }) => {
      // TODO: Implement with bcrypt and JWT
      throw new Error('Authentication not implemented');
    },
    
    login: async (_: any, { input }: { input: any }) => {
      // TODO: Implement with bcrypt and JWT
      throw new Error('Authentication not implemented');
    },
    
    updateProfile: async (_: any, { input }: { input: any }, context: any) => {
      // TODO: Get userId from auth context
      // For now, throwing error as auth is not implemented
      throw new Error('Authentication not implemented');
    },
  },
  
  // Field resolvers
  Listing: {
    specifications: (parent: any) => {
      if (!parent.specifications) return null;
      
      const specs = parent.specifications as any;
      
      // Return the specifications with the appropriate __typename
      switch (parent.category) {
        case 'BOATS':
          return { ...specs, __typename: 'BoatSpecifications' };
        case 'PLANES':
          return { ...specs, __typename: 'PlaneSpecifications' };
        case 'BIKES':
          return { ...specs, __typename: 'BikeSpecifications' };
        case 'CARS':
          return { ...specs, __typename: 'CarSpecifications' };
        default:
          return null;
      }
    },
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
    origin: process.env.NODE_ENV === 'production' 
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
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://thegild.app', 'https://www.thegild.app']
        : ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    },
  });
  
  app.use('/graphql', yoga);

  const PORT = process.env.PORT || 4000;
  
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