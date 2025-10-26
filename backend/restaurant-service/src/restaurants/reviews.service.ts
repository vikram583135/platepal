import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Restaurant } from './restaurant.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  async create(restaurantId: number, createReviewDto: CreateReviewDto): Promise<Review> {
    const restaurant = await this.restaurantRepository.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }
    const review = this.reviewRepository.create({
      ...createReviewDto,
      restaurant,
    });
    return this.reviewRepository.save(review);
  }

  findAll(restaurantId: number): Promise<Review[]> {
    return this.reviewRepository.find({ where: { restaurant: { id: restaurantId } } });
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewRepository.preload({
      id: id,
      ...updateReviewDto,
    });
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return this.reviewRepository.save(review);
  }
}