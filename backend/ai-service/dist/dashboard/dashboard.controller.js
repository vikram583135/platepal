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
var DashboardController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = exports.DashboardSummaryDto = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
class DashboardSummaryDto {
}
exports.DashboardSummaryDto = DashboardSummaryDto;
let DashboardController = DashboardController_1 = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
        this.logger = new common_1.Logger(DashboardController_1.name);
    }
    async getSummary(dto) {
        try {
            const summary = await this.dashboardService.getDashboardSummary(dto.restaurantId);
            return summary;
        }
        catch (error) {
            this.logger.error('Error in dashboard summary endpoint:', error);
            throw error;
        }
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Post)('summary'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DashboardSummaryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSummary", null);
exports.DashboardController = DashboardController = DashboardController_1 = __decorate([
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map