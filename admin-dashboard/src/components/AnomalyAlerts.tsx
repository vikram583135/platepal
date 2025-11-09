'use client';

import { useEffect, useState } from 'react';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Anomaly {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  id: string;
}

interface AnomalyAlertsProps {
  maxAlerts?: number;
  autoDismiss?: boolean;
  dismissTime?: number;
}

export default function AnomalyAlerts({ maxAlerts = 5, autoDismiss = false, dismissTime = 10000 }: AnomalyAlertsProps) {
  const { metrics } = useRealtimeMetrics(true);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (metrics?.anomalies) {
      const newAnomalies = metrics.anomalies
        .filter((a) => !dismissedIds.has(a.type + a.timestamp))
        .map((a) => ({
          ...a,
          id: `${a.type}-${a.timestamp}`,
        }))
        .slice(0, maxAlerts);

      setAnomalies((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const trulyNew = newAnomalies.filter((a) => !existingIds.has(a.id));

        // Show toast for critical/high severity anomalies
        trulyNew.forEach((anomaly) => {
          if (anomaly.severity === 'critical' || anomaly.severity === 'high') {
            toast.error(anomaly.message, {
              duration: 5000,
              icon: '🚨',
            });
          }
        });

        return [...prev, ...trulyNew].slice(-maxAlerts);
      });
    }
  }, [metrics, dismissedIds, maxAlerts]);

  const dismissAnomaly = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
    setAnomalies((prev) => prev.filter((a) => a.id !== id));
  };

  useEffect(() => {
    if (!autoDismiss) return;

    anomalies.forEach((anomaly) => {
      const timer = setTimeout(() => {
        dismissAnomaly(anomaly.id);
      }, dismissTime);

      return () => clearTimeout(timer);
    });
  }, [anomalies, autoDismiss, dismissTime]);

  if (anomalies.length === 0) return null;

  const getSeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 border-red-700 text-white';
      case 'high':
        return 'bg-orange-500 border-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-500 border-yellow-600 text-white';
      case 'low':
        return 'bg-blue-500 border-blue-600 text-white';
      default:
        return 'bg-gray-500 border-gray-600 text-white';
    }
  };

  const getSeverityIcon = (severity: Anomaly['severity']) => {
    return <ExclamationTriangleIcon className="h-5 w-5" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Active Anomalies</h3>
        {anomalies.length > 0 && (
          <span className="text-sm text-text-secondary">{anomalies.length} active</span>
        )}
      </div>

      <AnimatePresence>
        {anomalies.map((anomaly) => (
          <motion.div
            key={anomaly.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`border-l-4 rounded-lg p-4 shadow-elevated ${getSeverityColor(anomaly.severity)}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">{getSeverityIcon(anomaly.severity)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
                      {anomaly.severity}
                    </span>
                    <span className="text-xs opacity-75">•</span>
                    <span className="text-xs opacity-75">{anomaly.type}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{anomaly.message}</p>
                  <p className="text-xs opacity-75 mt-2">
                    {new Date(anomaly.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissAnomaly(anomaly.id)}
                className="opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Dismiss alert"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
