/**
 * Auto-Moderation System
 * Automatically suspends accounts/restaurants based on fraud detection confidence
 */

import { FraudAlert } from './fraud-detection';

export interface AutoModerationAction {
  id: string;
  entityType: 'user' | 'restaurant' | 'order';
  entityId: string;
  action: 'suspend' | 'flag' | 'review';
  confidence: number;
  reason: string;
  fraudAlerts: FraudAlert[];
  timestamp: string;
  reviewed: boolean;
  reviewDecision?: 'approved' | 'reversed';
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Appeal {
  id: string;
  actionId: string;
  entityType: 'user' | 'restaurant' | 'order';
  entityId: string;
  reason: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

/**
 * Thresholds for auto-moderation
 */
export const MODERATION_THRESHOLDS = {
  AUTO_SUSPEND: 0.9, // 90% confidence - auto-suspend
  FLAG_FOR_REVIEW: 0.75, // 75% confidence - flag for manual review
  LOW_CONFIDENCE: 0.6, // Below 60% - log only
} as const;

/**
 * Determine moderation action based on fraud alerts
 */
export function determineModerationAction(
  entityType: 'user' | 'restaurant' | 'order',
  entityId: string,
  fraudAlerts: FraudAlert[]
): AutoModerationAction | null {
  if (!fraudAlerts || fraudAlerts.length === 0) {
    return null;
  }

  // Calculate overall confidence (weighted average)
  const totalConfidence = fraudAlerts.reduce((sum, alert) => {
    const weight = getSeverityWeight(alert.severity);
    return sum + alert.confidence * weight;
  }, 0);

  const totalWeight = fraudAlerts.reduce((sum, alert) => sum + getSeverityWeight(alert.severity), 0);
  const overallConfidence = totalWeight > 0 ? totalConfidence / totalWeight : 0;

  // Check for critical alerts
  const hasCriticalAlert = fraudAlerts.some(
    (alert) => alert.severity === 'critical' && alert.confidence >= 0.85
  );

  let action: 'suspend' | 'flag' | 'review';
  if (overallConfidence >= MODERATION_THRESHOLDS.AUTO_SUSPEND || hasCriticalAlert) {
    action = 'suspend';
  } else if (overallConfidence >= MODERATION_THRESHOLDS.FLAG_FOR_REVIEW) {
    action = 'flag';
  } else if (overallConfidence >= MODERATION_THRESHOLDS.LOW_CONFIDENCE) {
    action = 'review';
  } else {
    // Low confidence - don't auto-moderate
    return null;
  }

  // Generate reason from alerts
  const reason = generateReason(fraudAlerts);

  return {
    id: `auto-mod-${Date.now()}-${entityId}`,
    entityType,
    entityId,
    action,
    confidence: overallConfidence,
    reason,
    fraudAlerts,
    timestamp: new Date().toISOString(),
    reviewed: false,
  };
}

/**
 * Auto-suspend entity based on moderation action
 */
export async function executeAutoModeration(
  moderationAction: AutoModerationAction
): Promise<{ success: boolean; message: string }> {
  try {
    // In production, this would call the appropriate API endpoint
    // For now, we'll simulate the action

    if (moderationAction.action === 'suspend') {
      // Auto-suspend the entity
      switch (moderationAction.entityType) {
        case 'user':
          // await apiClient.suspendUser(moderationAction.entityId, moderationAction.reason);
          console.log(`[AUTO-MOD] Suspending user ${moderationAction.entityId}: ${moderationAction.reason}`);
          break;
        case 'restaurant':
          // await apiClient.suspendRestaurant(moderationAction.entityId, moderationAction.reason);
          console.log(`[AUTO-MOD] Suspending restaurant ${moderationAction.entityId}: ${moderationAction.reason}`);
          break;
        case 'order':
          // await apiClient.flagOrderAsFraud(moderationAction.entityId, moderationAction.reason);
          console.log(`[AUTO-MOD] Flagging order ${moderationAction.entityId}: ${moderationAction.reason}`);
          break;
      }

      // Send notification to admins
      await notifyAdmins(moderationAction);

      return {
        success: true,
        message: `${moderationAction.entityType} automatically suspended due to high fraud confidence (${(moderationAction.confidence * 100).toFixed(0)}%)`,
      };
    } else if (moderationAction.action === 'flag') {
      // Flag for manual review
      await notifyAdmins(moderationAction);
      return {
        success: true,
        message: `${moderationAction.entityType} flagged for manual review`,
      };
    }

    return {
      success: true,
      message: 'Action logged for review',
    };
  } catch (error) {
    console.error('Auto-moderation execution error:', error);
    return {
      success: false,
      message: 'Failed to execute auto-moderation',
    };
  }
}

/**
 * Notify admins of auto-moderation actions
 */
async function notifyAdmins(action: AutoModerationAction): Promise<void> {
  // In production, this would:
  // 1. Send email to admin team
  // 2. Create notification in admin dashboard
  // 3. Send real-time WebSocket notification
  // 4. Log to audit trail

  const notification = {
    type: 'auto_moderation',
    severity: action.action === 'suspend' ? 'high' : 'medium',
    title: `Auto-${action.action === 'suspend' ? 'Suspension' : 'Flag'}: ${action.entityType}`,
    message: action.reason,
    entityType: action.entityType,
    entityId: action.entityId,
    confidence: action.confidence,
    timestamp: action.timestamp,
  };

  console.log('[ADMIN NOTIFICATION]', notification);
  // In production: await notificationService.sendToAdmins(notification);
}

/**
 * Create an appeal for a moderation action
 */
export function createAppeal(
  actionId: string,
  entityType: 'user' | 'restaurant' | 'order',
  entityId: string,
  reason: string
): Appeal {
  return {
    id: `appeal-${Date.now()}-${entityId}`,
    actionId,
    entityType,
    entityId,
    reason,
    submittedAt: new Date().toISOString(),
    status: 'pending',
  };
}

/**
 * Review an appeal
 */
export async function reviewAppeal(
  appeal: Appeal,
  decision: 'approved' | 'rejected',
  reviewerId: string,
  reviewNotes?: string
): Promise<Appeal> {
  return {
    ...appeal,
    status: decision,
    reviewedBy: reviewerId,
    reviewedAt: new Date().toISOString(),
    reviewNotes,
  };
}

/**
 * Helper: Get severity weight for confidence calculation
 */
function getSeverityWeight(severity: string): number {
  switch (severity) {
    case 'critical':
      return 4;
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
    default:
      return 1;
  }
}

/**
 * Helper: Generate human-readable reason from alerts
 */
function generateReason(alerts: FraudAlert[]): string {
  const reasons: string[] = [];
  const types = new Set<string>();

  alerts.forEach((alert) => {
    types.add(alert.type);
    if (alert.description && !reasons.includes(alert.description)) {
      reasons.push(alert.description);
    }
  });

  const typeStr = Array.from(types)
    .map((t) => t.replace(/_/g, ' '))
    .join(', ');

  if (reasons.length > 0) {
    return `Detected ${typeStr}: ${reasons.slice(0, 2).join('; ')}`;
  }

  return `Fraud detection flagged ${typeStr}`;
}

/**
 * Check if entity should be auto-moderated
 */
export function shouldAutoModerate(fraudAlerts: FraudAlert[]): boolean {
  if (!fraudAlerts || fraudAlerts.length === 0) {
    return false;
  }

  const highConfidenceAlerts = fraudAlerts.filter(
    (alert) => alert.confidence >= MODERATION_THRESHOLDS.FLAG_FOR_REVIEW
  );

  return highConfidenceAlerts.length > 0;
}
