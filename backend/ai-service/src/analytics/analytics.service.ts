import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../common/openai.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly openAIService: OpenAIService) {}

  async processNaturalLanguageQuery(
    query: string,
    restaurantId: number,
    dataContext?: any,
  ): Promise<{ answer: string; data?: any; visualization?: string }> {
    try {
      const systemPrompt = `You are a restaurant analytics AI assistant. Analyze the provided data and answer the user's question in natural language. 
Be concise, data-driven, and actionable. If visualization is needed, suggest the best chart type.`;

      const prompt = `User Query: "${query}"
Restaurant ID: ${restaurantId}
Data Context: ${JSON.stringify(dataContext || {})}

Provide a clear answer with insights. If the query requires data comparison or analysis, explain the findings.`;

      const answer = await this.openAIService.generateCompletion(prompt, systemPrompt);

      // Determine if visualization is needed
      const needsVisualization = this.determineVisualizationNeeds(query);

      return {
        answer,
        visualization: needsVisualization,
      };
    } catch (error) {
      this.logger.error('Error processing natural language query:', error);
      return {
        answer: 'I apologize, but I encountered an error processing your query. Please try again.',
      };
    }
  }

  async generateChartInsights(
    chartData: any,
    chartType: string,
    restaurantId: number,
  ): Promise<{ insights: string[]; trends: string[]; recommendations: string[] }> {
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

      // Parse the response into structured format
      const insights = this.extractInsights(analysis);

      return {
        insights: insights.insights || [],
        trends: insights.trends || [],
        recommendations: insights.recommendations || [],
      };
    } catch (error) {
      this.logger.error('Error generating chart insights:', error);
      return {
        insights: [],
        trends: [],
        recommendations: [],
      };
    }
  }

  private determineVisualizationNeeds(query: string): string | undefined {
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

  private extractInsights(text: string): {
    insights: string[];
    trends: string[];
    recommendations: string[];
  } {
    // Simple parsing - in production, use more sophisticated parsing or structured output
    const lines = text.split('\n').filter((line) => line.trim().length > 0);
    const insights: string[] = [];
    const trends: string[] = [];
    const recommendations: string[] = [];

    lines.forEach((line) => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('insight') || lowerLine.includes('finding')) {
        insights.push(line.replace(/^[-•*]\s*/, '').trim());
      } else if (lowerLine.includes('trend') || lowerLine.includes('pattern')) {
        trends.push(line.replace(/^[-•*]\s*/, '').trim());
      } else if (lowerLine.includes('recommend') || lowerLine.includes('suggest') || lowerLine.includes('action')) {
        recommendations.push(line.replace(/^[-•*]\s*/, '').trim());
      }
    });

    return { insights, trends, recommendations };
  }
}

