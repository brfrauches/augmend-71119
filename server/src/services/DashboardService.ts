
import DashboardRepository from '../repositories/DashboardRepository';
import AnalyticsService from './AnalyticsService';

export class DashboardService {
  private dashboardRepository: typeof DashboardRepository;
  private analyticsService: typeof AnalyticsService;

  constructor() {
    this.dashboardRepository = DashboardRepository;
    this.analyticsService = AnalyticsService;
  }

  async getDashboardData(userId: string): Promise<Record<string, any>> {
    return await this.dashboardRepository.getDashboardData(userId);
  }

  async getTodaysFocus(userId: string): Promise<Array<Record<string, any>>> {
    return await this.dashboardRepository.getTodaysFocus(userId);
  }

  async getWellnessScore(userId: string, timeframe: 'daily' | 'weekly'): Promise<Record<string, any>> {
    return await this.dashboardRepository.getWellnessScore(userId, timeframe);
  }

  async getTreatmentProgress(userId: string): Promise<Array<Record<string, any>>> {
    return await this.dashboardRepository.getTreatmentProgress(userId);
  }

  async getRecentSessions(userId: string): Promise<Array<Record<string, any>>> {
    return await this.dashboardRepository.getRecentSessions(userId);
  }

  async logDashboardView(userId: string): Promise<void> {
    await this.analyticsService.logActivity(
      userId,
      'login',
      { action: 'dashboard_view' }
    );
  }
}

export default new DashboardService();
