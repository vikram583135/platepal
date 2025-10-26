import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
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

  @IsBoolean()
  inStock: boolean;
}

// DTO for a menu category
class MenuCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true }) // This validates each item in the array against MenuItemDto
  @Type(() => MenuItemDto)
  items: MenuItemDto[];
}

// This is the main DTO for the entire request body
export class UpdateMenuDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuCategoryDto)
  categories: MenuCategoryDto[];
}
