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
exports.PromotionsController = exports.OptimizePromotionDto = exports.PredictPromotionDto = exports.SuggestPromotionsDto = void 0;
const common_1 = require("@nestjs/common");
const promotions_service_1 = require("./promotions.service");
class SuggestPromotionsDto {
}
exports.SuggestPromotionsDto = SuggestPromotionsDto;
class PredictPromotionDto {
}
exports.PredictPromotionDto = PredictPromotionDto;
class OptimizePromotionDto {
}
exports.OptimizePromotionDto = OptimizePromotionDto;
let PromotionsController = class PromotionsController {
    constructor(promotionsService) {
        this.promotionsService = promotionsService;
    }
    async suggestPromotions(dto) {
        return this.promotionsService.suggestPromotions(dto.salesData, dto.menuItems, dto.restaurantId, dto.timeRange);
    }
    async predictImpact(dto) {
        return this.promotionsService.predictPromotionImpact(dto.promotion, dto.salesHistory, dto.restaurantId);
    }
    async optimizePromotion(dto) {
        return this.promotionsService.optimizePromotion(dto.promotion, dto.performanceData, dto.restaurantId);
    }
};
exports.PromotionsController = PromotionsController;
__decorate([
    (0, common_1.Post)('suggest'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SuggestPromotionsDto]),
    __metadata("design:returntype", Promise)
], PromotionsController.prototype, "suggestPromotions", null);
__decorate([
    (0, common_1.Post)('predict'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PredictPromotionDto]),
    __metadata("design:returntype", Promise)
], PromotionsController.prototype, "predictImpact", null);
__decorate([
    (0, common_1.Post)('optimize'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [OptimizePromotionDto]),
    __metadata("design:returntype", Promise)
], PromotionsController.prototype, "optimizePromotion", null);
exports.PromotionsController = PromotionsController = __decorate([
    (0, common_1.Controller)('promotions'),
    __metadata("design:paramtypes", [promotions_service_1.PromotionsService])
], PromotionsController);
//# sourceMappingURL=promotions.controller.js.map