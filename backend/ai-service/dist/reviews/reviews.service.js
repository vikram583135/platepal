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
var ReviewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const openai_service_1 = require("../common/openai.service");
let ReviewsService = ReviewsService_1 = class ReviewsService {
    constructor(openAIService) {
        this.openAIService = openAIService;
        this.logger = new common_1.Logger(ReviewsService_1.name);
    }
    async analyzeReview(review, restaurantId) {
        try {
            const { comment, rating } = review;
            let sentiment;
            let sentimentScore;
            if (rating >= 4) {
                sentiment = 'positive';
                sentimentScore = 0.7 + (rating - 4) * 0.3;
            }
            else if (rating <= 2) {
                sentiment = 'negative';
                sentimentScore = 0.3 - (rating - 2) * 0.3;
            }
            else {
                sentiment = 'neutral';
                sentimentScore = 0.5;
            }
            const prompt = `Analyze this restaurant review:
Rating: ${rating}/5
Comment: "${comment}"

Extract:
1. Key themes (e.g., food quality, service, pricing, delivery, ambiance)
2. Main points mentioned
3. Priority level (high if negative with specific issues, medium if neutral, low if positive)

Respond in JSON format with themes array, keyPoints array, and priority.`;
            const analysisText = await this.openAIService.generateJSON(prompt, 'You are a restaurant review analysis AI. Extract themes and key points from reviews. Respond only with valid JSON.');
            const themes = analysisText.themes || this.extractThemes(comment);
            const keyPoints = analysisText.keyPoints || [comment.substring(0, 100)];
            const priority = analysisText.priority || (sentiment === 'negative' && rating <= 2 ? 'high' : sentiment === 'positive' ? 'low' : 'medium');
            if (comment.length > 0) {
                const commentAnalysis = await this.openAIService.generateCompletion(`Analyze the sentiment of this review comment: "${comment}". Respond with only: positive, negative, or neutral.`, 'You are a sentiment analysis AI. Respond with only one word: positive, negative, or neutral.');
                const aiSentiment = commentAnalysis.trim().toLowerCase();
                if (aiSentiment.includes('positive')) {
                    sentiment = 'positive';
                    sentimentScore = Math.min(1, sentimentScore + 0.2);
                }
                else if (aiSentiment.includes('negative')) {
                    sentiment = 'negative';
                    sentimentScore = Math.max(0, sentimentScore - 0.2);
                }
            }
            return {
                sentiment,
                sentimentScore: Math.max(0, Math.min(1, sentimentScore)),
                themes,
                keyPoints,
                priority: priority,
            };
        }
        catch (error) {
            this.logger.error('Error analyzing review:', error);
            return {
                sentiment: 'neutral',
                sentimentScore: 0.5,
                themes: [],
                keyPoints: [],
                priority: 'medium',
            };
        }
    }
    async generateReply(review, restaurantId) {
        try {
            const { comment, rating, sentiment, themes } = review;
            let tone;
            if (sentiment === 'negative' || rating <= 2) {
                tone = 'apologetic';
            }
            else if (sentiment === 'positive' || rating >= 4) {
                tone = 'grateful';
            }
            else {
                tone = 'professional';
            }
            const prompt = `Generate a restaurant manager's reply to this review:
Rating: ${rating}/5
Comment: "${comment}"
Themes: ${themes?.join(', ') || 'General feedback'}

Requirements:
- ${tone} tone
- Professional and courteous
- Address specific concerns if mentioned
- Thank customer for feedback
- Keep it concise (2-3 sentences)
- If negative, acknowledge the issue and mention steps being taken`;
            const suggestedReply = await this.openAIService.generateCompletion(prompt, 'You are a restaurant manager crafting professional customer review replies. Be authentic, empathetic, and concise.');
            return {
                suggestedReply: suggestedReply.trim(),
                tone,
                confidence: 0.8,
            };
        }
        catch (error) {
            this.logger.error('Error generating reply:', error);
            return {
                suggestedReply: 'Thank you for your feedback. We appreciate your input and will use it to improve our service.',
                tone: 'professional',
                confidence: 0.5,
            };
        }
    }
    async getAggregateInsights(restaurantId) {
        try {
            return {
                overallSentiment: {
                    positive: 0,
                    negative: 0,
                    neutral: 0,
                },
                commonThemes: [],
                topIssues: [],
                improvementOpportunities: [],
            };
        }
        catch (error) {
            this.logger.error('Error getting aggregate insights:', error);
            return {
                overallSentiment: {
                    positive: 0,
                    negative: 0,
                    neutral: 0,
                },
                commonThemes: [],
                topIssues: [],
                improvementOpportunities: [],
            };
        }
    }
    extractThemes(comment) {
        const themes = [];
        const lowerComment = comment.toLowerCase();
        const themeKeywords = {
            food: ['food', 'taste', 'delicious', 'flavor', 'dish', 'meal', 'cuisine'],
            service: ['service', 'staff', 'waiter', 'server', 'attitude', 'friendly', 'rude'],
            pricing: ['price', 'expensive', 'cheap', 'cost', 'value', 'affordable'],
            delivery: ['delivery', 'delivered', 'delivery time', 'fast', 'slow'],
            ambiance: ['ambiance', 'atmosphere', 'environment', 'clean', 'dirty', 'decor'],
        };
        Object.entries(themeKeywords).forEach(([theme, keywords]) => {
            if (keywords.some((keyword) => lowerComment.includes(keyword))) {
                themes.push(theme);
            }
        });
        return themes.length > 0 ? themes : ['general'];
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = ReviewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_service_1.OpenAIService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map