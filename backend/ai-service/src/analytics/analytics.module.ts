import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { OpenAIService } from '../common/openai.service';

@Module({
  imports: [HttpModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, OpenAIService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

