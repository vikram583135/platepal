import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../common/openai.service';

export interface ReviewAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number; // 0-1
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
  commonThemes: Array<{ theme: string; count: number; sentiment: string }>;
  topIssues: string[];
  improvementOpportunities: string[];
}

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private readonly openAIService: OpenAIService) {}

  async analyzeReview(review: { comment: string; rating: number }, restaurantId: number): Promise<ReviewAnalysis> {
    try {
      const { comment, rating } = review;

      // Determine sentiment from rating and comment
      let sentiment: 'positive' | 'negative' | 'neutral';
      let sentimentScore: number;

      if (rating >= 4) {
        sentiment = 'positive';
        sentimentScore = 0.7 + (rating - 4) * 0.3;
      } else if (rating <= 2) {
        sentiment = 'negative';
        sentimentScore = 0.3 - (rating - 2) * 0.3;
      } else {
        sentiment = 'neutral';
        sentimentScore = 0.5;
      }

      // Use AI to extract themes and key points
      const prompt = `Analyze this restaurant review:
Rating: ${rating}/5
Comment: "${comment}"

Extract:
1. Key themes (e.g., food quality, service, pricing, delivery, ambiance)
2. Main points mentioned
3. Priority level (high if negative with specific issues, medium if neutral, low if positive)

Respond in JSON format with themes array, keyPoints array, and priority.`;

      const analysisText = await this.openAIService.generateJSON(
        prompt,
        'You are a restaurant review analysis AI. Extract themes and key points from reviews. Respond only with valid JSON.',
      );

      const themes = analysisText.themes || this.extractThemes(comment);
      const keyPoints = analysisText.keyPoints || [comment.substring(0, 100)];
      const priority = analysisText.priority || (sentiment === 'negative' && rating <= 2 ? 'high' : sentiment === 'positive' ? 'low' : 'medium');

      // Adjust sentiment based on comment analysis
      if (comment.length > 0) {
        const commentAnalysis = await this.openAIService.generateCompletion(
          `Analyze the sentiment of this review comment: "${comment}". Respond with only: positive, negative, or neutral.`,
          'You are a sentiment analysis AI. Respond with only one word: positive, negative, or neutral.',
        );

        const aiSentiment = commentAnalysis.trim().toLowerCase();
        if (aiSentiment.includes('positive')) {
          sentiment = 'positive';
          sentimentScore = Math.min(1, sentimentScore + 0.2);
        } else if (aiSentiment.includes('negative')) {
          sentiment = 'negative';
          sentimentScore = Math.max(0, sentimentScore - 0.2);
        }
      }

      return {
        sentiment,
        sentimentScore: Math.max(0, Math.min(1, sentimentScore)),
        themes,
        keyPoints,
        priority: priority as 'high' | 'medium' | 'low',
      };
    } catch (error) {
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

  async generateReply(
    review: { comment: string; rating: number; sentiment?: string; themes?: string[] },
    restaurantId: number,
  ): Promise<ReviewReply> {
    try {
      const { comment, rating, sentiment, themes } = review;

      // Determine tone based on sentiment
      let tone: 'apologetic' | 'grateful' | 'professional' | 'friendly';
      if (sentiment === 'negative' || rating <= 2) {
        tone = 'apologetic';
      } else if (sentiment === 'positive' || rating >= 4) {
        tone = 'grateful';
      } else {
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

      const suggestedReply = await this.openAIService.generateCompletion(
        prompt,
        'You are a restaurant manager crafting professional customer review replies. Be authentic, empathetic, and concise.',
      );

      return {
        suggestedReply: suggestedReply.trim(),
        tone,
        confidence: 0.8,
      };
    } catch (error) {
      this.logger.error('Error generating reply:', error);
      return {
        suggestedReply: 'Thank you for your feedback. We appreciate your input and will use it to improve our service.',
        tone: 'professional',
        confidence: 0.5,
      };
    }
  }

  async getAggregateInsights(restaurantId: number): Promise<ReviewInsights> {
    try {
      // This would typically fetch all reviews for the restaurant
      // For now, return a structure that can be populated
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
    } catch (error) {
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

  private extractThemes(comment: string): string[] {
    const themes: string[] = [];
    const lowerComment = comment.toLowerCase();

    const themeKeywords: { [key: string]: string[] } = {
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
}

