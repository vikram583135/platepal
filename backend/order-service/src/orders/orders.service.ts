import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersGateway } from './orders.gateway';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const newOrder = this.orderRepository.create(createOrderDto);
    const savedOrder = await this.orderRepository.save(newOrder);

    this.ordersGateway.sendNewOrder(savedOrder);

    return savedOrder;
  }

  async getActiveOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      where: { status: In(['new', 'preparing', 'ready', 'out_for_delivery']) },
      order: { createdAt: 'DESC' },
    });
  }

  async getSummaryData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRevenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :today', { today })
      .select('SUM(order.totalPrice)', 'total')
      .getRawOne();

    const todayOrders = await this.orderRepository.count({ where: { createdAt: MoreThan(today) } });

    const newCustomersResult = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :today', { today })
      .select('COUNT(DISTINCT "customerId")', 'count')
      .getRawOne();

    return {
      todayRevenue: parseFloat(todayRevenueResult.total) || 0,
      todayOrders: todayOrders || 0,
      newCustomers: parseInt(newCustomersResult.count) || 0,
    };
  }

  async getWeeklyVolume() {
    const today = new Date();
    const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    const weeklyData = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :weekAgo', { weekAgo })
      .select("TO_CHAR(\"createdAt\", 'Day')", 'name')
      .addSelect('SUM("totalPrice")', 'total')
      .groupBy("TO_CHAR(\"createdAt\", 'Day')")
      .getRawMany();

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const result = daysOfWeek.map(day => ({
        name: day.trim(),
        total: 0,
    }));

    weeklyData.forEach(data => {
        const index = result.findIndex(day => day.name === data.name.trim());
        if (index !== -1) {
            result[index].total = parseFloat(data.total);
        }
    });

    return result;
  }

  async updateStatus(orderId: number, status: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = status;
    const updatedOrder = await this.orderRepository.save(order);

    // Send real-time status update
    this.ordersGateway.sendOrderStatusUpdate(
      updatedOrder.id,
      updatedOrder.restaurantId,
      updatedOrder.customerId,
      status,
      updatedOrder
    );

    return updatedOrder;
  }

  async assignDelivery(orderId: number, deliveryPartnerId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new Error('Order not found');
    }

    // Update order status to out_for_delivery
    order.status = 'out_for_delivery';
    const updatedOrder = await this.orderRepository.save(order);

    // Send real-time delivery assignment notification
    this.ordersGateway.sendDeliveryAssigned(
      updatedOrder.id,
      updatedOrder.restaurantId,
      updatedOrder.customerId,
      deliveryPartnerId,
      updatedOrder
    );

    return updatedOrder;
  }

  async markPickedUp(orderId: number, deliveryPartnerId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new Error('Order not found');
    }

    // Send real-time pickup notification
    this.ordersGateway.sendDeliveryPickedUp(
      order.id,
      order.restaurantId,
      order.customerId,
      deliveryPartnerId
    );

    return order;
  }

  async markDelivered(orderId: number, deliveryPartnerId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = 'delivered';
    const updatedOrder = await this.orderRepository.save(order);

    // Send real-time delivery notification
    this.ordersGateway.sendDeliveryDelivered(
      updatedOrder.id,
      updatedOrder.restaurantId,
      updatedOrder.customerId,
      deliveryPartnerId
    );

    return updatedOrder;
  }

  async cancelOrder(orderId: number, reason?: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = 'cancelled';
    const updatedOrder = await this.orderRepository.save(order);

    // Send real-time cancellation notification
    this.ordersGateway.sendOrderCancelled(
      updatedOrder.id,
      updatedOrder.restaurantId,
      updatedOrder.customerId,
      reason
    );

    return updatedOrder;
  }
}