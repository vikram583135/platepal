import { Controller, Post, Body } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

export class NaturalLanguageQueryDto {
  query: string;
  restaurantId: number;
  dataContext?: any;
}

export class ChartInsightsDto {
  chartData: any;
  chartType: string;
  restaurantId: number;
}

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('query')
  async processQuery(@Body() dto: NaturalLanguageQueryDto) {
    return this.analyticsService.processNaturalLanguageQuery(dto.query, dto.restaurantId, dto.dataContext);
  }

  @Post('insights')
  async generateInsights(@Body() dto: ChartInsightsDto) {
    return this.analyticsService.generateChartInsights(dto.chartData, dto.chartType, dto.restaurantId);
  }
}

