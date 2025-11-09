/**
 * Unified AI Service
 * Supports both OpenAI and Anthropic APIs for various AI-powered features
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

type AIProvider = 'openai' | 'anthropic';

interface HealthScoreData {
  orders: {
    total: number;
    pending: number;
    completed: number;
    averageDeliveryTime: number;
  };
  restaurants: {
    total: number;
    active: number;
    pendingApproval: number;
    signupTrend: number; // percentage change
  };
  deliveryPartners: {
    total: number;
    active: number;
    onDuty: number;
  };
  regionalStats?: {
    region: string;
    signupChange: number;
    deliveryTimeChange: number;
  }[];
}

interface FraudDetectionData {
  orderId: string;
  userId: string;
  amount: number;
  timestamp: string;
  couponCode?: string;
  userHistory?: {
    orderCount: number;
    accountAge: number;
    previousSuspiciousActivity: number;
  };
}

interface SentimentAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
}

interface NLQueryResult {
  query: string;
  apiCall: string;
  parameters: Record<string, any>;
}

class AIService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private provider: AIProvider;

  constructor() {
    this.provider = (process.env.NEXT_PUBLIC_AI_PROVIDER as AIProvider) || 'openai';
    
    if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true, // Required for Next.js client-side usage
      });
    }

    if (process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      });
    }
  }

  private async callAI(prompt: string, systemPrompt?: string): Promise<string> {
    if (this.provider === 'anthropic' && this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt || 'You are a helpful AI assistant for the PlatePal admin dashboard.',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      
      const textContent = response.content.find((c) => c.type === 'text');
      return textContent?.type === 'text' ? textContent.text : '';
    }

    // Default to OpenAI
    if (this.openai) {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
        max_tokens: 1024,
      });

      return response.choices[0]?.message?.content || '';
    }

    throw new Error('No AI provider configured. Please set API keys in environment variables.');
  }

  /**
   * Analyze platform health and generate a health score (0-100) with explanation
   */
  async analyzeHealthScore(data: HealthScoreData): Promise<{
    score: number;
    explanation: string;
    anomalies: string[];
  }> {
    const prompt = `Analyze the following platform metrics and provide:
1. A health score from 0-100
2. A concise explanation (2-3 sentences)
3. Any anomalies or concerns

Platform Data:
- Orders: ${data.orders.total} total, ${data.orders.pending} pending, ${data.orders.completed} completed
- Average delivery time: ${data.orders.averageDeliveryTime} minutes
- Restaurants: ${data.restaurants.total} total, ${data.restaurants.active} active, ${data.restaurants.pendingApproval} pending approval
- Restaurant signup trend: ${data.restaurants.signupTrend > 0 ? '+' : ''}${data.restaurants.signupTrend}%
- Delivery partners: ${data.deliveryPartners.total} total, ${data.deliveryPartners.active} active, ${data.deliveryPartners.onDuty} on duty
${data.regionalStats?.map(s => `- ${s.region}: Signups ${s.signupChange > 0 ? '+' : ''}${s.signupChange}%, Delivery time ${s.deliveryTimeChange > 0 ? '+' : ''}${s.deliveryTimeChange}%`).join('\n') || ''}

Respond in JSON format:
{
  "score": number (0-100),
  "explanation": "string",
  "anomalies": ["string", "string"]
}`;

    const systemPrompt = 'You are an AI analyst for a food delivery platform. Analyze metrics and identify issues.';

    try {
      const response = await this.callAI(prompt, systemPrompt);
      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.max(0, Math.min(100, parsed.score || 75)),
          explanation: parsed.explanation || 'Platform metrics are within normal ranges.',
          anomalies: Array.isArray(parsed.anomalies) ? parsed.anomalies : [],
        };
      }
    } catch (error) {
      console.error('AI health score analysis error:', error);
    }

    // Fallback if AI fails
    return {
      score: 75,
      explanation: 'Unable to analyze health metrics. Please check system status.',
      anomalies: [],
    };
  }

  /**
   * Detect potential fraud in transactions
   */
  async detectFraud(data: FraudDetectionData): Promise<{
    isFraud: boolean;
    confidence: number;
    reasoning: string;
    flags: string[];
  }> {
    const prompt = `Analyze this transaction for potential fraud:

Order ID: ${data.orderId}
User ID: ${data.userId}
Amount: $${data.amount}
Timestamp: ${data.timestamp}
Coupon Code: ${data.couponCode || 'None'}
User History:
- Order Count: ${data.userHistory?.orderCount || 0}
- Account Age (days): ${data.userHistory?.accountAge || 0}
- Previous Suspicious Activity: ${data.userHistory?.previousSuspiciousActivity || 0}

Check for:
1. Coupon abuse (multiple accounts, unusual patterns)
2. Fake accounts (new account, high value orders)
3. Payment fraud (unusual transaction patterns)
4. Suspicious behavior patterns

Respond in JSON:
{
  "isFraud": boolean,
  "confidence": number (0-1),
  "reasoning": "string",
  "flags": ["string"]
}`;

    try {
      const response = await this.callAI(prompt, 'You are a fraud detection AI. Be thorough but not overly cautious.');
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          isFraud: parsed.isFraud === true,
          confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
          reasoning: parsed.reasoning || 'No clear fraud indicators.',
          flags: Array.isArray(parsed.flags) ? parsed.flags : [],
        };
      }
    } catch (error) {
      console.error('AI fraud detection error:', error);
    }

    // Fallback
    return {
      isFraud: false,
      confidence: 0.5,
      reasoning: 'Unable to analyze transaction.',
      flags: [],
    };
  }

  /**
   * Analyze sentiment and categorize support tickets
   */
  async analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
    const prompt = `Analyze this support ticket text for sentiment, category, and priority:

"${text}"

Determine:
1. Sentiment: positive, neutral, or negative
2. Category: One of: "Refund Request", "App Bug", "Partner Complaint", "General Inquiry", "Payment Issue", "Delivery Issue", "Account Issue"
3. Priority: critical, high, medium, or low (based on urgency and sentiment)
4. Confidence: 0-1 score

Respond in JSON:
{
  "sentiment": "positive" | "neutral" | "negative",
  "category": "string",
  "priority": "critical" | "high" | "medium" | "low",
  "confidence": number
}`;

    try {
      const response = await this.callAI(prompt, 'You are an AI that categorizes and prioritizes customer support tickets.');
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sentiment: ['positive', 'neutral', 'negative'].includes(parsed.sentiment) ? parsed.sentiment : 'neutral',
          category: parsed.category || 'General Inquiry',
          priority: ['critical', 'high', 'medium', 'low'].includes(parsed.priority) ? parsed.priority : 'medium',
          confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7)),
        };
      }
    } catch (error) {
      console.error('AI sentiment analysis error:', error);
    }

    // Fallback
    return {
      sentiment: 'neutral',
      category: 'General Inquiry',
      priority: 'medium',
      confidence: 0.5,
    };
  }

  /**
   * Convert natural language query to API call
   */
  async naturalLanguageQuery(query: string, context?: Record<string, any>): Promise<NLQueryResult> {
    const prompt = `Convert this natural language query into an API call specification:

Query: "${query}"

Available API endpoints:
- GET /orders - List orders (filters: status, dateRange, restaurantId, customerId)
- GET /restaurants - List restaurants (filters: status, region, ownerId)
- GET /users/customers - List customers (filters: status, region, totalOrders)
- GET /support-tickets - List tickets (filters: category, priority, status, dateRange)
- GET /analytics/platform-health - Platform health metrics
- GET /analytics/regional-stats?region=X - Regional statistics

Context: ${JSON.stringify(context || {})}

Respond in JSON:
{
  "query": "original query",
  "apiCall": "GET /endpoint",
  "parameters": { "key": "value" }
}`;

    try {
      const response = await this.callAI(prompt, 'You convert natural language queries into API specifications.');
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          query: parsed.query || query,
          apiCall: parsed.apiCall || 'GET /orders',
          parameters: parsed.parameters || {},
        };
      }
    } catch (error) {
      console.error('AI NL query error:', error);
    }

    // Fallback
    return {
      query,
      apiCall: 'GET /orders',
      parameters: {},
    };
  }

  /**
   * Generate executive summary from analytics data
   */
  async summarizeInsights(data: any): Promise<string> {
    const prompt = `Summarize the following analytics data into a concise executive summary (2-3 paragraphs):

${JSON.stringify(data, null, 2)}

Focus on key trends, anomalies, and actionable insights.`;

    try {
      const summary = await this.callAI(prompt, 'You are an executive analyst summarizing business metrics.');
      return summary;
    } catch (error) {
      console.error('AI summarization error:', error);
      return 'Unable to generate summary at this time.';
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
