
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Handle specific operational errors we're expecting
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.isOperational = err.isOperational || false;

  // Log error
  if (err.statusCode === 500) {
    logger.error(`${err.name}: ${err.message}`, { 
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  } else {
    logger.warn(`${err.name}: ${err.message}`, { 
      path: req.path,
      method: req.method
    });
  }

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Programming or other unknown error: don't leak error details
  // Send generic message to client
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};

// Create operational error
export class APIError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
