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
var PromotionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const openai_service_1 = require("../common/openai.service");
let PromotionsService = PromotionsService_1 = class PromotionsService {
    constructor(openAIService) {
        this.openAIService = openAIService;
        this.logger = new common_1.Logger(PromotionsService_1.name);
    }
    async suggestPromotions(salesData, menuItems, restaurantId, timeRange) {
        try {
            const salesByHour = this.analyzeSalesByHour(salesData);
            const salesByDay = this.analyzeSalesByDay(salesData);
            const topItems = this.getTopItems(salesData, 5);
            const slowHours = this.identifySlowPeriods(salesByHour);
            const slowDays = this.identifySlowDays(salesByDay);
            const suggestions = [];
            if (slowHours.length > 0) {
                const slowHour = slowHours[0];
                const prompt = `Suggest a time-based promotion for slow business hours:
- Slow hours: ${slowHour.hour}:00 - ${slowHour.hour + 1}:00
- Average orders during this time: ${slowHour.orders}
- Top items: ${topItems.map((i) => i.name).join(', ')}

Create a promotion that boosts sales during this time period. Suggest specific items and discount value.`;
                const suggestionText = await this.openAIService.generateCompletion(prompt, 'You are a restaurant promotion strategist. Suggest effective time-based promotions.');
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
            if (topItems.length >= 2) {
                const comboItems = topItems.slice(0, 2);
                const prompt = `Suggest a combo promotion:
- Item 1: ${comboItems[0].name} (₹${comboItems[0].price})
- Item 2: ${comboItems[1].name} (₹${comboItems[1].price})

Create an attractive combo deal with discount.`;
                const suggestionText = await this.openAIService.generateCompletion(prompt, 'You are a restaurant promotion strategist. Suggest effective combo promotions.');
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
            if (slowDays.includes('weekday')) {
                const prompt = `Suggest a weekday promotion to boost sales:
- Weekday sales are lower than weekends
- Top items: ${topItems.map((i) => i.name).join(', ')}

Create a weekday-specific promotion.`;
                const suggestionText = await this.openAIService.generateCompletion(prompt, 'You are a restaurant promotion strategist. Suggest effective weekday promotions.');
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
        }
        catch (error) {
            this.logger.error('Error suggesting promotions:', error);
            return [];
        }
    }
    async predictPromotionImpact(promotion, salesHistory, restaurantId) {
        try {
            const { type, discountValue, items, timeRange } = promotion;
            const baselineRevenue = salesHistory.reduce((sum, sale) => sum + (sale.revenue || sale.totalPrice || 0), 0);
            const baselineOrders = salesHistory.length;
            const discountMultiplier = discountValue / 100;
            const expectedOrderIncrease = discountMultiplier * 50;
            const expectedRevenueIncrease = expectedOrderIncrease - (discountValue * 0.8);
            const expectedOrders = Math.round(baselineOrders * (1 + expectedOrderIncrease / 100));
            const expectedRevenue = baselineRevenue * (1 + expectedRevenueIncrease / 100);
            const prompt = `Predict the impact of this promotion:
- Type: ${type}
- Discount: ${discountValue}%
- Items: ${items?.join(', ') || 'All items'}
- Time range: ${timeRange ? `${timeRange.start} - ${timeRange.end}` : 'All day'}

Provide prediction and recommendations for optimization.`;
            const predictionText = await this.openAIService.generateCompletion(prompt, 'You are a restaurant analytics AI. Predict promotion impact and provide optimization recommendations.');
            const recommendations = this.extractRecommendations(predictionText);
            return {
                expectedRevenue: Math.round(expectedRevenue),
                expectedOrders,
                revenueIncrease: expectedRevenueIncrease,
                orderIncrease: expectedOrderIncrease,
                confidence: 0.75,
                recommendations,
            };
        }
        catch (error) {
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
    async optimizePromotion(promotion, performanceData, restaurantId) {
        try {
            const currentPerformance = this.analyzePromotionPerformance(performanceData);
            const prompt = `Optimize this promotion based on performance:
- Current usage: ${currentPerformance.usageCount}
- Revenue generated: ₹${currentPerformance.revenue}
- Conversion rate: ${currentPerformance.conversionRate}%

Provide optimization suggestions.`;
            const optimizationText = await this.openAIService.generateCompletion(prompt, 'You are a restaurant promotion optimization AI. Suggest improvements to increase effectiveness.');
            const improvements = this.extractRecommendations(optimizationText);
            return {
                optimizedPromotion: {
                    ...promotion,
                },
                improvements,
            };
        }
        catch (error) {
            this.logger.error('Error optimizing promotion:', error);
            return {
                optimizedPromotion: promotion,
                improvements: [],
            };
        }
    }
    analyzeSalesByHour(salesData) {
        const salesByHour = new Map();
        salesData.forEach((sale) => {
            const date = new Date(sale.createdAt || sale.order_date);
            const hour = date.getHours();
            salesByHour.set(hour, (salesByHour.get(hour) || 0) + 1);
        });
        return salesByHour;
    }
    analyzeSalesByDay(salesData) {
        const salesByDay = new Map();
        salesData.forEach((sale) => {
            const date = new Date(sale.createdAt || sale.order_date);
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });
            salesByDay.set(day, (salesByDay.get(day) || 0) + 1);
        });
        return salesByDay;
    }
    getTopItems(salesData, count) {
        const itemCounts = new Map();
        salesData.forEach((sale) => {
            const items = sale.items || [];
            items.forEach((item) => {
                const name = item.name || item.itemName;
                const price = item.price || 0;
                if (itemCounts.has(name)) {
                    itemCounts.get(name).orders += item.quantity || 1;
                }
                else {
                    itemCounts.set(name, { price, orders: item.quantity || 1 });
                }
            });
        });
        return Array.from(itemCounts.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.orders - a.orders)
            .slice(0, count);
    }
    identifySlowPeriods(salesByHour) {
        const avgOrders = Array.from(salesByHour.values()).reduce((a, b) => a + b, 0) / salesByHour.size;
        const slowPeriods = [];
        salesByHour.forEach((orders, hour) => {
            if (orders < avgOrders * 0.7) {
                slowPeriods.push({ hour, orders });
            }
        });
        return slowPeriods.sort((a, b) => a.orders - b.orders);
    }
    identifySlowDays(salesByDay) {
        const avgOrders = Array.from(salesByDay.values()).reduce((a, b) => a + b, 0) / salesByDay.size;
        const slowDays = [];
        salesByDay.forEach((orders, day) => {
            if (orders < avgOrders * 0.8) {
                slowDays.push(day.toLowerCase());
            }
        });
        return slowDays;
    }
    analyzePromotionPerformance(performanceData) {
        const usageCount = performanceData.length;
        const revenue = performanceData.reduce((sum, d) => sum + (d.revenue || d.totalPrice || 0), 0);
        const conversionRate = usageCount > 0 ? (usageCount / (usageCount + 100)) * 100 : 0;
        return { usageCount, revenue, conversionRate };
    }
    extractRecommendations(text) {
        return text
            .split('\n')
            .filter((line) => line.trim().length > 0 && (line.includes('-') || line.includes('•') || /^\d+\./.test(line.trim())))
            .map((line) => line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
            .filter((line) => line.length > 0);
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = PromotionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_service_1.OpenAIService])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map