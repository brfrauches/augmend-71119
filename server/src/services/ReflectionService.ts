
import ReflectionRepository from '../repositories/ReflectionRepository';
import { IReflection } from '../models/Reflection';

export default class ReflectionService {
  private repository: ReflectionRepository;
  
  constructor() {
    this.repository = new ReflectionRepository();
  }
  
  async getReflections(userId: string, query: any = {}): Promise<IReflection[]> {
    return this.repository.findByUser(userId, query);
  }
  
  async getReflectionById(id: string): Promise<IReflection | null> {
    return this.repository.findById(id);
  }
  
  async createReflection(userId: string, data: any): Promise<IReflection> {
    return this.repository.create({
      ...data,
      user: userId
    });
  }
  
  async updateReflection(id: string, data: Partial<IReflection>): Promise<IReflection | null> {
    return this.repository.update(id, data);
  }
  
  async deleteReflection(id: string): Promise<IReflection | null> {
    return this.repository.delete(id);
  }
  
  async getReflectionStreaks(userId: string): Promise<any> {
    return this.repository.getStreaks(userId);
  }
  
  async getMoodStatistics(userId: string, period?: string): Promise<any> {
    return this.repository.getMoodStats(userId, period);
  }
}
