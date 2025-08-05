import Redis from 'ioredis';
import { logger } from '../services/loggingService';

let valkeyClient: Redis | null = null;

export function getValkeyClient(): Redis {
  if (!valkeyClient) {
    const valkeyUrl = process.env['VALKEY_URL'];
    
    if (!valkeyUrl) {
      logger.warn('VALKEY_URL not set, using in-memory fallback for development');
      // For development without Valkey, we'll create a mock client
      // In production, this should throw an error
      throw new Error('VALKEY_URL environment variable is required');
    }

    valkeyClient = new Redis(valkeyUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          // Only reconnect when the error contains "READONLY"
          return true;
        }
        return false;
      },
    });

    valkeyClient.on('error', (err) => {
      logger.error('Valkey Client Error', err);
    });

    valkeyClient.on('connect', () => {
      logger.info('Connected to Valkey');
    });
  }

  return valkeyClient;
}

export async function closeValkeyClient(): Promise<void> {
  if (valkeyClient) {
    await valkeyClient.quit();
    valkeyClient = null;
  }
}