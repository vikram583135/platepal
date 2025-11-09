import { OpenAIService } from '../common/openai.service';
export interface OrderAnalysis {
    complexity: 'low' | 'medium' | 'high';
    complexityScore: number;
    estimatedPrepTime: number;
    flags: Array<'large' | 'complex' | 'high-priority' | 'vip'>;
    priority: number;
    reasoning: string;
}
export declare class OrdersService {
    private readonly openAIService;
    private readonly logger;
    constructor(openAIService: OpenAIService);
    analyzeOrder(order: any, restaurantId: number, kitchenLoad?: number): Promise<OrderAnalysis>;
    prioritizeOrders(orders: any[], restaurantId: number): Promise<any[]>;
    private isVIPCustomer;
    private estimateBasePrepTime;
    private calculatePriority;
}
