import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import { Restaurant } from './restaurant.entity';
import { Menu } from '../menus/menu.schema';
// 1. Import the new UpdateMenuDto
import { UpdateMenuDto } from '../menus/dto/update-menu.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectModel(Menu.name)
    private readonly menuModel: Model<Menu>,
  ) {}

  async findAll(query?: { ownerId?: string }): Promise<Restaurant[]> {
    console.log('Query:', query);
    if (query && query.ownerId) {
      const restaurants = await this.restaurantRepository.find({ where: { ownerId: query.ownerId } });
      console.log('Found restaurants:', restaurants);
      return restaurants;
    }
    const allRestaurants = await this.restaurantRepository.find();
    console.log('Found all restaurants:', allRestaurants);
    return allRestaurants;
  }

  async findMenu(restaurantId: number): Promise<Menu> {
    const menu = await this.menuModel.findOne({ restaurantId }).exec();
    if (!menu) {
      throw new NotFoundException(
        `Menu for restaurant with ID ${restaurantId} not found`,
      );
    }
    return menu;
  }

  // --- NEW METHOD ADDED BELOW ---
  /**
   * Updates the menu for a specific restaurant.
   * @param restaurantId The ID of the restaurant whose menu is to be updated.
   * @param updateMenuDto The new menu data.
   * @returns The updated menu document.
   */
  async updateMenu(
    restaurantId: number,
    updateMenuDto: UpdateMenuDto,
  ): Promise<Menu> {
    // We use findOneAndUpdate to find the document and update it in one atomic operation.
    // { new: true } ensures that the method returns the document *after* the update has been applied.
    const updatedMenu = await this.menuModel.findOneAndUpdate(
      { restaurantId }, // Find the menu with this restaurantId
      { categories: updateMenuDto.categories }, // Update its categories with the new data
      { new: true }, // Return the updated document
    ).exec();

    if (!updatedMenu) {
      throw new NotFoundException(
        `Menu for restaurant with ID ${restaurantId} not found`,
      );
    }

    return updatedMenu;
  }

  // Admin methods
  async getPendingApprovals() {
    // Return restaurants with status 'pending'
    return this.restaurantRepository.find({ where: { status: 'pending' } });
  }

  async approveRestaurant(restaurantId: number, notes?: string) {
    const restaurant = await this.restaurantRepository.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    restaurant.status = 'active';
    return this.restaurantRepository.save(restaurant);
  }

  async rejectRestaurant(restaurantId: number, reason: string) {
    const restaurant = await this.restaurantRepository.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    restaurant.status = 'rejected';
    return this.restaurantRepository.save(restaurant);
  }

  async getAIScreenedApplications() {
    // Return pending applications sorted by risk score (mock)
    const pending = await this.restaurantRepository.find({ where: { status: 'pending' } });
    return pending.map((r: any) => ({
      ...r,
      aiRiskScore: Math.floor(Math.random() * 40) + 60, // Mock risk score
      flags: [],
    }));
  }

  async getSignupTrends(region?: string) {
    // Mock signup trends data
    return {
      totalSignups: 150,
      monthlyGrowth: 12.5,
      regionalBreakdown: [
        { region: 'Downtown', signups: 45, change: 8.2 },
        { region: 'Suburbs', signups: 75, change: 15.3 },
        { region: 'Uptown', signups: 30, change: 5.1 },
      ],
    };
  }

  async suspendRestaurant(restaurantId: number, reason: string) {
    const restaurant = await this.restaurantRepository.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    restaurant.status = 'suspended';
    return this.restaurantRepository.save(restaurant);
  }
}

