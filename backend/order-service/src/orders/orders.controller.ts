import { Controller, Post, Body, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

// Sets the base route for this controller to '/orders'
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Handles POST requests to /orders to create a new order.
   * @param createOrderDto The request body, automatically validated by the ValidationPipe.
   */
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get('active')
  getActiveOrders() {
    return this.ordersService.getActiveOrders();
  }
}