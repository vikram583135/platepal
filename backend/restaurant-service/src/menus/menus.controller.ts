import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RestaurantsService } from '../restaurants/restaurants.service';

@Controller('menus')
export class MenusController {
  constructor(
    private readonly menusService: MenusService,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async addItem(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  findAll() {
    return this.menusService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const menu = await this.menusService.findOne(id);
    if (!menu) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }
    return menu;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    const menu = await this.menusService.update(id, updateMenuDto);
    if (!menu) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }
    return menu;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }

  @Post(':id/items')
  @UseGuards(JwtAuthGuard)
  async addItemToMenu(
    @Param('id') id: string,
    @Body() menuItemDto: { name: string; description: string; price: number; category: string },
  ) {
    const menu = await this.menusService.findOne(id);
    if (!menu) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }

    const category = menu.categories.find(c => c.name === menuItemDto.category);
    if (category) {
      category.items.push({
        name: menuItemDto.name,
        description: menuItemDto.description,
        price: menuItemDto.price,
        inStock: true,
      });
    } else {
      menu.categories.push({
        name: menuItemDto.category,
        items: [
          {
            name: menuItemDto.name,
            description: menuItemDto.description,
            price: menuItemDto.price,
            inStock: true,
          },
        ],
      });
    }

    return menu.save();
  }
}
