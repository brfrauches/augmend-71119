
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { APIError } from './errorHandler';
import { UserDocument } from '../models/User';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

interface JwtPayload {
  id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    // Check if auth header exists and starts with Bearer
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new APIError('Not authorized to access this route', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

      // Get user from the token
      // We'll implement this once we have the User model
      // req.user = await User.findById(decoded.id);
      
      // For now, just setting a placeholder user ID
      req.user = {
        _id: decoded.id
      } as any;

      next();
    } catch (error) {
      return next(new APIError('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

// Role-based access control middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new APIError('Not authorized to access this route', 401));
    }
    
    // We'll implement this once we have the User model with roles
    // const userRole = req.user.role;
    // if (!roles.includes(userRole)) {
    //   return next(
    //     new APIError('User role not authorized to access this route', 403)
    //   );
    // }
    
    next();
  };
};
