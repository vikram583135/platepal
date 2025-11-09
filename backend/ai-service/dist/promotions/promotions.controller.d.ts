import { PromotionsService } from './promotions.service';
export declare class SuggestPromotionsDto {
    salesData: any[];
    menuItems: any[];
    restaurantId: number;
    timeRange?: {
        start: string;
        end: string;
    };
}
export declare class PredictPromotionDto {
    promotion: {
        type: string;
        discountValue: number;
        items?: string[];
        timeRange?: {
            start: string;
            end: string;
        };
    };
    salesHistory: any[];
    restaurantId: number;
}
export declare class OptimizePromotionDto {
    promotion: any;
    performanceData: any[];
    restaurantId: number;
}
export declare class PromotionsController {
    private readonly promotionsService;
    constructor(promotionsService: PromotionsService);
    suggestPromotions(dto: SuggestPromotionsDto): Promise<import("./promotions.service").PromotionSuggestion[]>;
    predictImpact(dto: PredictPromotionDto): Promise<import("./promotions.service").PromotionPrediction>;
    optimizePromotion(dto: OptimizePromotionDto): Promise<{
        optimizedPromotion: any;
        improvements: string[];
    }>;
}
