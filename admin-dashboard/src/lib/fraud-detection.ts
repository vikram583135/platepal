/**
 * Fraud Detection System
 * Combines rule-based checks with AI analysis
 */

import { aiService } from './ai-service';

export interface FraudDetectionRule {
  name: string;
  check: (data: any) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface FraudAlert {
  id: string;
  type: 'coupon_abuse' | 'review_bombing' | 'fake_account' | 'payment_fraud' | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  description: string;
  entityId: string;
  entityType: 'order' | 'user' | 'review' | 'account';
  timestamp: string;
  aiReasoning?: string;
  flags: string[];
}

/**
 * Rule-based fraud detection checks
 */
export const fraudRules: FraudDetectionRule[] = [
  {
    name: 'Coupon Abuse - Multiple Accounts',
    check: (data: { userId: string; couponCode?: string; userHistory?: { accountAge: number; orderCount: number } }) => {
      // New account using high-value coupon
      if (data.couponCode && data.userHistory) {
        return data.userHistory.accountAge < 7 && data.userHistory.orderCount <= 1;
      }
      return false;
    },
    severity: 'medium',
    description: 'New account using promotional coupon',
  },
  {
    name: 'Coupon Abuse - Excessive Usage',
    check: (data: { couponUsageCount?: number; maxAllowed?: number }) => {
      return (data.couponUsageCount || 0) > (data.maxAllowed || 3);
    },
    severity: 'high',
    description: 'Coupon used beyond allowed limit',
  },
  {
    name: 'Fake Account - Suspicious Pattern',
    check: (data: { userHistory?: { accountAge: number; orderCount: number; emailVerified: boolean } }) => {
      if (!data.userHistory) return false;
      // Account older than 30 days but no orders and email not verified
      return data.userHistory.accountAge > 30 && data.userHistory.orderCount === 0 && !data.userHistory.emailVerified;
    },
    severity: 'medium',
    description: 'Inactive account with unverified email',
  },
  {
    name: 'Payment Fraud - High Value New Account',
    check: (data: { amount: number; userHistory?: { accountAge: number; orderCount: number } }) => {
      if (!data.userHistory) return false;
      // New account with high-value order
      return data.amount > 100 && data.userHistory.accountAge < 3 && data.userHistory.orderCount <= 2;
    },
    severity: 'high',
    description: 'New account with unusually high order value',
  },
  {
    name: 'Review Bombing - Rapid Negative Reviews',
    check: (data: { reviewCount?: number; negativeReviewCount?: number; timeWindow?: number }) => {
      // Multiple negative reviews in short time window
      if (data.reviewCount && data.negativeReviewCount && data.timeWindow) {
        const ratio = data.negativeReviewCount / data.reviewCount;
        return ratio > 0.8 && data.reviewCount >= 5 && data.timeWindow < 3600; // 1 hour
      }
      return false;
    },
    severity: 'critical',
    description: 'Coordinated negative review attack detected',
  },
];

/**
 * Run rule-based fraud checks
 */
export function runFraudChecks(data: any): FraudAlert[] {
  const alerts: FraudAlert[] = [];

  fraudRules.forEach((rule, index) => {
    if (rule.check(data)) {
      alerts.push({
        id: `rule-${index}-${Date.now()}`,
        type: detectFraudType(rule.name),
        severity: rule.severity,
        confidence: 0.7, // Rule-based checks have medium confidence
        description: rule.description,
        entityId: data.id || data.orderId || data.userId || 'unknown',
        entityType: detectEntityType(data),
        timestamp: new Date().toISOString(),
        flags: [rule.name],
      });
    }
  });

  return alerts;
}

/**
 * AI-powered fraud detection
 */
export async function detectFraudWithAI(data: {
  orderId?: string;
  userId?: string;
  amount: number;
  timestamp: string;
  couponCode?: string;
  userHistory?: {
    orderCount: number;
    accountAge: number;
    previousSuspiciousActivity: number;
  };
}): Promise<FraudAlert | null> {
  try {
    const aiResult = await aiService.detectFraud({
      orderId: data.orderId || '',
      userId: data.userId || '',
      amount: data.amount,
      timestamp: data.timestamp,
      couponCode: data.couponCode,
      userHistory: data.userHistory,
    });

    if (aiResult.isFraud && aiResult.confidence > 0.6) {
      return {
        id: `ai-${Date.now()}`,
        type: detectFraudTypeFromFlags(aiResult.flags),
        severity: aiResult.confidence > 0.9 ? 'critical' : aiResult.confidence > 0.75 ? 'high' : 'medium',
        confidence: aiResult.confidence,
        description: aiResult.reasoning,
        entityId: data.orderId || data.userId || 'unknown',
        entityType: data.orderId ? 'order' : 'user',
        timestamp: new Date().toISOString(),
        aiReasoning: aiResult.reasoning,
        flags: aiResult.flags,
      };
    }
  } catch (error) {
    console.error('AI fraud detection error:', error);
  }

  return null;
}

/**
 * Comprehensive fraud detection combining rules and AI
 */
export async function detectFraud(data: any): Promise<FraudAlert[]> {
  const alerts: FraudAlert[] = [];

  // Run rule-based checks first (fast)
  const ruleAlerts = runFraudChecks(data);
  alerts.push(...ruleAlerts);

  // If high-value transaction or suspicious pattern, run AI check
  if (data.amount > 50 || ruleAlerts.length > 0) {
    const aiAlert = await detectFraudWithAI({
      orderId: data.orderId || data.id,
      userId: data.userId,
      amount: data.amount || 0,
      timestamp: data.timestamp || new Date().toISOString(),
      couponCode: data.couponCode,
      userHistory: data.userHistory,
    });

    if (aiAlert) {
      // Merge with existing alerts if similar
      const existingSimilar = alerts.find(
        (a) => a.entityId === aiAlert.entityId && a.type === aiAlert.type
      );
      if (!existingSimilar) {
        alerts.push(aiAlert);
      } else {
        // Update with higher confidence AI result
        existingSimilar.confidence = Math.max(existingSimilar.confidence, aiAlert.confidence);
        existingSimilar.aiReasoning = aiAlert.aiReasoning;
        existingSimilar.flags.push(...aiAlert.flags);
      }
    }
  }

  return alerts;
}

// Helper functions
function detectFraudType(ruleName: string): FraudAlert['type'] {
  if (ruleName.toLowerCase().includes('coupon')) return 'coupon_abuse';
  if (ruleName.toLowerCase().includes('review')) return 'review_bombing';
  if (ruleName.toLowerCase().includes('account')) return 'fake_account';
  if (ruleName.toLowerCase().includes('payment')) return 'payment_fraud';
  return 'suspicious_pattern';
}

function detectEntityType(data: any): FraudAlert['entityType'] {
  if (data.orderId || data.id?.startsWith('order')) return 'order';
  if (data.reviewId || data.id?.startsWith('review')) return 'review';
  if (data.userId || data.id?.startsWith('user')) return 'user';
  return 'account';
}

function detectFraudTypeFromFlags(flags: string[]): FraudAlert['type'] {
  const flagsStr = flags.join(' ').toLowerCase();
  if (flagsStr.includes('coupon')) return 'coupon_abuse';
  if (flagsStr.includes('review')) return 'review_bombing';
  if (flagsStr.includes('account') || flagsStr.includes('fake')) return 'fake_account';
  if (flagsStr.includes('payment') || flagsStr.includes('transaction')) return 'payment_fraud';
  return 'suspicious_pattern';
}
