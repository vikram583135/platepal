import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import { Restaurant } from '../restaurants/restaurant.entity';
import { Menu } from '../menus/menu.schema';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectModel(Menu.name)
    private readonly menuModel: Model<Menu>,
  ) {}

  async seed() {
    // First, let's clear any existing data to prevent duplicates
    await this.restaurantRepository.clear();
    await this.menuModel.deleteMany({});

    // --- Create Restaurant 1: Punjab Tadka ---
    const restaurant1 = await this.restaurantRepository.save({
      name: 'Punjab Tadka',
      address: '123 MG Road, Bengaluru',
      ownerId: 'c2872c38-b5ea-4235-92a7-a38e3f1f2d0b', // Assume owner is the user with ID 1
    });

    await this.menuModel.create({
      restaurantId: restaurant1.id,
      categories: [
        {
          name: 'Appetizers',
          items: [
            { name: 'Paneer Tikka', price: 250, inStock: true },
            { name: 'Hara Bhara Kebab', price: 220, inStock: true },
          ],
        },
        {
          name: 'Main Course',
          items: [
            { name: 'Dal Makhani', price: 300, inStock: true },
            { name: 'Shahi Paneer', price: 350, inStock: false },
            { name: 'Garlic Naan', price: 60, inStock: true },
          ],
        },
      ],
    });

    // --- Create Restaurant 2: Anna's Kitchen ---
    const restaurant2 = await this.restaurantRepository.save({
      name: "Anna's Kitchen",
      address: '456 Indiranagar, Bengaluru',
      ownerId: '1d7f6b3b-6a4e-4b7a-8b0a-2b0c9f0d8a9f',
    });

    await this.menuModel.create({
      restaurantId: restaurant2.id,
      categories: [
        {
          name: 'South Indian',
          items: [
            { name: 'Masala Dosa', price: 120, inStock: true },
            { name: 'Idli Vada', price: 80, inStock: true },
            { name: 'Rava Kesari', price: 100, inStock: false },
          ],
        },
      ],
    });

    return 'Seeding complete!';
  }
}
