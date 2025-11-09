import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { OpenAIService } from '../common/openai.service';

@Module({
  imports: [HttpModule],
  controllers: [PromotionsController],
  providers: [PromotionsService, OpenAIService],
  exports: [PromotionsService],
})
export class PromotionsModule {}

