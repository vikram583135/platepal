import { Module } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
// 1. We need to import the tools and models.
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Restaurant } from './restaurant.entity';
import { Review } from './review.entity';
import { Menu, MenuSchema } from '../menus/menu.schema';

@Module({
  // 2. The 'imports' array is the "toolbox". We must put our tools here.
  imports: [
    // This line provides the "RestaurantRepository" tool.
    TypeOrmModule.forFeature([Restaurant, Review]),
    
    // This line provides the "MenuModel" tool.
    MongooseModule.forFeature([{ name: Menu.name, schema: MenuSchema }]),
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}

