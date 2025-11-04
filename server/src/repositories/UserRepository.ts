
import { User, UserDocument, UserInput } from '../models/User';
import { Types } from 'mongoose';
import { APIError } from '../middleware/errorHandler';

export class UserRepository {
  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new APIError('Invalid user ID', 400);
    }
    return User.findById(id);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email }).select('+password');
  }

  async create(userData: UserInput): Promise<UserDocument> {
    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new APIError('Email already in use', 400);
    }

    return User.create(userData);
  }

  async update(id: string, updateData: Partial<UserInput>): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new APIError('Invalid user ID', 400);
    }

    // Don't allow email to be changed if it's already in use
    if (updateData.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email,
        _id: { $ne: id }
      });
      
      if (existingUser) {
        throw new APIError('Email already in use', 400);
      }
    }

    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
  }

  async delete(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new APIError('Invalid user ID', 400);
    }
    return User.findByIdAndDelete(id);
  }

  async findAll(limit: number = 10, page: number = 1): Promise<{
    users: UserDocument[];
    total: number;
    page: number;
    pages: number;
  }> {
    const count = await User.countDocuments();
    const pages = Math.ceil(count / limit);
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      users,
      total: count,
      page,
      pages
    };
  }
}
