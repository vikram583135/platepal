import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { OrdersService } from './orders/orders.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly ordersService: OrdersService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('analytics/summary')
  getSummary() {
    return this.ordersService.getSummaryData();
  }

  @Get('analytics/weekly-volume')
  getWeeklyVolume() {
    return this.ordersService.getWeeklyVolume();
  }
}