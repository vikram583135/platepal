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
exports.ReviewsController = exports.GenerateReplyDto = exports.AnalyzeReviewDto = void 0;
const common_1 = require("@nestjs/common");
const reviews_service_1 = require("./reviews.service");
class AnalyzeReviewDto {
}
exports.AnalyzeReviewDto = AnalyzeReviewDto;
class GenerateReplyDto {
}
exports.GenerateReplyDto = GenerateReplyDto;
let ReviewsController = class ReviewsController {
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    async analyzeReview(dto) {
        return this.reviewsService.analyzeReview(dto.review, dto.restaurantId);
    }
    async generateReply(dto) {
        return this.reviewsService.generateReply(dto.review, dto.restaurantId);
    }
    async getInsights(restaurantId) {
        return this.reviewsService.getAggregateInsights(restaurantId);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyzeReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "analyzeReview", null);
__decorate([
    (0, common_1.Post)('generate-reply'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateReplyDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "generateReply", null);
__decorate([
    (0, common_1.Get)('insights/:restaurantId'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getInsights", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, common_1.Controller)('reviews'),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map