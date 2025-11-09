import { Controller, Post, Body } from '@nestjs/common';
import { MenuService } from './menu.service';

export class AnalyzeMenuDto {
  menuItems: any[];
  salesData: any[];
  restaurantId: number;
}

export class PricingOptimizationDto {
  menuItem: any;
  salesHistory: any[];
  competitorPrices?: any[];
  restaurantId: number;
}

export class MenuRecommendationsDto {
  menuItems: any[];
  salesData: any[];
  restaurantId: number;
}

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('analyze')
  async analyzeMenu(@Body() dto: AnalyzeMenuDto) {
    return this.menuService.analyzeMenuPerformance(dto.menuItems, dto.salesData, dto.restaurantId);
  }

  @Post('pricing')
  async optimizePricing(@Body() dto: PricingOptimizationDto) {
    return this.menuService.suggestPricing(dto.menuItem, dto.salesHistory, dto.competitorPrices, dto.restaurantId);
  }

  @Post('recommendations')
  async getRecommendations(@Body() dto: MenuRecommendationsDto) {
    return this.menuService.getMenuRecommendations(dto.menuItems, dto.salesData, dto.restaurantId);
  }
}

