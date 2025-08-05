import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '../services/loggingService';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      traceId?: string;
      spanId?: string;
      startTime?: number;
    }
  }
}

export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  // Generate request identifiers
  req.traceId = randomUUID();
  req.spanId = randomUUID().split('-')[0];
  req.startTime = Date.now();

  // Log request start
  logger.info('Request started', {
    traceId: req.traceId,
    spanId: req.spanId,
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.headers['x-forwarded-for'] as string || req.connection.remoteAddress,
  });

  // Intercept response to log completion
  const originalSend = res.send;
  res.send = function(data) {
    res.send = originalSend;
    
    // Log request completion
    const duration = Date.now() - (req.startTime || 0);
    logger.info('Request completed', {
      traceId: req.traceId,
      spanId: req.spanId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    });
    
    return res.send(data);
  };

  next();
}

export function errorLoggingMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  const duration = Date.now() - (req.startTime || 0);
  
  logger.error('Request failed', err, {
    traceId: req.traceId,
    spanId: req.spanId,
    method: req.method,
    path: req.path,
    statusCode: res.statusCode || 500,
    duration,
  });

  next(err);
}