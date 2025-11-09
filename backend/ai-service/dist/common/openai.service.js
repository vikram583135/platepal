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
var OpenAIService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let OpenAIService = OpenAIService_1 = class OpenAIService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(OpenAIService_1.name);
        const apiKey = this.configService.get('OPENAI_API_KEY') ||
            this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.warn('GEMINI_API_KEY not found in environment variables');
            this.genAI = null;
            this.model = null;
        }
        else {
            try {
                this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
                this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                this.logger.log('Google Gemini API initialized successfully');
            }
            catch (error) {
                this.logger.error('Failed to initialize Google Gemini API:', error);
                this.genAI = null;
                this.model = null;
            }
        }
    }
    async generateCompletion(prompt, systemPrompt) {
        if (!this.model) {
            this.logger.warn('Gemini not configured, returning mock response');
            return this.getMockResponse(prompt);
        }
        try {
            const fullPrompt = systemPrompt
                ? `${systemPrompt}\n\n${prompt}`
                : prompt;
            const result = await this.model.generateContent(fullPrompt, {
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                },
            });
            const response = await result.response;
            return response.text() || '';
        }
        catch (error) {
            this.logger.error('Error calling Gemini API:', error);
            return this.getMockResponse(prompt);
        }
    }
    async generateJSON(prompt, systemPrompt) {
        if (!this.model) {
            this.logger.warn('Gemini not configured, returning mock JSON');
            return this.getMockJSONResponse(prompt);
        }
        try {
            const fullPrompt = systemPrompt
                ? `${systemPrompt}\n\n${prompt}\n\nRespond with valid JSON only, no additional text.`
                : `${prompt}\n\nRespond with valid JSON only, no additional text.`;
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000,
                    responseMimeType: 'application/json',
                },
            });
            const response = await result.response;
            const text = response.text();
            let jsonText = text;
            if (text.includes('```json')) {
                jsonText = text.split('```json')[1].split('```')[0].trim();
            }
            else if (text.includes('```')) {
                jsonText = text.split('```')[1].split('```')[0].trim();
            }
            return JSON.parse(jsonText);
        }
        catch (error) {
            this.logger.error('Error calling Gemini API for JSON:', error);
            return this.getMockJSONResponse(prompt);
        }
    }
    getMockResponse(prompt) {
        if (prompt.includes('sales forecast')) {
            return 'Based on historical data, today\'s sales forecast is ₹45,000 - ₹52,000. This is 15% higher than average, likely due to increased weekend traffic.';
        }
        if (prompt.includes('popular item')) {
            return 'Chicken Tikka is currently the most popular item, with 45 orders in the last 2 hours. Consider promoting it as a Chef\'s Special.';
        }
        return 'AI analysis is not available. Please configure GEMINI_API_KEY for full functionality.';
    }
    getMockJSONResponse(prompt) {
        return {
            insights: ['Mock insight 1', 'Mock insight 2'],
            confidence: 0.75,
            recommendations: ['Mock recommendation'],
        };
    }
};
exports.OpenAIService = OpenAIService;
exports.OpenAIService = OpenAIService = OpenAIService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpenAIService);
//# sourceMappingURL=openai.service.js.map