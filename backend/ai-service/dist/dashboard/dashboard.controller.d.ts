import { DashboardService } from './dashboard.service';
export declare class DashboardSummaryDto {
    restaurantId: number;
}
export declare class DashboardController {
    private readonly dashboardService;
    private readonly logger;
    constructor(dashboardService: DashboardService);
    getSummary(dto: DashboardSummaryDto): Promise<import("./dashboard.service").DashboardSummary>;
}
