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
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const openai_service_1 = require("../common/openai.service");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    constructor(openAIService) {
        this.openAIService = openAIService;
        this.logger = new common_1.Logger(AnalyticsService_1.name);
    }
    async processNaturalLanguageQuery(query, restaurantId, dataContext) {
        try {
            const systemPrompt = `You are a restaurant analytics AI assistant. Analyze the provided data and answer the user's question in natural language. 
Be concise, data-driven, and actionable. If visualization is needed, suggest the best chart type.`;
            const prompt = `User Query: "${query}"
Restaurant ID: ${restaurantId}
Data Context: ${JSON.stringify(dataContext || {})}

Provide a clear answer with insights. If the query requires data comparison or analysis, explain the findings.`;
            const answer = await this.openAIService.generateCompletion(prompt, systemPrompt);
            const needsVisualization = this.determineVisualizationNeeds(query);
            return {
                answer,
                visualization: needsVisualization,
            };
        }
        catch (error) {
            this.logger.error('Error processing natural language query:', error);
            return {
                answer: 'I apologize, but I encountered an error processing your query. Please try again.',
            };
        }
    }
    async generateChartInsights(chartData, chartType, restaurantId) {
        try {
            const systemPrompt = `You are a data visualization expert. Analyze chart patterns and provide actionable insights.
Focus on trends, anomalies, and opportunities. Be specific and data-driven.`;
            const prompt = `Analyze the following ${chartType} chart data for restaurant ${restaurantId}:
${JSON.stringify(chartData, null, 2)}

Provide:
1. Key insights (3-5 bullet points)
2. Notable trends
3. Actionable recommendations`;
            const analysis = await this.openAIService.generateCompletion(prompt, systemPrompt);
            const insights = this.extractInsights(analysis);
            return {
                insights: insights.insights || [],
                trends: insights.trends || [],
                recommendations: insights.recommendations || [],
            };
        }
        catch (error) {
            this.logger.error('Error generating chart insights:', error);
            return {
                insights: [],
                trends: [],
                recommendations: [],
            };
        }
    }
    determineVisualizationNeeds(query) {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('compare') || lowerQuery.includes('vs') || lowerQuery.includes('versus')) {
            return 'bar';
        }
        if (lowerQuery.includes('trend') || lowerQuery.includes('over time')) {
            return 'line';
        }
        if (lowerQuery.includes('distribution') || lowerQuery.includes('percentage')) {
            return 'pie';
        }
        return undefined;
    }
    extractInsights(text) {
        const lines = text.split('\n').filter((line) => line.trim().length > 0);
        const insights = [];
        const trends = [];
        const recommendations = [];
        lines.forEach((line) => {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('insight') || lowerLine.includes('finding')) {
                insights.push(line.replace(/^[-•*]\s*/, '').trim());
            }
            else if (lowerLine.includes('trend') || lowerLine.includes('pattern')) {
                trends.push(line.replace(/^[-•*]\s*/, '').trim());
            }
            else if (lowerLine.includes('recommend') || lowerLine.includes('suggest') || lowerLine.includes('action')) {
                recommendations.push(line.replace(/^[-•*]\s*/, '').trim());
            }
        });
        return { insights, trends, recommendations };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_service_1.OpenAIService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map