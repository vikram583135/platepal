
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Menu, MenuSchema } from './menu.schema';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';

import { RestaurantsModule } from '../restaurants/restaurants.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Menu.name, schema: MenuSchema }]), RestaurantsModule],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}
