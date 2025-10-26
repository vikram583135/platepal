import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('restaurants/:restaurantId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Param('restaurantId') restaurantId: string, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(+restaurantId, createReviewDto);
  }

  @Get()
  findAll(@Param('restaurantId') restaurantId: string) {
    return this.reviewsService.findAll(+restaurantId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }
}
