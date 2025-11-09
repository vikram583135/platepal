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
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const openai_service_1 = require("../common/openai.service");
let DashboardService = DashboardService_1 = class DashboardService {
    constructor(httpService, configService, openAIService) {
        this.httpService = httpService;
        this.configService = configService;
        this.openAIService = openAIService;
        this.logger = new common_1.Logger(DashboardService_1.name);
        this.orderServiceUrl = this.configService.get('ORDER_SERVICE_URL') || 'http://localhost:3003';
        this.restaurantServiceUrl = this.configService.get('RESTAURANT_SERVICE_URL') || 'http://localhost:3002';
    }
    async getDashboardSummary(restaurantId) {
        try {
            const ordersResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.orderServiceUrl}/orders`, {
                params: { restaurantId },
            }));
            const orders = ordersResponse.data || [];
            const menuResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.restaurantServiceUrl}/restaurants/${restaurantId}/menu`));
            const menu = menuResponse.data;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayOrders = orders.filter((order) => {
                const orderDate = new Date(order.createdAt || order.order_date);
                return orderDate >= today;
            });
            const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalPrice || order.total_price || 0), 0);
            const lastWeekOrders = orders.filter((order) => {
                const orderDate = new Date(order.createdAt || order.order_date);
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return orderDate >= weekAgo && orderDate < today;
            });
            const avgDailyRevenue = lastWeekOrders.reduce((sum, order) => sum + (order.totalPrice || order.total_price || 0), 0) / 7;
            const itemCounts = new Map();
            todayOrders.forEach((order) => {
                const items = order.items || [];
                items.forEach((item) => {
                    const itemName = item.name || item.itemName;
                    const price = item.price || 0;
                    const quantity = item.quantity || 1;
                    const total = price * quantity;
                    if (itemCounts.has(itemName)) {
                        const existing = itemCounts.get(itemName);
                        existing.count += quantity;
                        existing.revenue += total;
                    }
                    else {
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
            const forecastPrompt = `Based on the following data, predict today's total revenue:
- Current revenue so far today: ₹${todayRevenue.toFixed(2)}
- Average daily revenue (last 7 days): ₹${avgDailyRevenue.toFixed(2)}
- Current time: ${new Date().toLocaleTimeString()}
- Day of week: ${today.toLocaleDateString('en-US', { weekday: 'long' })}

Provide a revenue forecast for the rest of the day with reasoning.`;
            const forecastReasoning = await this.openAIService.generateCompletion(forecastPrompt, 'You are a restaurant analytics AI. Provide concise, data-driven revenue forecasts.');
            const predictedRevenue = this.extractRevenueFromText(forecastReasoning) || (avgDailyRevenue * 1.1);
            const itemRecommendation = await this.openAIService.generateCompletion(`The item "${popularItem.name}" has ${popularItem.orders} orders today generating ₹${popularItem.revenue.toFixed(2)}. Provide a brief recommendation for the restaurant manager.`, 'You are a restaurant management AI. Provide actionable recommendations in 1-2 sentences.');
            const alerts = [];
            if (popularItem.orders > 20) {
                alerts.push({
                    type: 'opportunity',
                    message: `${popularItem.name} is performing exceptionally well. Consider promoting it as a Chef's Special.`,
                    priority: 'medium',
                    action: 'Promote item',
                });
            }
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
        }
        catch (error) {
            this.logger.error('Error generating dashboard summary:', error);
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
    extractRevenueFromText(text) {
        const match = text.match(/₹[\d,]+\.?\d*/);
        if (match) {
            return parseFloat(match[0].replace(/[₹,]/g, ''));
        }
        return null;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        openai_service_1.OpenAIService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map