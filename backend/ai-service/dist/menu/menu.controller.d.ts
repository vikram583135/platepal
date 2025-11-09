import { MenuService } from './menu.service';
export declare class AnalyzeMenuDto {
    menuItems: any[];
    salesData: any[];
    restaurantId: number;
}
export declare class PricingOptimizationDto {
    menuItem: any;
    salesHistory: any[];
    competitorPrices?: any[];
    restaurantId: number;
}
export declare class MenuRecommendationsDto {
    menuItems: any[];
    salesData: any[];
    restaurantId: number;
}
export declare class MenuController {
    private readonly menuService;
    constructor(menuService: MenuService);
    analyzeMenu(dto: AnalyzeMenuDto): Promise<import("./menu.service").MenuItemAnalysis[]>;
    optimizePricing(dto: PricingOptimizationDto): Promise<import("./menu.service").PricingSuggestion>;
    getRecommendations(dto: MenuRecommendationsDto): Promise<{
        recommendations: string[];
        topPerformers: string[];
        underperformers: string[];
    }>;
}
