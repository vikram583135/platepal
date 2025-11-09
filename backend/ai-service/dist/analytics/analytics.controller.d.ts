import { AnalyticsService } from './analytics.service';
export declare class NaturalLanguageQueryDto {
    query: string;
    restaurantId: number;
    dataContext?: any;
}
export declare class ChartInsightsDto {
    chartData: any;
    chartType: string;
    restaurantId: number;
}
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    processQuery(dto: NaturalLanguageQueryDto): Promise<{
        answer: string;
        data?: any;
        visualization?: string;
    }>;
    generateInsights(dto: ChartInsightsDto): Promise<{
        insights: string[];
        trends: string[];
        recommendations: string[];
    }>;
}
