import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Menu } from './menu.schema';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(@InjectModel(Menu.name) private menuModel: Model<Menu>) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const createdMenu = new this.menuModel(createMenuDto);
    return createdMenu.save();
  }

  async findAll(): Promise<Menu[]> {
    return this.menuModel.find().exec();
  }

  async findOne(id: string): Promise<Menu | null> {
    return this.menuModel.findById(id).exec();
  }

  async findMenuByRestaurantId(restaurantId: number): Promise<Menu | null> {
    return this.menuModel.findOne({ restaurantId }).exec();
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu | null> {
    return this.menuModel.findByIdAndUpdate(id, updateMenuDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    return this.menuModel.findByIdAndDelete(id).exec();
  }
}
