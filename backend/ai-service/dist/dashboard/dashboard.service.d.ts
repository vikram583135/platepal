import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { OpenAIService } from '../common/openai.service';
export interface DashboardSummary {
    salesForecast: {
        predictedRevenue: number;
        confidence: number;
        reasoning: string;
        comparison: string;
    };
    popularItem: {
        name: string;
        orders: number;
        revenue: number;
        recommendation: string;
    };
    urgentAlerts: Array<{
        type: 'inventory' | 'opportunity' | 'warning';
        message: string;
        priority: 'high' | 'medium' | 'low';
        action?: string;
    }>;
}
export declare class DashboardService {
    private readonly httpService;
    private readonly configService;
    private readonly openAIService;
    private readonly logger;
    private readonly orderServiceUrl;
    private readonly restaurantServiceUrl;
    constructor(httpService: HttpService, configService: ConfigService, openAIService: OpenAIService);
    getDashboardSummary(restaurantId: number): Promise<DashboardSummary>;
    private extractRevenueFromText;
}
