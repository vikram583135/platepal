import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../common/openai.service';

export interface MenuItemAnalysis {
  itemId: string;
  name: string;
  performance: {
    revenue: number;
    orders: number;
    avgOrderValue: number;
    performanceScore: number; // 0-100
  };
  comparison: {
    similarItems: string[];
    performanceVsSimilar: number; // percentage difference
  };
  recommendations: string[];
}

export interface PricingSuggestion {
  currentPrice: number;
  suggestedPrice: number;
  reasoning: string;
  expectedImpact: {
    revenueChange: number; // percentage
    orderChange: number; // percentage
  };
  confidence: number;
}

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  constructor(private readonly openAIService: OpenAIService) {}

  async analyzeMenuPerformance(
    menuItems: any[],
    salesData: any[],
    restaurantId: number,
  ): Promise<MenuItemAnalysis[]> {
    try {
      const analyses: MenuItemAnalysis[] = [];

      // Calculate performance metrics for each item
      for (const item of menuItems) {
        const itemSales = salesData.filter((sale: any) => sale.itemId === item.id || sale.itemName === item.name);
        
        const revenue = itemSales.reduce((sum: number, sale: any) => sum + (sale.revenue || sale.totalPrice || 0), 0);
        const orders = itemSales.length;
        const avgOrderValue = orders > 0 ? revenue / orders : 0;

        // Calculate performance score (0-100)
        const avgRevenue = menuItems.reduce((sum, i) => {
          const iSales = salesData.filter((s: any) => s.itemId === i.id || s.itemName === i.name);
          return sum + iSales.reduce((s: number, sale: any) => s + (sale.revenue || sale.totalPrice || 0), 0);
        }, 0) / menuItems.length;

        const performanceScore = Math.min(100, (revenue / avgRevenue) * 50);

        // Find similar items (same category)
        const similarItems = menuItems
          .filter((i) => i.category === item.category && i.id !== item.id)
          .map((i) => i.name);

        // Compare with similar items
        const similarRevenue = similarItems.length > 0
          ? similarItems.reduce((sum, name) => {
              const sSales = salesData.filter((s: any) => s.itemName === name);
              return sum + sSales.reduce((s: number, sale: any) => s + (sale.revenue || sale.totalPrice || 0), 0);
            }, 0) / similarItems.length
          : revenue;

        const performanceVsSimilar = similarRevenue > 0
          ? ((revenue - similarRevenue) / similarRevenue) * 100
          : 0;

        // Generate AI recommendations
        const prompt = `Menu item "${item.name}" analysis:
- Revenue: ₹${revenue.toFixed(2)}
- Orders: ${orders}
- Performance vs similar items: ${performanceVsSimilar.toFixed(1)}%
- Performance score: ${performanceScore.toFixed(1)}/100

Provide 2-3 actionable recommendations for this menu item.`;

        const recommendationsText = await this.openAIService.generateCompletion(
          prompt,
          'You are a restaurant menu optimization AI. Provide concise, actionable recommendations.',
        );

        const recommendations = this.extractRecommendations(recommendationsText);

        analyses.push({
          itemId: item.id,
          name: item.name,
          performance: {
            revenue,
            orders,
            avgOrderValue,
            performanceScore,
          },
          comparison: {
            similarItems,
            performanceVsSimilar,
          },
          recommendations,
        });
      }

      return analyses;
    } catch (error) {
      this.logger.error('Error analyzing menu performance:', error);
      return [];
    }
  }

  async suggestPricing(
    menuItem: any,
    salesHistory: any[],
    competitorPrices: any[] = [],
    restaurantId: number,
  ): Promise<PricingSuggestion> {
    try {
      const currentPrice = menuItem.price || 0;
      const itemSales = salesHistory.filter((s: any) => s.itemId === menuItem.id || s.itemName === menuItem.name);

      // Calculate price elasticity (simplified)
      const totalOrders = itemSales.length;
      const avgDailyOrders = totalOrders / 30; // Assuming 30 days of data

      // Generate pricing suggestion with AI
      const prompt = `Suggest optimal pricing for menu item "${menuItem.name}":
- Current price: ₹${currentPrice}
- Total orders (last 30 days): ${totalOrders}
- Average daily orders: ${avgDailyOrders.toFixed(1)}
${competitorPrices.length > 0 ? `- Competitor average: ₹${(competitorPrices.reduce((s, p) => s + p.price, 0) / competitorPrices.length).toFixed(2)}` : ''}

Provide pricing recommendation with reasoning and expected impact.`;

      const suggestion = await this.openAIService.generateCompletion(
        prompt,
        'You are a restaurant pricing optimization AI. Suggest optimal pricing with data-driven reasoning.',
      );

      // Extract suggested price (simple parsing)
      const suggestedPrice = this.extractPriceFromText(suggestion) || currentPrice;
      const priceChange = ((suggestedPrice - currentPrice) / currentPrice) * 100;

      // Estimate impact (simplified model)
      const elasticity = -0.5; // Price elasticity coefficient
      const expectedOrderChange = priceChange * elasticity;
      const expectedRevenueChange = priceChange + expectedOrderChange;

      return {
        currentPrice,
        suggestedPrice,
        reasoning: suggestion,
        expectedImpact: {
          revenueChange: expectedRevenueChange,
          orderChange: expectedOrderChange,
        },
        confidence: 0.75,
      };
    } catch (error) {
      this.logger.error('Error suggesting pricing:', error);
      return {
        currentPrice: menuItem.price || 0,
        suggestedPrice: menuItem.price || 0,
        reasoning: 'Unable to generate pricing suggestion.',
        expectedImpact: {
          revenueChange: 0,
          orderChange: 0,
        },
        confidence: 0,
      };
    }
  }

  async getMenuRecommendations(
    menuItems: any[],
    salesData: any[],
    restaurantId: number,
  ): Promise<{ recommendations: string[]; topPerformers: string[]; underperformers: string[] }> {
    try {
      const analyses = await this.analyzeMenuPerformance(menuItems, salesData, restaurantId);

      const topPerformers = analyses
        .filter((a) => a.performance.performanceScore > 70)
        .sort((a, b) => b.performance.performanceScore - a.performance.performanceScore)
        .slice(0, 5)
        .map((a) => a.name);

      const underperformers = analyses
        .filter((a) => a.performance.performanceScore < 40)
        .sort((a, b) => a.performance.performanceScore - b.performance.performanceScore)
        .slice(0, 5)
        .map((a) => a.name);

      // Generate overall recommendations
      const prompt = `Menu optimization recommendations:
- Top performers: ${topPerformers.join(', ')}
- Underperformers: ${underperformers.join(', ')}
- Total items: ${menuItems.length}

Provide 3-5 strategic recommendations for menu optimization.`;

      const recommendationsText = await this.openAIService.generateCompletion(
        prompt,
        'You are a restaurant menu strategy AI. Provide strategic menu optimization recommendations.',
      );

      const recommendations = this.extractRecommendations(recommendationsText);

      return {
        recommendations,
        topPerformers,
        underperformers,
      };
    } catch (error) {
      this.logger.error('Error getting menu recommendations:', error);
      return {
        recommendations: [],
        topPerformers: [],
        underperformers: [],
      };
    }
  }

  private extractRecommendations(text: string): string[] {
    return text
      .split('\n')
      .filter((line) => line.trim().length > 0 && (line.includes('-') || line.includes('•') || /^\d+\./.test(line.trim())))
      .map((line) => line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
      .filter((line) => line.length > 0);
  }

  private extractPriceFromText(text: string): number | null {
    const match = text.match(/₹[\d,]+\.?\d*/);
    if (match) {
      return parseFloat(match[0].replace(/[₹,]/g, ''));
    }
    return null;
  }
}

