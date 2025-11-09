'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { aiService } from '@/lib/ai-service';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface HealthScore {
  score: number;
  explanation: string;
  anomalies: string[];
  timestamp: string;
}

interface HealthScoreWidgetProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function HealthScoreWidget({ autoRefresh = true, refreshInterval = 60000 }: HealthScoreWidgetProps) {
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const { metrics } = useRealtimeMetrics(autoRefresh);

  useEffect(() => {
    const calculateHealthScore = async () => {
      setLoading(true);
      try {
        // Fetch platform health data
        const healthData = await apiClient.getPlatformHealth();
        const regionalStats = await apiClient.getRegionalStats();

        // Prepare data for AI analysis
        const aiData = {
          orders: {
            total: healthData.orders?.total || 0,
            pending: healthData.orders?.pending || 0,
            completed: healthData.orders?.completed || 0,
            averageDeliveryTime: healthData.orders?.averageDeliveryTime || 0,
          },
          restaurants: {
            total: healthData.restaurants?.total || 0,
            active: healthData.restaurants?.active || 0,
            pendingApproval: healthData.restaurants?.pendingApproval || 0,
            signupTrend: healthData.restaurants?.signupTrend || 0,
          },
          deliveryPartners: {
            total: healthData.deliveryPartners?.total || 0,
            active: healthData.deliveryPartners?.active || 0,
            onDuty: healthData.deliveryPartners?.onDuty || 0,
          },
          regionalStats: Array.isArray(regionalStats) ? regionalStats : [],
        };

        // Get AI-generated health score
        const aiResult = await aiService.analyzeHealthScore(aiData);

        setHealthScore({
          score: aiResult.score,
          explanation: aiResult.explanation,
          anomalies: aiResult.anomalies,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error calculating health score:', error);
        setHealthScore({
          score: 75,
          explanation: 'Unable to analyze platform health. Please check system status.',
          anomalies: [],
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    calculateHealthScore();

    if (autoRefresh) {
      const interval = setInterval(calculateHealthScore, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, metrics]);

  if (loading && !healthScore) {
    return (
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-elevated p-8 text-white">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/20 rounded w-1/3"></div>
          <div className="h-24 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (!healthScore) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-amber-600';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-600 to-red-700';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Critical';
  };

  const scoreColor = getScoreColor(healthScore.score);
  const scoreLabel = getScoreLabel(healthScore.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${scoreColor} rounded-xl shadow-elevated p-8 text-white relative overflow-hidden`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Platform Health Score</h2>
            <p className="text-white/80 text-sm mt-1">Real-time ecosystem analysis</p>
          </div>
          {healthScore.score >= 80 ? (
            <CheckCircleIcon className="h-8 w-8 text-white" />
          ) : healthScore.score >= 60 ? (
            <ExclamationTriangleIcon className="h-8 w-8 text-white" />
          ) : (
            <XCircleIcon className="h-8 w-8 text-white" />
          )}
        </div>

        {/* Score Display */}
        <div className="mb-6">
          <div className="flex items-end gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-7xl font-bold"
            >
              {healthScore.score}
            </motion.div>
            <div className="mb-2">
              <div className="text-xl font-semibold">{scoreLabel}</div>
              <div className="text-sm text-white/80">out of 100</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${healthScore.score}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </div>

        {/* AI Explanation */}
        <div className="mb-6">
          <p className="text-white/90 leading-relaxed">{healthScore.explanation}</p>
        </div>

        {/* Anomalies */}
        {healthScore.anomalies.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white/80 mb-2">Active Anomalies:</h3>
            {healthScore.anomalies.map((anomaly, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 bg-white/10 rounded-lg p-3 backdrop-blur-sm"
              >
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white/90">{anomaly}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-xs text-white/60">
            Last updated: {new Date(healthScore.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
