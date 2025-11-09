import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly genAI: GoogleGenerativeAI | null;
  private readonly model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY') || 
                   this.configService.get<string>('GEMINI_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not found in environment variables');
      this.genAI = null;
      this.model = null;
    } else {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        this.logger.log('Google Gemini API initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Google Gemini API:', error);
        this.genAI = null;
        this.model = null;
      }
    }
  }

  async generateCompletion(prompt: string, systemPrompt?: string): Promise<string> {
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
    } catch (error) {
      this.logger.error('Error calling Gemini API:', error);
      return this.getMockResponse(prompt);
    }
  }

  async generateJSON(prompt: string, systemPrompt?: string): Promise<any> {
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
      
      // Try to parse JSON, handle if it's wrapped in markdown code blocks
      let jsonText = text;
      if (text.includes('```json')) {
        jsonText = text.split('```json')[1].split('```')[0].trim();
      } else if (text.includes('```')) {
        jsonText = text.split('```')[1].split('```')[0].trim();
      }
      
      return JSON.parse(jsonText);
    } catch (error) {
      this.logger.error('Error calling Gemini API for JSON:', error);
      return this.getMockJSONResponse(prompt);
    }
  }

  private getMockResponse(prompt: string): string {
    // Mock responses for development when Gemini is not configured
    if (prompt.includes('sales forecast')) {
      return 'Based on historical data, today\'s sales forecast is ₹45,000 - ₹52,000. This is 15% higher than average, likely due to increased weekend traffic.';
    }
    if (prompt.includes('popular item')) {
      return 'Chicken Tikka is currently the most popular item, with 45 orders in the last 2 hours. Consider promoting it as a Chef\'s Special.';
    }
    return 'AI analysis is not available. Please configure GEMINI_API_KEY for full functionality.';
  }

  private getMockJSONResponse(prompt: string): any {
    // Mock JSON responses for development
    return {
      insights: ['Mock insight 1', 'Mock insight 2'],
      confidence: 0.75,
      recommendations: ['Mock recommendation'],
    };
  }
}
