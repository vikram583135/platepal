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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const openai_service_1 = require("../common/openai.service");
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(openAIService) {
        this.openAIService = openAIService;
        this.logger = new common_1.Logger(OrdersService_1.name);
    }
    async analyzeOrder(order, restaurantId, kitchenLoad = 0) {
        try {
            const items = order.items || [];
            const totalPrice = order.totalPrice || order.total_price || 0;
            const itemCount = items.length;
            const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
            let complexityScore = 0;
            const flags = [];
            if (totalPrice > 2000) {
                flags.push('large');
                complexityScore += 20;
            }
            if (itemCount >= 5) {
                flags.push('complex');
                complexityScore += 30;
            }
            if (order.customerId && this.isVIPCustomer(order.customerId)) {
                flags.push('high-priority');
                flags.push('vip');
                complexityScore += 40;
            }
            let complexity;
            if (complexityScore < 30) {
                complexity = 'low';
            }
            else if (complexityScore < 60) {
                complexity = 'medium';
            }
            else {
                complexity = 'high';
            }
            const basePrepTime = this.estimateBasePrepTime(itemCount, totalQuantity, complexity);
            const loadMultiplier = 1 + (kitchenLoad / 100);
            const estimatedPrepTime = Math.round(basePrepTime * loadMultiplier);
            const prompt = `Analyze this restaurant order:
- Total price: ₹${totalPrice}
- Item count: ${itemCount}
- Total quantity: ${totalQuantity}
- Complexity score: ${complexityScore}
- Kitchen load: ${kitchenLoad}%
- Estimated prep time: ${estimatedPrepTime} minutes

Provide a brief reasoning for the order priority and complexity assessment.`;
            const reasoning = await this.openAIService.generateCompletion(prompt, 'You are a restaurant kitchen management AI. Provide concise order analysis.');
            const priority = this.calculatePriority(complexityScore, estimatedPrepTime, flags);
            return {
                complexity,
                complexityScore,
                estimatedPrepTime,
                flags,
                priority,
                reasoning: reasoning || 'Order processed successfully.',
            };
        }
        catch (error) {
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
    async prioritizeOrders(orders, restaurantId) {
        try {
            const analyzedOrders = await Promise.all(orders.map((order) => this.analyzeOrder(order, restaurantId)));
            const prioritized = orders
                .map((order, index) => ({
                ...order,
                analysis: analyzedOrders[index],
            }))
                .sort((a, b) => b.analysis.priority - a.analysis.priority);
            return prioritized;
        }
        catch (error) {
            this.logger.error('Error prioritizing orders:', error);
            return orders;
        }
    }
    isVIPCustomer(customerId) {
        return false;
    }
    estimateBasePrepTime(itemCount, totalQuantity, complexity) {
        const baseTimePerItem = 8;
        const baseTime = itemCount * baseTimePerItem;
        const complexityMultiplier = {
            low: 0.8,
            medium: 1.0,
            high: 1.5,
        };
        return Math.round(baseTime * complexityMultiplier[complexity]);
    }
    calculatePriority(complexityScore, estimatedPrepTime, flags) {
        let priority = 50;
        priority += complexityScore;
        if (flags.includes('vip'))
            priority += 30;
        if (flags.includes('high-priority'))
            priority += 20;
        priority -= Math.min(estimatedPrepTime / 10, 20);
        return Math.max(0, Math.min(100, priority));
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_service_1.OpenAIService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map