import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
// We need to import the same tools and models as our RestaurantsModule
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Restaurant } from '../restaurants/restaurant.entity';
import { Menu, MenuSchema } from '../menus/menu.schema';

@Module({
  // Provide this module with the necessary database tools
  imports: [
    TypeOrmModule.forFeature([Restaurant]),
    MongooseModule.forFeature([{ name: Menu.name, schema: MenuSchema }]),
  ],
  controllers: [SeederController],
  providers: [SeederService],
})
export class SeederModule {}
