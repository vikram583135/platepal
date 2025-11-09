import { OpenAIService } from '../common/openai.service';
export interface MenuItemAnalysis {
    itemId: string;
    name: string;
    performance: {
        revenue: number;
        orders: number;
        avgOrderValue: number;
        performanceScore: number;
    };
    comparison: {
        similarItems: string[];
        performanceVsSimilar: number;
    };
    recommendations: string[];
}
export interface PricingSuggestion {
    currentPrice: number;
    suggestedPrice: number;
    reasoning: string;
    expectedImpact: {
        revenueChange: number;
        orderChange: number;
    };
    confidence: number;
}
export declare class MenuService {
    private readonly openAIService;
    private readonly logger;
    constructor(openAIService: OpenAIService);
    analyzeMenuPerformance(menuItems: any[], salesData: any[], restaurantId: number): Promise<MenuItemAnalysis[]>;
    suggestPricing(menuItem: any, salesHistory: any[], competitorPrices: any[], restaurantId: number): Promise<PricingSuggestion>;
    getMenuRecommendations(menuItems: any[], salesData: any[], restaurantId: number): Promise<{
        recommendations: string[];
        topPerformers: string[];
        underperformers: string[];
    }>;
    private extractRecommendations;
    private extractPriceFromText;
}
