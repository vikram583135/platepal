import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../common/openai.service';

export interface PromotionSuggestion {
  type: 'discount' | 'combo' | 'bogo' | 'time-based';
  title: string;
  description: string;
  items: string[];
  discountValue?: number;
  timeRange?: { start: string; end: string };
  reasoning: string;
  expectedImpact: {
    revenueIncrease: number; // percentage
    orderIncrease: number; // percentage
  };
  confidence: number;
}

export interface PromotionPrediction {
  expectedRevenue: number;
  expectedOrders: number;
  revenueIncrease: number; // percentage
  orderIncrease: number; // percentage
  confidence: number;
  recommendations: string[];
}

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(private readonly openAIService: OpenAIService) {}

  async suggestPromotions(
    salesData: any[],
    menuItems: any[],
    restaurantId: number,
    timeRange?: { start: string; end: string },
  ): Promise<PromotionSuggestion[]> {
    try {
      // Analyze sales patterns
      const salesByHour = this.analyzeSalesByHour(salesData);
      const salesByDay = this.analyzeSalesByDay(salesData);
      const topItems = this.getTopItems(salesData, 5);

      // Identify slow periods
      const slowHours = this.identifySlowPeriods(salesByHour);
      const slowDays = this.identifySlowDays(salesByDay);

      const suggestions: PromotionSuggestion[] = [];

      // Time-based promotion for slow periods
      if (slowHours.length > 0) {
        const slowHour = slowHours[0];
        const prompt = `Suggest a time-based promotion for slow business hours:
- Slow hours: ${slowHour.hour}:00 - ${slowHour.hour + 1}:00
- Average orders during this time: ${slowHour.orders}
- Top items: ${topItems.map((i) => i.name).join(', ')}

Create a promotion that boosts sales during this time period. Suggest specific items and discount value.`;

        const suggestionText = await this.openAIService.generateCompletion(
          prompt,
          'You are a restaurant promotion strategist. Suggest effective time-based promotions.',
        );

        suggestions.push({
          type: 'time-based',
          title: `${slowHour.hour}:00 - ${slowHour.hour + 1}:00 Special`,
          description: suggestionText,
          items: topItems.slice(0, 2).map((i) => i.name),
          discountValue: 15,
          timeRange: {
            start: `${String(slowHour.hour).padStart(2, '0')}:00`,
            end: `${String(slowHour.hour + 1).padStart(2, '0')}:00`,
          },
          reasoning: suggestionText,
          expectedImpact: {
            revenueIncrease: 25,
            orderIncrease: 40,
          },
          confidence: 0.7,
        });
      }

      // Combo promotion for top items
      if (topItems.length >= 2) {
        const comboItems = topItems.slice(0, 2);
        const prompt = `Suggest a combo promotion:
- Item 1: ${comboItems[0].name} (₹${comboItems[0].price})
- Item 2: ${comboItems[1].name} (₹${comboItems[1].price})

Create an attractive combo deal with discount.`;

        const suggestionText = await this.openAIService.generateCompletion(
          prompt,
          'You are a restaurant promotion strategist. Suggest effective combo promotions.',
        );

        suggestions.push({
          type: 'combo',
          title: `${comboItems[0].name} & ${comboItems[1].name} Combo`,
          description: suggestionText,
          items: comboItems.map((i) => i.name),
          discountValue: 20,
          reasoning: suggestionText,
          expectedImpact: {
            revenueIncrease: 30,
            orderIncrease: 35,
          },
          confidence: 0.75,
        });
      }

      // Weekend promotion if weekdays are slower
      if (slowDays.includes('weekday')) {
        const prompt = `Suggest a weekday promotion to boost sales:
- Weekday sales are lower than weekends
- Top items: ${topItems.map((i) => i.name).join(', ')}

Create a weekday-specific promotion.`;

        const suggestionText = await this.openAIService.generateCompletion(
          prompt,
          'You are a restaurant promotion strategist. Suggest effective weekday promotions.',
        );

        suggestions.push({
          type: 'time-based',
          title: 'Weekday Lunch Special',
          description: suggestionText,
          items: topItems.slice(0, 3).map((i) => i.name),
          discountValue: 15,
          timeRange: {
            start: '11:00',
            end: '15:00',
          },
          reasoning: suggestionText,
          expectedImpact: {
            revenueIncrease: 20,
            orderIncrease: 30,
          },
          confidence: 0.7,
        });
      }

      return suggestions;
    } catch (error) {
      this.logger.error('Error suggesting promotions:', error);
      return [];
    }
  }

  async predictPromotionImpact(
    promotion: any,
    salesHistory: any[],
    restaurantId: number,
  ): Promise<PromotionPrediction> {
    try {
      const { type, discountValue, items, timeRange } = promotion;

      // Calculate baseline metrics
      const baselineRevenue = salesHistory.reduce((sum, sale) => sum + (sale.revenue || sale.totalPrice || 0), 0);
      const baselineOrders = salesHistory.length;

      // Simple prediction model
      const discountMultiplier = discountValue / 100;
      const expectedOrderIncrease = discountMultiplier * 50; // 50% order increase per 1% discount
      const expectedRevenueIncrease = expectedOrderIncrease - (discountValue * 0.8); // Account for discount

      const expectedOrders = Math.round(baselineOrders * (1 + expectedOrderIncrease / 100));
      const expectedRevenue = baselineRevenue * (1 + expectedRevenueIncrease / 100);

      // Generate AI prediction with recommendations
      const prompt = `Predict the impact of this promotion:
- Type: ${type}
- Discount: ${discountValue}%
- Items: ${items?.join(', ') || 'All items'}
- Time range: ${timeRange ? `${timeRange.start} - ${timeRange.end}` : 'All day'}

Provide prediction and recommendations for optimization.`;

      const predictionText = await this.openAIService.generateCompletion(
        prompt,
        'You are a restaurant analytics AI. Predict promotion impact and provide optimization recommendations.',
      );

      const recommendations = this.extractRecommendations(predictionText);

      return {
        expectedRevenue: Math.round(expectedRevenue),
        expectedOrders,
        revenueIncrease: expectedRevenueIncrease,
        orderIncrease: expectedOrderIncrease,
        confidence: 0.75,
        recommendations,
      };
    } catch (error) {
      this.logger.error('Error predicting promotion impact:', error);
      return {
        expectedRevenue: 0,
        expectedOrders: 0,
        revenueIncrease: 0,
        orderIncrease: 0,
        confidence: 0,
        recommendations: [],
      };
    }
  }

  async optimizePromotion(
    promotion: any,
    performanceData: any[],
    restaurantId: number,
  ): Promise<{ optimizedPromotion: any; improvements: string[] }> {
    try {
      // Analyze current performance
      const currentPerformance = this.analyzePromotionPerformance(performanceData);

      // Generate optimization suggestions
      const prompt = `Optimize this promotion based on performance:
- Current usage: ${currentPerformance.usageCount}
- Revenue generated: ₹${currentPerformance.revenue}
- Conversion rate: ${currentPerformance.conversionRate}%

Provide optimization suggestions.`;

      const optimizationText = await this.openAIService.generateCompletion(
        prompt,
        'You are a restaurant promotion optimization AI. Suggest improvements to increase effectiveness.',
      );

      const improvements = this.extractRecommendations(optimizationText);

      return {
        optimizedPromotion: {
          ...promotion,
          // Apply optimizations
        },
        improvements,
      };
    } catch (error) {
      this.logger.error('Error optimizing promotion:', error);
      return {
        optimizedPromotion: promotion,
        improvements: [],
      };
    }
  }

  private analyzeSalesByHour(salesData: any[]): Map<number, number> {
    const salesByHour = new Map<number, number>();

    salesData.forEach((sale) => {
      const date = new Date(sale.createdAt || sale.order_date);
      const hour = date.getHours();
      salesByHour.set(hour, (salesByHour.get(hour) || 0) + 1);
    });

    return salesByHour;
  }

  private analyzeSalesByDay(salesData: any[]): Map<string, number> {
    const salesByDay = new Map<string, number>();

    salesData.forEach((sale) => {
      const date = new Date(sale.createdAt || sale.order_date);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      salesByDay.set(day, (salesByDay.get(day) || 0) + 1);
    });

    return salesByDay;
  }

  private getTopItems(salesData: any[], count: number): Array<{ name: string; price: number; orders: number }> {
    const itemCounts = new Map<string, { price: number; orders: number }>();

    salesData.forEach((sale) => {
      const items = sale.items || [];
      items.forEach((item: any) => {
        const name = item.name || item.itemName;
        const price = item.price || 0;
        if (itemCounts.has(name)) {
          itemCounts.get(name)!.orders += item.quantity || 1;
        } else {
          itemCounts.set(name, { price, orders: item.quantity || 1 });
        }
      });
    });

    return Array.from(itemCounts.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, count);
  }

  private identifySlowPeriods(salesByHour: Map<number, number>): Array<{ hour: number; orders: number }> {
    const avgOrders = Array.from(salesByHour.values()).reduce((a, b) => a + b, 0) / salesByHour.size;
    const slowPeriods: Array<{ hour: number; orders: number }> = [];

    salesByHour.forEach((orders, hour) => {
      if (orders < avgOrders * 0.7) {
        slowPeriods.push({ hour, orders });
      }
    });

    return slowPeriods.sort((a, b) => a.orders - b.orders);
  }

  private identifySlowDays(salesByDay: Map<string, number>): string[] {
    const avgOrders = Array.from(salesByDay.values()).reduce((a, b) => a + b, 0) / salesByDay.size;
    const slowDays: string[] = [];

    salesByDay.forEach((orders, day) => {
      if (orders < avgOrders * 0.8) {
        slowDays.push(day.toLowerCase());
      }
    });

    return slowDays;
  }

  private analyzePromotionPerformance(performanceData: any[]): {
    usageCount: number;
    revenue: number;
    conversionRate: number;
  } {
    const usageCount = performanceData.length;
    const revenue = performanceData.reduce((sum, d) => sum + (d.revenue || d.totalPrice || 0), 0);
    const conversionRate = usageCount > 0 ? (usageCount / (usageCount + 100)) * 100 : 0; // Simplified

    return { usageCount, revenue, conversionRate };
  }

  private extractRecommendations(text: string): string[] {
    return text
      .split('\n')
      .filter((line) => line.trim().length > 0 && (line.includes('-') || line.includes('•') || /^\d+\./.test(line.trim())))
      .map((line) => line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
      .filter((line) => line.length > 0);
  }
}

