import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../common/openai.service';

export interface OrderAnalysis {
  complexity: 'low' | 'medium' | 'high';
  complexityScore: number;
  estimatedPrepTime: number; // in minutes
  flags: Array<'large' | 'complex' | 'high-priority' | 'vip'>;
  priority: number;
  reasoning: string;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly openAIService: OpenAIService) {}

  async analyzeOrder(
    order: any,
    restaurantId: number,
    kitchenLoad: number = 0,
  ): Promise<OrderAnalysis> {
    try {
      const items = order.items || [];
      const totalPrice = order.totalPrice || order.total_price || 0;
      const itemCount = items.length;
      const totalQuantity = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);

      // Calculate complexity based on order characteristics
      let complexityScore = 0;
      const flags: Array<'large' | 'complex' | 'high-priority' | 'vip'> = [];

      // Large order flag (>₹2000)
      if (totalPrice > 2000) {
        flags.push('large');
        complexityScore += 20;
      }

      // Complex order flag (5+ items)
      if (itemCount >= 5) {
        flags.push('complex');
        complexityScore += 30;
      }

      // High priority (VIP customers - would need customer data)
      if (order.customerId && this.isVIPCustomer(order.customerId)) {
        flags.push('high-priority');
        flags.push('vip');
        complexityScore += 40;
      }

      // Determine complexity level
      let complexity: 'low' | 'medium' | 'high';
      if (complexityScore < 30) {
        complexity = 'low';
      } else if (complexityScore < 60) {
        complexity = 'medium';
      } else {
        complexity = 'high';
      }

      // Estimate prep time based on complexity and kitchen load
      const basePrepTime = this.estimateBasePrepTime(itemCount, totalQuantity, complexity);
      const loadMultiplier = 1 + (kitchenLoad / 100); // Increase time by load percentage
      const estimatedPrepTime = Math.round(basePrepTime * loadMultiplier);

      // Generate AI reasoning
      const prompt = `Analyze this restaurant order:
- Total price: ₹${totalPrice}
- Item count: ${itemCount}
- Total quantity: ${totalQuantity}
- Complexity score: ${complexityScore}
- Kitchen load: ${kitchenLoad}%
- Estimated prep time: ${estimatedPrepTime} minutes

Provide a brief reasoning for the order priority and complexity assessment.`;

      const reasoning = await this.openAIService.generateCompletion(
        prompt,
        'You are a restaurant kitchen management AI. Provide concise order analysis.',
      );

      // Calculate priority (higher = more urgent)
      const priority = this.calculatePriority(complexityScore, estimatedPrepTime, flags);

      return {
        complexity,
        complexityScore,
        estimatedPrepTime,
        flags,
        priority,
        reasoning: reasoning || 'Order processed successfully.',
      };
    } catch (error) {
      this.logger.error('Error analyzing order:', error);
      return {
        complexity: 'medium',
        complexityScore: 50,
        estimatedPrepTime: 30,
        flags: [],
        priority: 50,
        reasoning: 'Unable to analyze order due to data unavailability.',
      };
    }
  }

  async prioritizeOrders(orders: any[], restaurantId: number): Promise<any[]> {
    try {
      // Analyze all orders
      const analyzedOrders = await Promise.all(
        orders.map((order) => this.analyzeOrder(order, restaurantId)),
      );

      // Sort by priority (highest first)
      const prioritized = orders
        .map((order, index) => ({
          ...order,
          analysis: analyzedOrders[index],
        }))
        .sort((a, b) => b.analysis.priority - a.analysis.priority);

      return prioritized;
    } catch (error) {
      this.logger.error('Error prioritizing orders:', error);
      return orders; // Return original order if prioritization fails
    }
  }

  private isVIPCustomer(customerId: any): boolean {
    // Mock implementation - would check against customer database
    // For now, return false or implement actual VIP check
    return false;
  }

  private estimateBasePrepTime(itemCount: number, totalQuantity: number, complexity: string): number {
    // Base prep time estimates
    const baseTimePerItem = 8; // 8 minutes per item on average
    const baseTime = itemCount * baseTimePerItem;

    // Adjust for complexity
    const complexityMultiplier = {
      low: 0.8,
      medium: 1.0,
      high: 1.5,
    };

    return Math.round(baseTime * complexityMultiplier[complexity]);
  }

  private calculatePriority(
    complexityScore: number,
    estimatedPrepTime: number,
    flags: string[],
  ): number {
    let priority = 50; // Base priority

    // Increase priority for high complexity
    priority += complexityScore;

    // Increase priority for VIP/high-priority flags
    if (flags.includes('vip')) priority += 30;
    if (flags.includes('high-priority')) priority += 20;

    // Decrease priority for longer prep times (less urgent)
    priority -= Math.min(estimatedPrepTime / 10, 20);

    return Math.max(0, Math.min(100, priority)); // Clamp between 0-100
  }
}

