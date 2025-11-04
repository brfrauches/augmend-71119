
import { UserRepository } from '../repositories/UserRepository';
import { UserInput, UserDocument } from '../models/User';
import { APIError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(userData: UserInput): Promise<{user: UserDocument, token: string}> {
    try {
      const user = await this.userRepository.create(userData);
      const token = user.generateAuthToken();

      logger.info(`New user registered: ${user._id}`);
      
      return { 
        user: {
          ...user.toObject(),
          password: undefined 
        } as UserDocument, 
        token 
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{user: UserDocument, token: string}> {
    try {
      // Find user with email
      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        throw new APIError('Invalid credentials', 401);
      }

      // Check if password matches
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        throw new APIError('Invalid credentials', 401);
      }

      // Generate token
      const token = user.generateAuthToken();

      logger.info(`User logged in: ${user._id}`);

      return { 
        user: {
          ...user.toObject(),
          password: undefined 
        } as UserDocument, 
        token 
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async getProfile(userId: string): Promise<UserDocument> {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new APIError('User not found', 404);
      }

      return user;
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, updateData: Partial<UserInput>): Promise<UserDocument> {
    try {
      const user = await this.userRepository.update(userId, updateData);
      
      if (!user) {
        throw new APIError('User not found', 404);
      }

      logger.info(`User profile updated: ${userId}`);

      return user;
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }
}
