import { Module } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
// 1. Import the tools for our databases
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
// 2. Import our data models
import { Restaurant } from './restaurant.entity';
import { Menu, MenuSchema } from '../menus/menu.schema';

@Module({
  // 3. Register the models with this module
  imports: [
    // This gives the module access to the 'Restaurant' repository (PostgreSQL)
    TypeOrmModule.forFeature([Restaurant]),
    // This gives the module access to the 'Menu' model (MongoDB)
    MongooseModule.forFeature([{ name: Menu.name, schema: MenuSchema }]),
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
})
export class RestaurantsModule {}
