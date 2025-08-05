import { PrismaClient } from '@prisma/logs-client';

const prismaLogs = new PrismaClient({
  datasources: {
    db: {
      url: process.env['LOGS_DATABASE_URL'],
    },
  },
  log: process.env['NODE_ENV'] === 'development' ? ['error', 'warn'] : ['error'],
});

export default prismaLogs;