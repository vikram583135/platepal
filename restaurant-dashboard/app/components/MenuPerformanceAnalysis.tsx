'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, TrendingUp, TrendingDown, Lightbulb, BarChart3 } from 'lucide-react';
import { analyzeMenuPerformance, getMenuRecommendations, type MenuItemAnalysis, type MenuRecommendations } from '@/app/services/ai.service';
import { getRestaurantId } from '@/app/services/restaurant.service';
import { getOrders } from '@/app/services/restaurant.service';
import { getMenuItems } from '@/app/services/restaurant.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatINR } from '@/lib/currency';

export default function MenuPerformanceAnalysis() {
  const [restaurantId, setRestaurantId] = React.useState<number | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

  React.useEffect(() => {
    getRestaurantId().then(setRestaurantId);
  }, []);

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menuItems'],
    queryFn: getMenuItems,
    enabled: !!restaurantId,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    enabled: !!restaurantId,
  });

  // Generate sales data from orders
  const salesData = React.useMemo(() => {
    if (!orders.length || !menuItems.length) return [];
    
    const itemSales: any[] = [];
    orders.forEach((order: any) => {
      const items = order.items || [];
      items.forEach((item: any) => {
        const menuItem = menuItems.find((mi: any) => mi.name === item.name || mi.id === item.itemId);
        if (menuItem) {
          itemSales.push({
            itemId: menuItem.id,
            itemName: item.name || menuItem.name,
            revenue: (item.price || 0) * (item.quantity || 1),
            totalPrice: (item.price || 0) * (item.quantity || 1),
            orderDate: order.createdAt || order.order_date,
          });
        }
      });
    });
    return itemSales;
  }, [orders, menuItems]);

  const { data: analysis, isLoading: analyzing } = useQuery<MenuItemAnalysis[]>({
    queryKey: ['menu-performance-analysis', restaurantId, menuItems.length, salesData.length],
    queryFn: () => analyzeMenuPerformance(menuItems, salesData, restaurantId!),
    enabled: !!restaurantId && !!menuItems.length && !!salesData.length,
  });

  const { data: recommendations } = useQuery<MenuRecommendations>({
    queryKey: ['menu-recommendations', restaurantId, menuItems.length, salesData.length],
    queryFn: () => getMenuRecommendations(menuItems, salesData, restaurantId!),
    enabled: !!restaurantId && !!menuItems.length && !!salesData.length,
  });

  const getPerformanceColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-accent-dark';
    return 'text-error';
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 70) return { label: 'Top Performer', color: 'bg-success/10 text-success' };
    if (score >= 40) return { label: 'Average', color: 'bg-info/10 text-info' };
    return { label: 'Underperforming', color: 'bg-error/10 text-error' };
  };

  if (analyzing) {
    return (
      <div className="bg-surface rounded-lg p-6 shadow-soft border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-primary animate-pulse" size={20} />
          <h3 className="text-lg font-bold text-text-primary">AI Menu Performance Analysis</h3>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!analysis || analysis.length === 0) {
    return (
      <div className="bg-surface rounded-lg p-6 shadow-soft border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-primary" size={20} />
          <h3 className="text-lg font-bold text-text-primary">AI Menu Performance Analysis</h3>
        </div>
        <p className="text-text-secondary">Not enough data for analysis. More sales data needed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Recommendations */}
      {recommendations && (
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 shadow-soft border border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="text-primary" size={24} />
            <h3 className="text-lg font-bold text-text-primary">AI Menu Strategy Recommendations</h3>
          </div>
          
          {recommendations.recommendations.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-semibold text-text-primary">Strategic Recommendations:</h4>
              <ul className="space-y-2">
                {recommendations.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4">
            {recommendations.topPerformers.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-success mb-2">Top Performers:</h4>
                <div className="flex flex-wrap gap-2">
                  {recommendations.topPerformers.map((item, index) => (
                    <Badge key={index} className="bg-success/10 text-success">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {recommendations.underperformers.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-error mb-2">Underperformers:</h4>
                <div className="flex flex-wrap gap-2">
                  {recommendations.underperformers.map((item, index) => (
                    <Badge key={index} className="bg-error/10 text-error">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Individual Item Analysis */}
      <div className="bg-surface rounded-lg p-6 shadow-soft border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-primary" size={20} />
            <h3 className="text-lg font-bold text-text-primary">Item Performance Analysis</h3>
          </div>
          <Badge className="bg-primary/10 text-primary">
            {analysis.length} items analyzed
          </Badge>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {analysis.map((item) => {
            const performanceBadge = getPerformanceBadge(item.performance.performanceScore);
            const isSelected = selectedItem === item.itemId;

            return (
              <div
                key={item.itemId}
                className={`border rounded-lg p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-background/50'
                }`}
                onClick={() => setSelectedItem(isSelected ? null : item.itemId)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-text-primary">{item.name}</h4>
                      <Badge className={performanceBadge.color}>{performanceBadge.label}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-text-secondary text-xs mb-1">Revenue</p>
                        <p className="font-semibold text-text-primary">{formatINR(item.performance.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary text-xs mb-1">Orders</p>
                        <p className="font-semibold text-text-primary">{item.performance.orders}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary text-xs mb-1">Performance Score</p>
                        <p className={`font-semibold ${getPerformanceColor(item.performance.performanceScore)}`}>
                          {item.performance.performanceScore.toFixed(1)}/100
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {item.comparison.performanceVsSimilar > 0 ? (
                      <div className="flex items-center gap-1 text-success text-sm">
                        <TrendingUp size={16} />
                        <span>+{item.comparison.performanceVsSimilar.toFixed(1)}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-error text-sm">
                        <TrendingDown size={16} />
                        <span>{item.comparison.performanceVsSimilar.toFixed(1)}%</span>
                      </div>
                    )}
                    <p className="text-xs text-text-secondary mt-1">vs similar</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3 animate-slide-up">
                    {item.comparison.similarItems.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-text-secondary mb-2">Compared with:</p>
                        <div className="flex flex-wrap gap-2">
                          {item.comparison.similarItems.map((similar, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {similar}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.recommendations.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-1">
                          <Lightbulb size={12} />
                          AI Recommendations:
                        </p>
                        <ul className="space-y-1">
                          {item.recommendations.map((rec, index) => (
                            <li key={index} className="text-xs text-text-secondary flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

