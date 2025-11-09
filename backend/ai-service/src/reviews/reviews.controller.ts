import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

export class AnalyzeReviewDto {
  review: {
    id: string;
    comment: string;
    rating: number;
    customerName?: string;
  };
  restaurantId: number;
}

export class GenerateReplyDto {
  review: {
    id: string;
    comment: string;
    rating: number;
    sentiment?: string;
    themes?: string[];
  };
  restaurantId: number;
}

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('analyze')
  async analyzeReview(@Body() dto: AnalyzeReviewDto) {
    return this.reviewsService.analyzeReview(dto.review, dto.restaurantId);
  }

  @Post('generate-reply')
  async generateReply(@Body() dto: GenerateReplyDto) {
    return this.reviewsService.generateReply(dto.review, dto.restaurantId);
  }

  @Get('insights/:restaurantId')
  async getInsights(@Param('restaurantId') restaurantId: number) {
    return this.reviewsService.getAggregateInsights(restaurantId);
  }
}

