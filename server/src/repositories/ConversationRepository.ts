
import Conversation, { IConversation } from '../models/Conversation';
import mongoose from 'mongoose';

export class ConversationRepository {
  async getUserConversations(userId: string): Promise<IConversation[]> {
    return await Conversation.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getConversationById(id: string): Promise<IConversation | null> {
    return await Conversation.findById(id).exec();
  }

  async createConversation(userId: string): Promise<IConversation> {
    const conversation = new Conversation({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
    });
    return await conversation.save();
  }

  async updateConversation(id: string, data: Partial<IConversation>): Promise<IConversation | null> {
    return await Conversation.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteConversation(id: string): Promise<IConversation | null> {
    return await Conversation.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
  }
}

export default new ConversationRepository();
