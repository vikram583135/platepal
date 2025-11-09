import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between } from 'typeorm';
import { Order } from '../orders/order.entity';

export interface SmartNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'high' | 'medium' | 'low';
  message: string;
  action?: string;
  timestamp: Date;
  orderId?: string;
}

@Injectable()
export class NotificationIntelligenceService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * Generate smart notifications for an order
   */
  async getSmartNotificationsForOrder(orderId: number): Promise<SmartNotification[]> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      return [];
    }

    const notifications: SmartNotification[] = [];
    const now = new Date();
    const currentHour = now.getHours();

    // Check restaurant busy times
    const restaurantOrders = await this.orderRepository.find({
      where: {
        restaurantId: order.restaurantId,
        createdAt: MoreThan(new Date(now.getTime() - 2 * 60 * 60 * 1000)), // Last 2 hours
      },
    });

    if (restaurantOrders.length > 10) {
      notifications.push({
        id: `busy-${orderId}`,
        type: 'warning',
        priority: 'medium',
        message: `This restaurant is usually busy at this time. You may have a 5-10 minute wait.`,
        action: 'View wait time estimate',
        timestamp: now,
        orderId: String(orderId),
      });
    }

    // Check parking difficulty (mock - in production, use address analysis or historical data)
    // Generate mock address from customer ID
    const address = `Customer ${order.customerId}, Address ${order.customerId * 20}`;
    if (address.toLowerCase().includes('mall') || address.toLowerCase().includes('complex')) {
      notifications.push({
        id: `parking-${orderId}`,
        type: 'info',
        priority: 'medium',
        message: `Parking may be difficult at this address. Here's a suggested drop-off zone: Main entrance`,
        action: 'View drop-off zone',
        timestamp: now,
        orderId: String(orderId),
      });
    }

    // Time-based notifications
    if (currentHour >= 18 && currentHour <= 20) {
      notifications.push({
        id: `traffic-${orderId}`,
        type: 'warning',
        priority: 'high',
        message: `Traffic alert: Heavy traffic expected during rush hour. Add 10-15 minutes to your route.`,
        timestamp: now,
        orderId: String(orderId),
      });
    }

    return notifications;
  }

  /**
   * Get proactive notifications for a delivery partner
   */
  async getProactiveNotifications(partnerId: string): Promise<SmartNotification[]> {
    const notifications: SmartNotification[] = [];
    const now = new Date();
    const currentHour = now.getHours();

    // Weather/traffic alerts (mock - in production, integrate with weather/traffic APIs)
    if (currentHour >= 7 && currentHour <= 9) {
      notifications.push({
        id: `morning-rush-${partnerId}`,
        type: 'info',
        priority: 'medium',
        message: `Morning rush hour: Peak delivery times approaching. Consider starting early!`,
        timestamp: now,
      });
    }

    // Peak earning opportunity
    if (currentHour >= 11 && currentHour <= 14) {
      notifications.push({
        id: `lunch-peak-${partnerId}`,
        type: 'success',
        priority: 'high',
        message: `Lunch peak hours: High earning opportunity! Stay online for maximum orders.`,
        timestamp: now,
      });
    }

    return notifications;
  }
}

