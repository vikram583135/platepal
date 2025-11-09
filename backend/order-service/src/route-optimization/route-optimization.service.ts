import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from '../orders/order.entity';
import {
  batchOrders,
  calculateOptimalRoute,
  parseAddressToCoordinates,
  PartnerLocation,
  OrderBatch,
} from './order-batcher';

@Injectable()
export class RouteOptimizationService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * Get available batches for a delivery partner
   */
  async getAvailableBatches(
    partnerLocation: PartnerLocation,
    maxBatchSize: number = 3,
  ): Promise<OrderBatch[]> {
    // Get available orders (ready for pickup)
    const availableOrders = await this.orderRepository.find({
      where: { status: In(['ready', 'pending']) },
      order: { createdAt: 'ASC' },
    });

    if (availableOrders.length === 0) {
      return [];
    }

    // Batch orders
    const batches = batchOrders(availableOrders, partnerLocation, maxBatchSize);

    return batches;
  }

  /**
   * Optimize route for a specific batch
   */
  async optimizeRoute(
    batchId: string,
    partnerLocation: PartnerLocation,
  ): Promise<{ route: string[]; totalDistance: number; estimatedTime: number }> {
    // Get orders by IDs (in production, batchId would be a proper identifier)
    const orderIds = batchId.split(',').map(id => parseInt(id, 10));
    const orders = await this.orderRepository.find({
      where: { id: In(orderIds) },
    });

    if (orders.length === 0) {
      throw new Error('No orders found for batch');
    }

    const { route, totalDistance, estimatedTime } = calculateOptimalRoute(
      partnerLocation,
      orders,
    );

    // Generate mock delivery addresses from customer IDs
    return {
      route: route.map(order => `Customer ${order.customerId}, Address ${order.customerId * 20}`),
      totalDistance,
      estimatedTime,
    };
  }

  /**
   * Calculate route efficiency score
   */
  calculateEfficiencyScore(
    orders: Order[],
    totalDistance: number,
    estimatedTime: number,
  ): number {
    const totalEarnings = orders.reduce(
      (sum, order) => sum + order.totalPrice * 0.15,
      0,
    );

    // Efficiency = earnings per minute
    return totalEarnings / Math.max(estimatedTime, 1);
  }
}

