import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { OpenAIService } from '../common/openai.service';

@Module({
  imports: [HttpModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, OpenAIService],
  exports: [ReviewsService],
})
export class ReviewsModule {}

