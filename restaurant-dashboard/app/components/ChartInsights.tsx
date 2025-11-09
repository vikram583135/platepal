'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { generateChartInsights, type ChartInsights } from '@/app/services/ai.service';
import { getRestaurantId } from '@/app/services/restaurant.service';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartInsightsProps {
  chartData: any;
  chartType: string;
  onInsightsGenerated?: (insights: ChartInsights) => void;
}

export default function ChartInsightsComponent({ chartData, chartType, onInsightsGenerated }: ChartInsightsProps) {
  const [restaurantId, setRestaurantId] = React.useState<number | null>(null);

  React.useEffect(() => {
    getRestaurantId().then(setRestaurantId);
  }, []);

  const { data, isLoading, error } = useQuery<ChartInsights>({
    queryKey: ['chart-insights', chartType, restaurantId, JSON.stringify(chartData)],
    queryFn: () => generateChartInsights(chartData, chartType, restaurantId!),
    enabled: !!restaurantId && !!chartData && chartData.length > 0,
    refetchInterval: false,
  });

  React.useEffect(() => {
    if (data && onInsightsGenerated) {
      onInsightsGenerated(data);
    }
  }, [data, onInsightsGenerated]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const { insights, trends, recommendations } = data;

  return (
    <div className="bg-surface rounded-lg p-6 shadow-soft border border-border mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-primary" size={20} />
        <h3 className="text-lg font-bold text-text-primary">AI-Generated Insights</h3>
      </div>

      {insights.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="text-accent-dark" size={16} />
            <h4 className="text-sm font-semibold text-text-primary">Key Insights</h4>
          </div>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {trends.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-success" size={16} />
            <h4 className="text-sm font-semibold text-text-primary">Trends</h4>
          </div>
          <ul className="space-y-2">
            {trends.map((trend, index) => (
              <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
                <span className="text-success mt-1">•</span>
                <span>{trend}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-accent-dark" size={16} />
            <h4 className="text-sm font-semibold text-text-primary">Recommendations</h4>
          </div>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
                <span className="text-accent-dark mt-1">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {insights.length === 0 && trends.length === 0 && recommendations.length === 0 && (
        <p className="text-sm text-text-secondary">No insights available for this chart.</p>
      )}
    </div>
  );
}

