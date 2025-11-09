'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, AlertTriangle, Sparkles, Package, DollarSign, Clock } from 'lucide-react';
import { getDashboardSummary, type DashboardSummary } from '@/app/services/ai.service';
import { getRestaurantId } from '@/app/services/restaurant.service';
import { formatINR } from '@/lib/currency';
import { Skeleton } from '@/components/ui/skeleton';

export default function AICoPilotSummary() {
  const [restaurantId, setRestaurantId] = React.useState<number | null>(null);

  React.useEffect(() => {
    getRestaurantId().then(setRestaurantId);
  }, []);

  const { data, isLoading, error } = useQuery<DashboardSummary>({
    queryKey: ['ai-dashboard-summary', restaurantId],
    queryFn: () => getDashboardSummary(restaurantId!),
    enabled: !!restaurantId,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-surface rounded-lg p-6 shadow-soft">
        <p className="text-text-secondary">Unable to load AI insights. Please try again later.</p>
      </div>
    );
  }

  const { salesForecast, popularItem, urgentAlerts } = data;

  return (
    <div className="space-y-4">
      {/* Sales Forecast Card */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 shadow-soft hover-lift border border-primary/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Today's Sales Forecast</h3>
              <p className="text-sm text-text-secondary">AI-powered prediction</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/20 text-primary">
              {Math.round(salesForecast.confidence * 100)}% confidence
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-3xl font-bold text-text-primary mb-2">
            {formatINR(salesForecast.predictedRevenue)}
          </p>
          <p className="text-sm text-text-secondary">{salesForecast.comparison}</p>
        </div>

        <div className="bg-background/50 rounded-lg p-3 text-sm text-text-secondary">
          <p className="font-medium mb-1">AI Reasoning:</p>
          <p>{salesForecast.reasoning}</p>
        </div>
      </div>

      {/* Popular Item Card */}
      <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg p-6 shadow-soft hover-lift border border-secondary/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Most Popular Item Right Now</h3>
              <p className="text-sm text-text-secondary">Real-time performance</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xl font-bold text-text-primary mb-1">{popularItem.name}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-text-secondary">
              <Package size={14} className="inline mr-1" />
              {popularItem.orders} orders
            </span>
            <span className="text-text-secondary">
              <DollarSign size={14} className="inline mr-1" />
              {formatINR(popularItem.revenue)}
            </span>
          </div>
        </div>

        <div className="bg-background/50 rounded-lg p-3 text-sm text-text-secondary">
          <p className="font-medium mb-1">AI Recommendation:</p>
          <p>{popularItem.recommendation}</p>
        </div>
      </div>

      {/* Urgent Alerts */}
      {urgentAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <AlertTriangle size={20} className="text-accent-dark" />
            Urgent Alerts
          </h3>
          {urgentAlerts.map((alert, index) => (
            <div
              key={index}
              className={`rounded-lg p-4 shadow-soft border-l-4 ${
                alert.type === 'warning'
                  ? 'bg-error/10 border-error'
                  : alert.type === 'opportunity'
                  ? 'bg-success/10 border-success'
                  : 'bg-info/10 border-info'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        alert.priority === 'high'
                          ? 'bg-error/20 text-error'
                          : alert.priority === 'medium'
                          ? 'bg-accent/20 text-accent-dark'
                          : 'bg-info/20 text-info'
                      }`}
                    >
                      {alert.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-text-secondary capitalize">{alert.type}</span>
                  </div>
                  <p className="text-text-primary font-medium">{alert.message}</p>
                  {alert.action && (
                    <button className="mt-2 text-sm text-primary hover:underline font-medium">
                      {alert.action} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {urgentAlerts.length === 0 && (
        <div className="bg-surface rounded-lg p-6 shadow-soft text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="text-success" size={32} />
          </div>
          <p className="text-text-primary font-medium">All systems running smoothly!</p>
          <p className="text-sm text-text-secondary mt-1">No urgent alerts at this time.</p>
        </div>
      )}
    </div>
  );
}

