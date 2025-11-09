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
exports.MenuController = exports.MenuRecommendationsDto = exports.PricingOptimizationDto = exports.AnalyzeMenuDto = void 0;
const common_1 = require("@nestjs/common");
const menu_service_1 = require("./menu.service");
class AnalyzeMenuDto {
}
exports.AnalyzeMenuDto = AnalyzeMenuDto;
class PricingOptimizationDto {
}
exports.PricingOptimizationDto = PricingOptimizationDto;
class MenuRecommendationsDto {
}
exports.MenuRecommendationsDto = MenuRecommendationsDto;
let MenuController = class MenuController {
    constructor(menuService) {
        this.menuService = menuService;
    }
    async analyzeMenu(dto) {
        return this.menuService.analyzeMenuPerformance(dto.menuItems, dto.salesData, dto.restaurantId);
    }
    async optimizePricing(dto) {
        return this.menuService.suggestPricing(dto.menuItem, dto.salesHistory, dto.competitorPrices, dto.restaurantId);
    }
    async getRecommendations(dto) {
        return this.menuService.getMenuRecommendations(dto.menuItems, dto.salesData, dto.restaurantId);
    }
};
exports.MenuController = MenuController;
__decorate([
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyzeMenuDto]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "analyzeMenu", null);
__decorate([
    (0, common_1.Post)('pricing'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PricingOptimizationDto]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "optimizePricing", null);
__decorate([
    (0, common_1.Post)('recommendations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MenuRecommendationsDto]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getRecommendations", null);
exports.MenuController = MenuController = __decorate([
    (0, common_1.Controller)('menu'),
    __metadata("design:paramtypes", [menu_service_1.MenuService])
], MenuController);
//# sourceMappingURL=menu.controller.js.map