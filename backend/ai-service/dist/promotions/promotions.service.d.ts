import { OpenAIService } from '../common/openai.service';
export interface PromotionSuggestion {
    type: 'discount' | 'combo' | 'bogo' | 'time-based';
    title: string;
    description: string;
    items: string[];
    discountValue?: number;
    timeRange?: {
        start: string;
        end: string;
    };
    reasoning: string;
    expectedImpact: {
        revenueIncrease: number;
        orderIncrease: number;
    };
    confidence: number;
}
export interface PromotionPrediction {
    expectedRevenue: number;
    expectedOrders: number;
    revenueIncrease: number;
    orderIncrease: number;
    confidence: number;
    recommendations: string[];
}
export declare class PromotionsService {
    private readonly openAIService;
    private readonly logger;
    constructor(openAIService: OpenAIService);
    suggestPromotions(salesData: any[], menuItems: any[], restaurantId: number, timeRange?: {
        start: string;
        end: string;
    }): Promise<PromotionSuggestion[]>;
    predictPromotionImpact(promotion: any, salesHistory: any[], restaurantId: number): Promise<PromotionPrediction>;
    optimizePromotion(promotion: any, performanceData: any[], restaurantId: number): Promise<{
        optimizedPromotion: any;
        improvements: string[];
    }>;
    private analyzeSalesByHour;
    private analyzeSalesByDay;
    private getTopItems;
    private identifySlowPeriods;
    private identifySlowDays;
    private analyzePromotionPerformance;
    private extractRecommendations;
}
