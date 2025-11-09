import { ReviewsService } from './reviews.service';
export declare class AnalyzeReviewDto {
    review: {
        id: string;
        comment: string;
        rating: number;
        customerName?: string;
    };
    restaurantId: number;
}
export declare class GenerateReplyDto {
    review: {
        id: string;
        comment: string;
        rating: number;
        sentiment?: string;
        themes?: string[];
    };
    restaurantId: number;
}
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    analyzeReview(dto: AnalyzeReviewDto): Promise<import("./reviews.service").ReviewAnalysis>;
    generateReply(dto: GenerateReplyDto): Promise<import("./reviews.service").ReviewReply>;
    getInsights(restaurantId: number): Promise<import("./reviews.service").ReviewInsights>;
}
