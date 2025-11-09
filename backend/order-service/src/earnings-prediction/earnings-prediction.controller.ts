import { Controller, Get, Query, Param } from '@nestjs/common';
import { EarningsPredictionService } from './earnings-prediction.service';

@Controller('earnings-prediction')
export class EarningsPredictionController {
  constructor(
    private readonly earningsPredictionService: EarningsPredictionService,
  ) {}

  @Get(':partnerId')
  async getEarningsPrediction(
    @Param('partnerId') partnerId: string,
    @Query('hours') hours?: string,
    @Query('area') area?: string,
  ) {
    const hoursNum = hours ? parseInt(hours, 10) : 2;
    const prediction = await this.earningsPredictionService.predictEarnings(
      partnerId,
      hoursNum,
      area,
    );

    return {
      success: true,
      prediction,
    };
  }

  @Get(':partnerId/stats')
  async getPartnerStats(@Param('partnerId') partnerId: string) {
    const stats = await this.earningsPredictionService.getPartnerEarningsStats(
      partnerId,
    );

    return {
      success: true,
      stats,
    };
  }
}

