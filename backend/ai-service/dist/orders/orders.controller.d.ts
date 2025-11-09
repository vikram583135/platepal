import { OrdersService } from './orders.service';
export declare class AnalyzeOrderDto {
    order: any;
    restaurantId: number;
    kitchenLoad?: number;
}
export declare class PrioritizeOrdersDto {
    orders: any[];
    restaurantId: number;
}
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    analyzeOrder(dto: AnalyzeOrderDto): Promise<import("./orders.service").OrderAnalysis>;
    prioritizeOrders(dto: PrioritizeOrdersDto): Promise<any[]>;
}
