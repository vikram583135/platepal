import { OpenAIService } from '../common/openai.service';
export declare class AnalyticsService {
    private readonly openAIService;
    private readonly logger;
    constructor(openAIService: OpenAIService);
    processNaturalLanguageQuery(query: string, restaurantId: number, dataContext?: any): Promise<{
        answer: string;
        data?: any;
        visualization?: string;
    }>;
    generateChartInsights(chartData: any, chartType: string, restaurantId: number): Promise<{
        insights: string[];
        trends: string[];
        recommendations: string[];
    }>;
    private determineVisualizationNeeds;
    private extractInsights;
}
