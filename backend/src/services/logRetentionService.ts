import prismaLogs from '../config/prismaLogs';
import { logger } from './loggingService';
import cron from 'node-cron';

interface RetentionPolicy {
  level: string;
  retentionDays: number;
}

// Default retention policies
const DEFAULT_RETENTION_POLICIES: RetentionPolicy[] = [
  { level: 'debug', retentionDays: 7 },    // Keep debug logs for 1 week
  { level: 'info', retentionDays: 30 },    // Keep info logs for 1 month
  { level: 'warn', retentionDays: 90 },    // Keep warnings for 3 months
  { level: 'error', retentionDays: 180 },  // Keep errors for 6 months
];


class LogRetentionService {
  private isRunning = false;
  private cronJob: any = null;

  /**
   * Start the log retention service
   * Runs daily at 2 AM to clean up old logs
   */
  startRetentionJob(): void {
    // Run daily at 2 AM
    this.cronJob = cron.schedule('0 2 * * *', async () => {
      await this.runRetentionPolicy();
    });

    logger.info('Log retention service started');
  }

  /**
   * Stop the retention job
   */
  stopRetentionJob(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    logger.info('Log retention service stopped');
  }

  /**
   * Run retention policy to delete old logs
   */
  async runRetentionPolicy(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Log retention job already running, skipping');
      return;
    }

    this.isRunning = true;
    logger.info('Starting log retention cleanup');

    try {
      let totalDeleted = 0;

      for (const policy of DEFAULT_RETENTION_POLICIES) {
        const deleted = await this.deleteOldLogs(policy.level, policy.retentionDays);
        totalDeleted += deleted;
      }

      // Clean up orphaned log metrics
      await this.cleanupLogMetrics();

      logger.info('Log retention cleanup completed', {
        metadata: { totalDeleted }
      });
    } catch (error) {
      logger.error('Error during log retention cleanup', error as Error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Delete logs older than specified days for a given level
   */
  private async deleteOldLogs(level: string, retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const result = await prismaLogs.log.deleteMany({
        where: {
          level,
          timestamp: {
            lt: cutoffDate
          }
        }
      });

      if (result.count > 0) {
        logger.info(`Deleted old ${level} logs`, {
          metadata: {
            count: result.count,
            cutoffDate: cutoffDate.toISOString(),
            retentionDays
          }
        });
      }

      return result.count;
    } catch (error) {
      logger.error(`Error deleting old ${level} logs`, error as Error, {
        metadata: { level, retentionDays }
      });
      return 0;
    }
  }

  /**
   * Clean up old log metrics
   */
  private async cleanupLogMetrics(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep metrics for 3 months

    try {
      const result = await prismaLogs.logMetrics.deleteMany({
        where: {
          hour: {
            lt: cutoffDate
          }
        }
      });

      if (result.count > 0) {
        logger.info('Deleted old log metrics', {
          metadata: {
            count: result.count,
            cutoffDate: cutoffDate.toISOString()
          }
        });
      }
    } catch (error) {
      logger.error('Error cleaning up log metrics', error as Error);
    }
  }

  /**
   * Get log statistics by retention period
   */
  async getLogStats(): Promise<any> {
    const stats: any = {
      total: 0,
      byLevel: {},
      byRetentionPeriod: {}
    };

    try {
      // Get total count
      stats.total = await prismaLogs.log.count();

      // Get counts by level
      const levels = ['debug', 'info', 'warn', 'error'];
      for (const level of levels) {
        stats.byLevel[level] = await prismaLogs.log.count({
          where: { level }
        });
      }

      // Get counts by retention period
      for (const policy of DEFAULT_RETENTION_POLICIES) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

        stats.byRetentionPeriod[`${policy.level}_${policy.retentionDays}d`] = await prismaLogs.log.count({
          where: {
            level: policy.level,
            timestamp: {
              gte: cutoffDate
            }
          }
        });
      }

      // Get storage size estimate (assuming ~1KB per log entry)
      stats.estimatedStorageMB = Math.round(stats.total / 1024);

      return stats;
    } catch (error) {
      logger.error('Error getting log stats', error as Error);
      throw error;
    }
  }


  /**
   * Manually trigger cleanup for a specific date range
   */
  async cleanupDateRange(startDate: Date, endDate: Date): Promise<number> {
    try {
      const result = await prismaLogs.log.deleteMany({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      logger.info('Manual cleanup completed', {
        metadata: {
          count: result.count,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      return result.count;
    } catch (error) {
      logger.error('Error during manual cleanup', error as Error);
      throw error;
    }
  }
}

// Export singleton instance
export const logRetentionService = new LogRetentionService();