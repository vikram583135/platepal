import { Controller, Post, Body } from '@nestjs/common';
import { PromotionsService } from './promotions.service';

export class SuggestPromotionsDto {
  salesData: any[];
  menuItems: any[];
  restaurantId: number;
  timeRange?: { start: string; end: string };
}

export class PredictPromotionDto {
  promotion: {
    type: string;
    discountValue: number;
    items?: string[];
    timeRange?: { start: string; end: string };
  };
  salesHistory: any[];
  restaurantId: number;
}

export class OptimizePromotionDto {
  promotion: any;
  performanceData: any[];
  restaurantId: number;
}

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post('suggest')
  async suggestPromotions(@Body() dto: SuggestPromotionsDto) {
    return this.promotionsService.suggestPromotions(dto.salesData, dto.menuItems, dto.restaurantId, dto.timeRange);
  }

  @Post('predict')
  async predictImpact(@Body() dto: PredictPromotionDto) {
    return this.promotionsService.predictPromotionImpact(dto.promotion, dto.salesHistory, dto.restaurantId);
  }

  @Post('optimize')
  async optimizePromotion(@Body() dto: OptimizePromotionDto) {
    return this.promotionsService.optimizePromotion(dto.promotion, dto.performanceData, dto.restaurantId);
  }
}

