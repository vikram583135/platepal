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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = exports.PrioritizeOrdersDto = exports.AnalyzeOrderDto = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
class AnalyzeOrderDto {
}
exports.AnalyzeOrderDto = AnalyzeOrderDto;
class PrioritizeOrdersDto {
}
exports.PrioritizeOrdersDto = PrioritizeOrdersDto;
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async analyzeOrder(dto) {
        return this.ordersService.analyzeOrder(dto.order, dto.restaurantId, dto.kitchenLoad);
    }
    async prioritizeOrders(dto) {
        return this.ordersService.prioritizeOrders(dto.orders, dto.restaurantId);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyzeOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "analyzeOrder", null);
__decorate([
    (0, common_1.Post)('prioritize'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PrioritizeOrdersDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "prioritizeOrders", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map