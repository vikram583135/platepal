import { OpenAIService } from '../common/openai.service';
export interface ReviewAnalysis {
    sentiment: 'positive' | 'negative' | 'neutral';
    sentimentScore: number;
    themes: string[];
    keyPoints: string[];
    priority: 'high' | 'medium' | 'low';
}
export interface ReviewReply {
    suggestedReply: string;
    tone: 'apologetic' | 'grateful' | 'professional' | 'friendly';
    confidence: number;
}
export interface ReviewInsights {
    overallSentiment: {
        positive: number;
        negative: number;
        neutral: number;
    };
    commonThemes: Array<{
        theme: string;
        count: number;
        sentiment: string;
    }>;
    topIssues: string[];
    improvementOpportunities: string[];
}
export declare class ReviewsService {
    private readonly openAIService;
    private readonly logger;
    constructor(openAIService: OpenAIService);
    analyzeReview(review: {
        comment: string;
        rating: number;
    }, restaurantId: number): Promise<ReviewAnalysis>;
    generateReply(review: {
        comment: string;
        rating: number;
        sentiment?: string;
        themes?: string[];
    }, restaurantId: number): Promise<ReviewReply>;
    getAggregateInsights(restaurantId: number): Promise<ReviewInsights>;
    private extractThemes;
}
