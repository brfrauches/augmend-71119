
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { APIError } from '../middleware/errorHandler';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      // Validate input
      if (!name || !email || !password) {
        throw new APIError('Please provide name, email and password', 400);
      }

      const { user, token } = await this.authService.register({
        name,
        email,
        password
      });

      res.status(201).json({
        status: 'success',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        throw new APIError('Please provide email and password', 400);
      }

      const { user, token } = await this.authService.login(email, password);

      res.status(200).json({
        status: 'success',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new APIError('Not authorized', 401);
      }

      const user = await this.authService.getProfile(req.user._id);

      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new APIError('Not authorized', 401);
      }

      const { name, email } = req.body;
      const user = await this.authService.updateProfile(req.user._id, {
        name,
        email
      });

      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
