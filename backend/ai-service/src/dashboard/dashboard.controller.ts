import { Controller, Post, Body, Logger } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

export class DashboardSummaryDto {
  restaurantId: number;
}

@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Post('summary')
  async getSummary(@Body() dto: DashboardSummaryDto) {
    try {
      const summary = await this.dashboardService.getDashboardSummary(dto.restaurantId);
      return summary;
    } catch (error) {
      this.logger.error('Error in dashboard summary endpoint:', error);
      throw error;
    }
  }
}

