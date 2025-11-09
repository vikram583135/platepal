import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between } from 'typeorm';
import { Order } from '../orders/order.entity';

export interface EarningsPrediction {
  predictedEarnings: number;
  confidence: number;
  factors: string[];
  hours: number;
  area?: string;
}

@Injectable()
export class EarningsPredictionService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * Predict earnings for a delivery partner based on historical data
   */
  async predictEarnings(
    partnerId: string,
    hours: number = 2,
    area?: string,
  ): Promise<EarningsPrediction> {
    const now = new Date();
    const currentHour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Get historical orders from the last 30 days
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalOrders = await this.orderRepository.find({
      where: {
        createdAt: MoreThan(thirtyDaysAgo),
        status: 'delivered',
      },
    });

    // Calculate average earnings per hour
    const totalEarnings = historicalOrders.reduce(
      (sum, order) => sum + order.totalPrice * 0.15,
      0,
    );
    const totalHours = 30 * 8; // Assume 8 hours per day average
    const avgEarningsPerHour = totalEarnings / totalHours;

    // Time-of-day multiplier
    let timeMultiplier = 1.0;
    if (currentHour >= 11 && currentHour <= 14) {
      timeMultiplier = 1.5; // Lunch rush
    } else if (currentHour >= 18 && currentHour <= 21) {
      timeMultiplier = 1.8; // Dinner rush
    } else if (currentHour >= 21 || currentHour <= 2) {
      timeMultiplier = 1.3; // Late night
    }

    // Day-of-week multiplier
    let dayMultiplier = 1.0;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      dayMultiplier = 1.4; // Weekend
    } else if (dayOfWeek === 5) {
      dayMultiplier = 1.2; // Friday
    }

    // Calculate predicted earnings
    const predictedEarnings = avgEarningsPerHour * hours * timeMultiplier * dayMultiplier;

    // Calculate confidence based on data availability
    const confidence = Math.min(
      0.95,
      Math.max(0.5, historicalOrders.length / 100),
    );

    // Generate factors
    const factors: string[] = [];
    if (timeMultiplier > 1.0) {
      factors.push(
        `Peak hours: ${timeMultiplier > 1.5 ? 'High' : 'Moderate'} demand expected`,
      );
    }
    if (dayMultiplier > 1.0) {
      factors.push('Weekend/Peak day: Higher order volume');
    }
    if (historicalOrders.length > 50) {
      factors.push('Strong historical performance in this area');
    } else if (historicalOrders.length < 20) {
      factors.push('Limited historical data - prediction may vary');
    }

    if (area) {
      factors.push(`Area analysis: ${area} shows consistent activity`);
    }

    return {
      predictedEarnings: Math.round(predictedEarnings * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      factors,
      hours,
      area,
    };
  }

  /**
   * Get earnings statistics for a partner
   */
  async getPartnerEarningsStats(partnerId: string) {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date(now);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const todayOrders = await this.orderRepository.find({
      where: {
        createdAt: MoreThan(today),
        status: 'delivered',
      },
    });

    const weekOrders = await this.orderRepository.find({
      where: {
        createdAt: MoreThan(thisWeek),
        status: 'delivered',
      },
    });

    const todayEarnings = todayOrders.reduce(
      (sum, order) => sum + order.totalPrice * 0.15,
      0,
    );

    const weekEarnings = weekOrders.reduce(
      (sum, order) => sum + order.totalPrice * 0.15,
      0,
    );

    return {
      todayEarnings,
      weekEarnings,
      todayDeliveries: todayOrders.length,
      weekDeliveries: weekOrders.length,
    };
  }
}

