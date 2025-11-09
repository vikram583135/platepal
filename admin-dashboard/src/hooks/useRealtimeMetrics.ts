/**
 * Real-Time Metrics Hook
 * Subscribes to live platform metrics via WebSocket
 */

import { useEffect, useState } from 'react';
import { useWebSocket } from './useWebSocket';

const ORDER_SERVICE_URL = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:3003';

interface RealtimeMetrics {
  orders: {
    total: number;
    pending: number;
    completed: number;
    inProgress: number;
  };
  revenue: {
    today: number;
    weekly: number;
    monthly: number;
  };
  deliveryPartners: {
    online: number;
    delivering: number;
  };
  restaurants: {
    active: number;
    acceptingOrders: number;
  };
  anomalies: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
  }>;
  timestamp: string;
}

export function useRealtimeMetrics(enabled: boolean = true) {
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const { connected, subscribe } = useWebSocket(ORDER_SERVICE_URL, {
    namespace: '/',
    enabled,
  });

  useEffect(() => {
    if (!connected || !enabled) return;

    setLoading(false);

    // Subscribe to real-time metrics updates
    const unsubscribe = subscribe('metrics:update', (data: RealtimeMetrics) => {
      setMetrics(data);
    });

    // Subscribe to anomaly alerts
    subscribe('anomaly:alert', (data: { anomaly: RealtimeMetrics['anomalies'][0] }) => {
      if (metrics) {
        setMetrics({
          ...metrics,
          anomalies: [data.anomaly, ...metrics.anomalies].slice(0, 10), // Keep last 10
        });
      }
    });

    return unsubscribe;
  }, [connected, enabled, subscribe, metrics]);

  return {
    metrics,
    loading: loading || !connected,
    connected,
  };
}
