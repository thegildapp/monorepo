import { PrismaClient } from '@prisma/client';
import { logger } from '../services/loggingService';

// Create write client (primary database)
const prismaWriteClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env['DATABASE_URL'],
      },
    },
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });
};

// Create read client (read replica or fallback to primary)
const prismaReadClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env['DATABASE_READ_URL'] || process.env['DATABASE_URL'],
      },
    },
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });
};

declare global {
  var prismaWrite: undefined | ReturnType<typeof prismaWriteClientSingleton>;
  var prismaRead: undefined | ReturnType<typeof prismaReadClientSingleton>;
}

const prismaWrite = globalThis.prismaWrite ?? prismaWriteClientSingleton();
const prismaRead = globalThis.prismaRead ?? prismaReadClientSingleton();

// Log slow queries (without sensitive params)
// Use different thresholds for different environments
const SLOW_QUERY_THRESHOLD = process.env['NODE_ENV'] === 'production' ? 500 : 200;

prismaWrite.$on('query', (e) => {
  // Skip health check queries
  if (e.query === 'SELECT 1') return;
  
  if (e.duration > SLOW_QUERY_THRESHOLD) {
    logger.warn(`Slow write query detected (${e.duration}ms)`, {
      metadata: {
        query: e.query,
        // Don't log params as they may contain sensitive data (passwords, tokens, etc.)
        target: e.target,
        durationMs: e.duration,
        threshold: SLOW_QUERY_THRESHOLD,
      },
    });
  }
});

prismaRead.$on('query', (e) => {
  // Skip health check queries
  if (e.query === 'SELECT 1') return;
  
  if (e.duration > SLOW_QUERY_THRESHOLD) {
    logger.warn(`Slow read query detected (${e.duration}ms)`, {
      metadata: {
        query: e.query,
        // Don't log params as they may contain sensitive data
        target: e.target,
        durationMs: e.duration,
        threshold: SLOW_QUERY_THRESHOLD,
      },
    });
  }
});

// Log errors
prismaWrite.$on('error', (e) => {
  // Skip logging unique constraint errors as they're often handled in application code
  if (e.message?.includes('Unique constraint failed')) {
    return;
  }
  logger.error('Prisma write error', new Error(e.message), {
    metadata: { target: e.target },
  });
});

prismaRead.$on('error', (e) => {
  logger.error('Prisma read error', new Error(e.message), {
    metadata: { target: e.target },
  });
});

// Export both clients
export { prismaWrite, prismaRead };

// Default export for backward compatibility
export default prismaWrite;

if (process.env['NODE_ENV'] !== 'production') {
  globalThis.prismaWrite = prismaWrite;
  globalThis.prismaRead = prismaRead;
}