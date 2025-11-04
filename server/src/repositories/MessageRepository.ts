
import Message, { IMessage } from '../models/Message';
import mongoose from 'mongoose';

export class MessageRepository {
  async getMessagesByConversationId(conversationId: string): Promise<IMessage[]> {
    return await Message.find({ conversationId: new mongoose.Types.ObjectId(conversationId) })
      .sort({ timestamp: 1 })
      .exec();
  }

  async addMessage(conversationId: string, message: Partial<IMessage>): Promise<IMessage> {
    const newMessage = new Message({
      ...message,
      conversationId: new mongoose.Types.ObjectId(conversationId),
    });
    return await newMessage.save();
  }

  async getMessageById(id: string): Promise<IMessage | null> {
    return await Message.findById(id).exec();
  }

  async deleteMessage(id: string): Promise<IMessage | null> {
    return await Message.findByIdAndDelete(id).exec();
  }
}

export default new MessageRepository();
