"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MenuService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const openai_service_1 = require("../common/openai.service");
let MenuService = MenuService_1 = class MenuService {
    constructor(openAIService) {
        this.openAIService = openAIService;
        this.logger = new common_1.Logger(MenuService_1.name);
    }
    async analyzeMenuPerformance(menuItems, salesData, restaurantId) {
        try {
            const analyses = [];
            for (const item of menuItems) {
                const itemSales = salesData.filter((sale) => sale.itemId === item.id || sale.itemName === item.name);
                const revenue = itemSales.reduce((sum, sale) => sum + (sale.revenue || sale.totalPrice || 0), 0);
                const orders = itemSales.length;
                const avgOrderValue = orders > 0 ? revenue / orders : 0;
                const avgRevenue = menuItems.reduce((sum, i) => {
                    const iSales = salesData.filter((s) => s.itemId === i.id || s.itemName === i.name);
                    return sum + iSales.reduce((s, sale) => s + (sale.revenue || sale.totalPrice || 0), 0);
                }, 0) / menuItems.length;
                const performanceScore = Math.min(100, (revenue / avgRevenue) * 50);
                const similarItems = menuItems
                    .filter((i) => i.category === item.category && i.id !== item.id)
                    .map((i) => i.name);
                const similarRevenue = similarItems.length > 0
                    ? similarItems.reduce((sum, name) => {
                        const sSales = salesData.filter((s) => s.itemName === name);
                        return sum + sSales.reduce((s, sale) => s + (sale.revenue || sale.totalPrice || 0), 0);
                    }, 0) / similarItems.length
                    : revenue;
                const performanceVsSimilar = similarRevenue > 0
                    ? ((revenue - similarRevenue) / similarRevenue) * 100
                    : 0;
                const prompt = `Menu item "${item.name}" analysis:
- Revenue: ₹${revenue.toFixed(2)}
- Orders: ${orders}
- Performance vs similar items: ${performanceVsSimilar.toFixed(1)}%
- Performance score: ${performanceScore.toFixed(1)}/100

Provide 2-3 actionable recommendations for this menu item.`;
                const recommendationsText = await this.openAIService.generateCompletion(prompt, 'You are a restaurant menu optimization AI. Provide concise, actionable recommendations.');
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
        }
        catch (error) {
            this.logger.error('Error analyzing menu performance:', error);
            return [];
        }
    }
    async suggestPricing(menuItem, salesHistory, competitorPrices = [], restaurantId) {
        try {
            const currentPrice = menuItem.price || 0;
            const itemSales = salesHistory.filter((s) => s.itemId === menuItem.id || s.itemName === menuItem.name);
            const totalOrders = itemSales.length;
            const avgDailyOrders = totalOrders / 30;
            const prompt = `Suggest optimal pricing for menu item "${menuItem.name}":
- Current price: ₹${currentPrice}
- Total orders (last 30 days): ${totalOrders}
- Average daily orders: ${avgDailyOrders.toFixed(1)}
${competitorPrices.length > 0 ? `- Competitor average: ₹${(competitorPrices.reduce((s, p) => s + p.price, 0) / competitorPrices.length).toFixed(2)}` : ''}

Provide pricing recommendation with reasoning and expected impact.`;
            const suggestion = await this.openAIService.generateCompletion(prompt, 'You are a restaurant pricing optimization AI. Suggest optimal pricing with data-driven reasoning.');
            const suggestedPrice = this.extractPriceFromText(suggestion) || currentPrice;
            const priceChange = ((suggestedPrice - currentPrice) / currentPrice) * 100;
            const elasticity = -0.5;
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
        }
        catch (error) {
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
    async getMenuRecommendations(menuItems, salesData, restaurantId) {
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
            const prompt = `Menu optimization recommendations:
- Top performers: ${topPerformers.join(', ')}
- Underperformers: ${underperformers.join(', ')}
- Total items: ${menuItems.length}

Provide 3-5 strategic recommendations for menu optimization.`;
            const recommendationsText = await this.openAIService.generateCompletion(prompt, 'You are a restaurant menu strategy AI. Provide strategic menu optimization recommendations.');
            const recommendations = this.extractRecommendations(recommendationsText);
            return {
                recommendations,
                topPerformers,
                underperformers,
            };
        }
        catch (error) {
            this.logger.error('Error getting menu recommendations:', error);
            return {
                recommendations: [],
                topPerformers: [],
                underperformers: [],
            };
        }
    }
    extractRecommendations(text) {
        return text
            .split('\n')
            .filter((line) => line.trim().length > 0 && (line.includes('-') || line.includes('•') || /^\d+\./.test(line.trim())))
            .map((line) => line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
            .filter((line) => line.length > 0);
    }
    extractPriceFromText(text) {
        const match = text.match(/₹[\d,]+\.?\d*/);
        if (match) {
            return parseFloat(match[0].replace(/[₹,]/g, ''));
        }
        return null;
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = MenuService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_service_1.OpenAIService])
], MenuService);
//# sourceMappingURL=menu.service.js.map