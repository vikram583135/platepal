import { Controller, Get, Param } from '@nestjs/common';
import { NotificationIntelligenceService } from './notification-intelligence.service';

@Controller('notifications')
export class NotificationIntelligenceController {
  constructor(
    private readonly notificationIntelligenceService: NotificationIntelligenceService,
  ) {}

  @Get('smart/:orderId')
  async getSmartNotifications(@Param('orderId') orderId: string) {
    const notifications =
      await this.notificationIntelligenceService.getSmartNotificationsForOrder(
        parseInt(orderId, 10),
      );

    return {
      success: true,
      notifications,
    };
  }

  @Get('proactive/:partnerId')
  async getProactiveNotifications(@Param('partnerId') partnerId: string) {
    const notifications =
      await this.notificationIntelligenceService.getProactiveNotifications(
        partnerId,
      );

    return {
      success: true,
      notifications,
    };
  }
}

