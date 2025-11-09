import { Controller, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';

export class AnalyzeOrderDto {
  order: any;
  restaurantId: number;
  kitchenLoad?: number;
}

export class PrioritizeOrdersDto {
  orders: any[];
  restaurantId: number;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('analyze')
  async analyzeOrder(@Body() dto: AnalyzeOrderDto) {
    return this.ordersService.analyzeOrder(dto.order, dto.restaurantId, dto.kitchenLoad);
  }

  @Post('prioritize')
  async prioritizeOrders(@Body() dto: PrioritizeOrdersDto) {
    return this.ordersService.prioritizeOrders(dto.orders, dto.restaurantId);
  }
}

