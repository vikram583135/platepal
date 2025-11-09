import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { OpenAIService } from '../common/openai.service';

export interface DashboardSummary {
  salesForecast: {
    predictedRevenue: number;
    confidence: number;
    reasoning: string;
    comparison: string;
  };
  popularItem: {
    name: string;
    orders: number;
    revenue: number;
    recommendation: string;
  };
  urgentAlerts: Array<{
    type: 'inventory' | 'opportunity' | 'warning';
    message: string;
    priority: 'high' | 'medium' | 'low';
    action?: string;
  }>;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  private readonly orderServiceUrl: string;
  private readonly restaurantServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly openAIService: OpenAIService,
  ) {
    this.orderServiceUrl = this.configService.get<string>('ORDER_SERVICE_URL') || 'http://localhost:3003';
    this.restaurantServiceUrl = this.configService.get<string>('RESTAURANT_SERVICE_URL') || 'http://localhost:3002';
  }

  async getDashboardSummary(restaurantId: number): Promise<DashboardSummary> {
    try {
      // Fetch recent order data
      const ordersResponse = await firstValueFrom(
        this.httpService.get(`${this.orderServiceUrl}/orders`, {
          params: { restaurantId },
        }),
      );
      const orders = ordersResponse.data || [];

      // Fetch menu data for popular items
      const menuResponse = await firstValueFrom(
        this.httpService.get(`${this.restaurantServiceUrl}/restaurants/${restaurantId}/menu`),
      );
      const menu = menuResponse.data;

      // Calculate today's orders and revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.createdAt || order.order_date);
        return orderDate >= today;
      });

      const todayRevenue = todayOrders.reduce((sum: number, order: any) => sum + (order.totalPrice || order.total_price || 0), 0);

      // Get historical data for comparison (last 7 days)
      const lastWeekOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.createdAt || order.order_date);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo && orderDate < today;
      });

      const avgDailyRevenue = lastWeekOrders.reduce((sum: number, order: any) => sum + (order.totalPrice || order.total_price || 0), 0) / 7;

      // Calculate popular item
      const itemCounts = new Map<string, { count: number; revenue: number }>();
      todayOrders.forEach((order: any) => {
        const items = order.items || [];
        items.forEach((item: any) => {
          const itemName = item.name || item.itemName;
          const price = item.price || 0;
          const quantity = item.quantity || 1;
          const total = price * quantity;

          if (itemCounts.has(itemName)) {
            const existing = itemCounts.get(itemName)!;
            existing.count += quantity;
            existing.revenue += total;
          } else {
            itemCounts.set(itemName, { count: quantity, revenue: total });
          }
        });
      });

      let popularItem = { name: 'N/A', orders: 0, revenue: 0 };
      if (itemCounts.size > 0) {
        const sorted = Array.from(itemCounts.entries()).sort((a, b) => b[1].count - a[1].count);
        const topItem = sorted[0];
        popularItem = {
          name: topItem[0],
          orders: topItem[1].count,
          revenue: topItem[1].revenue,
        };
      }

      // Generate AI insights
      const forecastPrompt = `Based on the following data, predict today's total revenue:
- Current revenue so far today: ₹${todayRevenue.toFixed(2)}
- Average daily revenue (last 7 days): ₹${avgDailyRevenue.toFixed(2)}
- Current time: ${new Date().toLocaleTimeString()}
- Day of week: ${today.toLocaleDateString('en-US', { weekday: 'long' })}

Provide a revenue forecast for the rest of the day with reasoning.`;

      const forecastReasoning = await this.openAIService.generateCompletion(
        forecastPrompt,
        'You are a restaurant analytics AI. Provide concise, data-driven revenue forecasts.',
      );

      // Extract predicted revenue from AI response (simple parsing)
      const predictedRevenue = this.extractRevenueFromText(forecastReasoning) || (avgDailyRevenue * 1.1);

      // Generate popular item recommendation
      const itemRecommendation = await this.openAIService.generateCompletion(
        `The item "${popularItem.name}" has ${popularItem.orders} orders today generating ₹${popularItem.revenue.toFixed(2)}. Provide a brief recommendation for the restaurant manager.`,
        'You are a restaurant management AI. Provide actionable recommendations in 1-2 sentences.',
      );

      // Generate urgent alerts
      const alerts: DashboardSummary['urgentAlerts'] = [];

      // Check for low inventory (mock - would need actual inventory data)
      if (popularItem.orders > 20) {
        alerts.push({
          type: 'opportunity',
          message: `${popularItem.name} is performing exceptionally well. Consider promoting it as a Chef's Special.`,
          priority: 'medium',
          action: 'Promote item',
        });
      }

      // Check for revenue opportunities
      const hoursUntilClose = 12 - new Date().getHours();
      if (hoursUntilClose > 0 && todayRevenue < avgDailyRevenue * 0.5) {
        alerts.push({
          type: 'opportunity',
          message: `Revenue is below average. ${hoursUntilClose} hours remaining to boost sales.`,
          priority: 'medium',
          action: 'Create promotion',
        });
      }

      return {
        salesForecast: {
          predictedRevenue: Math.round(predictedRevenue),
          confidence: 0.75,
          reasoning: forecastReasoning,
          comparison: `Today: ₹${todayRevenue.toFixed(2)} | Avg: ₹${avgDailyRevenue.toFixed(2)}`,
        },
        popularItem: {
          ...popularItem,
          recommendation: itemRecommendation,
        },
        urgentAlerts: alerts,
      };
    } catch (error) {
      this.logger.error('Error generating dashboard summary:', error);
      // Return default summary on error
      return {
        salesForecast: {
          predictedRevenue: 0,
          confidence: 0,
          reasoning: 'Unable to generate forecast due to data unavailability.',
          comparison: 'N/A',
        },
        popularItem: {
          name: 'N/A',
          orders: 0,
          revenue: 0,
          recommendation: 'Data unavailable',
        },
        urgentAlerts: [],
      };
    }
  }

  private extractRevenueFromText(text: string): number | null {
    // Simple regex to extract currency amounts
    const match = text.match(/₹[\d,]+\.?\d*/);
    if (match) {
      return parseFloat(match[0].replace(/[₹,]/g, ''));
    }
    return null;
  }
}

