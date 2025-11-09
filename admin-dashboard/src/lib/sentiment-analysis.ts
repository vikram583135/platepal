/**
 * Sentiment Analysis for Support Tickets
 * Categorizes and prioritizes tickets using AI
 */

import { aiService } from './ai-service';

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  keywords: string[];
  suggestedTeam: string;
}

export const TICKET_CATEGORIES = [
  'Refund Request',
  'App Bug',
  'Partner Complaint',
  'General Inquiry',
  'Payment Issue',
  'Delivery Issue',
  'Account Issue',
  'Menu/Restaurant Issue',
  'Technical Support',
] as const;

export const PRIORITY_LEVELS = ['critical', 'high', 'medium', 'low'] as const;

export const TEAM_ASSIGNMENTS: Record<string, string> = {
  'Refund Request': 'Finance',
  'App Bug': 'Engineering',
  'Partner Complaint': 'Partner Relations',
  'General Inquiry': 'Customer Support',
  'Payment Issue': 'Finance',
  'Delivery Issue': 'Operations',
  'Account Issue': 'Customer Support',
  'Menu/Restaurant Issue': 'Restaurant Relations',
  'Technical Support': 'Engineering',
};

/**
 * Analyze ticket sentiment and categorize using AI
 */
export async function analyzeTicket(text: string, subject?: string): Promise<SentimentResult> {
  const fullText = subject ? `${subject}\n\n${text}` : text;

  try {
    const aiResult = await aiService.analyzeSentiment(fullText);

    // Extract keywords from text
    const keywords = extractKeywords(fullText);

    // Determine suggested team
    const suggestedTeam = TEAM_ASSIGNMENTS[aiResult.category] || 'Customer Support';

    return {
      sentiment: aiResult.sentiment,
      category: aiResult.category,
      priority: aiResult.priority,
      confidence: aiResult.confidence,
      keywords,
      suggestedTeam,
    };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    // Fallback to basic analysis
    return fallbackAnalysis(fullText);
  }
}

/**
 * Extract keywords from text for tagging
 */
function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'them', 'this', 'that',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word));

  // Count frequency
  const frequency: Record<string, number> = {};
  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Get top keywords
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

/**
 * Fallback analysis if AI fails
 */
function fallbackAnalysis(text: string): SentimentResult {
  const lowerText = text.toLowerCase();

  // Basic sentiment detection
  const negativeWords = ['refund', 'cancel', 'wrong', 'error', 'bug', 'broken', 'bad', 'terrible', 'awful', 'disappointed', 'angry', 'frustrated'];
  const positiveWords = ['thank', 'great', 'good', 'excellent', 'happy', 'satisfied', 'love'];
  const urgentWords = ['urgent', 'immediately', 'asap', 'critical', 'emergency', 'broken', 'not working'];

  const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length;
  const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length;
  const urgentCount = urgentWords.filter((word) => lowerText.includes(word)).length;

  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (negativeCount > positiveCount) sentiment = 'negative';
  else if (positiveCount > negativeCount) sentiment = 'positive';

  // Basic category detection
  let category = 'General Inquiry';
  if (lowerText.includes('refund') || lowerText.includes('money') || lowerText.includes('payment')) {
    category = 'Refund Request';
  } else if (lowerText.includes('bug') || lowerText.includes('error') || lowerText.includes('broken') || lowerText.includes('not working')) {
    category = 'App Bug';
  } else if (lowerText.includes('delivery') || lowerText.includes('driver') || lowerText.includes('late')) {
    category = 'Delivery Issue';
  } else if (lowerText.includes('account') || lowerText.includes('login') || lowerText.includes('password')) {
    category = 'Account Issue';
  } else if (lowerText.includes('restaurant') || lowerText.includes('menu') || lowerText.includes('food')) {
    category = 'Menu/Restaurant Issue';
  }

  // Priority based on urgency and sentiment
  let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
  if (urgentCount > 0 || sentiment === 'negative') priority = 'high';
  if (urgentCount > 2 || (urgentCount > 0 && sentiment === 'negative')) priority = 'critical';
  if (sentiment === 'positive') priority = 'low';

  return {
    sentiment,
    category,
    priority,
    confidence: 0.6, // Lower confidence for fallback
    keywords: extractKeywords(text),
    suggestedTeam: TEAM_ASSIGNMENTS[category] || 'Customer Support',
  };
}

/**
 * Batch analyze multiple tickets
 */
export async function analyzeTicketsBatch(
  tickets: Array<{ id: string; subject?: string; text: string }>
): Promise<Map<string, SentimentResult>> {
  const results = new Map<string, SentimentResult>();

  // Analyze in parallel with rate limiting (max 5 concurrent)
  const batchSize = 5;
  for (let i = 0; i < tickets.length; i += batchSize) {
    const batch = tickets.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (ticket) => {
        const result = await analyzeTicket(ticket.text, ticket.subject);
        return { id: ticket.id, result };
      })
    );

    batchResults.forEach(({ id, result }) => {
      results.set(id, result);
    });

    // Small delay between batches to avoid rate limits
    if (i + batchSize < tickets.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}
