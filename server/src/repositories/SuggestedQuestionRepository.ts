
import SuggestedQuestion, { ISuggestedQuestion } from '../models/SuggestedQuestion';

export class SuggestedQuestionRepository {
  async getActiveSuggestedQuestions(): Promise<ISuggestedQuestion[]> {
    return await SuggestedQuestion.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .exec();
  }

  async getSuggestedQuestionsByCategory(category: string): Promise<ISuggestedQuestion[]> {
    return await SuggestedQuestion.find({ category, isActive: true })
      .sort({ displayOrder: 1 })
      .exec();
  }

  async createSuggestedQuestion(data: Partial<ISuggestedQuestion>): Promise<ISuggestedQuestion> {
    const question = new SuggestedQuestion(data);
    return await question.save();
  }

  async updateSuggestedQuestion(id: string, data: Partial<ISuggestedQuestion>): Promise<ISuggestedQuestion | null> {
    return await SuggestedQuestion.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteSuggestedQuestion(id: string): Promise<ISuggestedQuestion | null> {
    return await SuggestedQuestion.findByIdAndDelete(id).exec();
  }
}

export default new SuggestedQuestionRepository();
