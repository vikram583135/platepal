import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

// DTO for a single menu item
class MenuItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  price: number;
}

// DTO for a menu category
class MenuCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  items: MenuItemDto[];
}

// This is the main DTO for the entire request body
export class CreateMenuDto {
  @IsNumber()
  restaurantId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuCategoryDto)
  categories: MenuCategoryDto[];
}
