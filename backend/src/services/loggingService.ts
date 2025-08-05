import { getValkeyClient } from '../utils/valkey';
import prismaLogs from '../config/prismaLogs';
import { Prisma } from '@prisma/logs-client';

const LOG_QUEUE_KEY = 'logs:queue';
const LOG_BATCH_SIZE = 100;
const PROCESS_INTERVAL = 5000; // 5 seconds

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  message: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  errorName?: string;
  errorMessage?: string;
  errorStack?: string;
  metadata?: Record<string, any>;
}

class LoggingService {
  private isProcessing = false;
  private processInterval: NodeJS.Timeout | null = null;

  /**
   * Log an entry to Valkey queue (non-blocking)
   */
  async log(entry: LogEntry): Promise<void> {
    try {
      const valkey = getValkeyClient();
      const logData = {
        ...entry,
        timestamp: new Date().toISOString(),
      };
      
      await valkey.lpush(LOG_QUEUE_KEY, JSON.stringify(logData));
    } catch (error) {
      // If Valkey fails, log to console as fallback
      console.error('Failed to queue log:', error);
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Process logs from queue and insert into database
   */
  async processLogQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const valkey = getValkeyClient();
    
    try {
      // Get batch of logs
      const logs = await valkey.lrange(LOG_QUEUE_KEY, -LOG_BATCH_SIZE, -1);
      
      if (logs.length === 0) {
        return;
      }
      
      // Remove processed logs from queue
      await valkey.ltrim(LOG_QUEUE_KEY, 0, -logs.length - 1);
      
      // Parse and prepare logs for insertion
      const logEntries: Prisma.LogCreateManyInput[] = logs.map(logStr => {
        try {
          const log = JSON.parse(logStr);
          return {
            timestamp: new Date(log.timestamp),
            level: log.level,
            service: log.service,
            message: log.message,
            traceId: log.traceId,
            spanId: log.spanId,
            userId: log.userId,
            method: log.method,
            path: log.path,
            statusCode: log.statusCode,
            duration: log.duration,
            userAgent: log.userAgent,
            ip: log.ip,
            errorName: log.errorName,
            errorMessage: log.errorMessage,
            errorStack: log.errorStack,
            metadata: log.metadata,
          };
        } catch (error) {
          console.error('Failed to parse log entry:', error);
          return null;
        }
      }).filter(Boolean) as Prisma.LogCreateManyInput[];
      
      // Bulk insert to database
      if (logEntries.length > 0) {
        await prismaLogs.log.createMany({
          data: logEntries,
          skipDuplicates: true,
        });
      }
    } catch (error) {
      console.error('Failed to process log queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Start background processing of logs
   */
  startProcessing(): void {
    if (this.processInterval) return;
    
    // Process immediately
    this.processLogQueue();
    
    // Then process every interval
    this.processInterval = setInterval(() => {
      this.processLogQueue();
    }, PROCESS_INTERVAL);
  }

  /**
   * Stop background processing
   */
  stopProcessing(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
  }

  /**
   * Helper methods for common log types
   */
  info(message: string, context?: Partial<LogEntry>): void {
    this.log({ level: 'info', service: 'backend', message, ...context });
  }

  warn(message: string, context?: Partial<LogEntry>): void {
    this.log({ level: 'warn', service: 'backend', message, ...context });
  }

  error(message: string, error?: Error, context?: Partial<LogEntry>): void {
    this.log({
      level: 'error',
      service: 'backend',
      message,
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack: error?.stack,
      ...context,
    });
  }

  debug(message: string, context?: Partial<LogEntry>): void {
    if (process.env['NODE_ENV'] !== 'production') {
      this.log({ level: 'debug', service: 'backend', message, ...context });
    }
  }
}

// Export singleton instance
export const logger = new LoggingService();