import { Controller, Get, Post, Param, Body } from '@nestjs/common';
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

  @Get('analytics/platform-health')
  getPlatformHealth() {
    return this.ordersService.getPlatformHealth();
  }

  @Get('analytics/fraud-alerts')
  getFraudAlerts() {
    return this.ordersService.getFraudAlerts();
  }

  @Get('analytics/regional-stats')
  getRegionalStats() {
    return this.ordersService.getRegionalStats();
  }

  @Get('orders/suspicious')
  getSuspiciousOrders() {
    return this.ordersService.getSuspiciousOrders();
  }

  @Post('orders/:orderId/flag-fraud')
  flagOrderAsFraud(@Param('orderId') orderId: string, @Body() body: { reason: string }) {
    return this.ordersService.flagOrderAsFraud(parseInt(orderId), body.reason);
  }
}