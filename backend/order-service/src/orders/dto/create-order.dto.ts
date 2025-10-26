import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

// This DTO validates a single item within the order's item list.
class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  price: number;
}

// This is the main DTO for the entire POST /orders request body.
export class CreateOrderDto {
  @IsNumber()
  restaurantId: number;

  @IsNumber()
  customerId: number;

  @IsNumber()
  totalPrice: number;

  // We ensure 'items' is an array...
  @IsArray()
  // ...and we validate each object inside the array against our OrderItemDto.
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

