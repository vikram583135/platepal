'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, TrendingUp, Gift, Clock, CheckCircle, X } from 'lucide-react';
import { suggestPromotions, type PromotionSuggestion } from '@/app/services/ai.service';
import { getRestaurantId } from '@/app/services/restaurant.service';
import { getOrders } from '@/app/services/restaurant.service';
import { getMenuItems } from '@/app/services/restaurant.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatINR } from '@/lib/currency';

interface AIPromotionSuggestionsProps {
  onSuggestionSelect?: (suggestion: PromotionSuggestion) => void;
}

export default function AIPromotionSuggestions({ onSuggestionSelect }: AIPromotionSuggestionsProps) {
  const [restaurantId, setRestaurantId] = React.useState<number | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    getRestaurantId().then(setRestaurantId);
  }, []);

  // Fetch orders and menu items for context
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    enabled: !!restaurantId,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menuItems'],
    queryFn: getMenuItems,
    enabled: !!restaurantId,
  });

  // Generate sales data from orders
  const salesData = React.useMemo(() => {
    if (!orders.length) return [];
    return orders.map((order: any) => ({
      createdAt: order.createdAt || order.order_date,
      items: order.items || [],
      totalPrice: order.totalPrice || order.total_price || 0,
    }));
  }, [orders]);

  const { data: suggestions, isLoading, refetch } = useQuery<PromotionSuggestion[]>({
    queryKey: ['ai-promotion-suggestions', restaurantId],
    queryFn: () => suggestPromotions(salesData, menuItems, restaurantId!),
    enabled: !!restaurantId && !!salesData.length && !!menuItems.length,
  });

  const handleUseSuggestion = (suggestion: PromotionSuggestion) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
      toast.success('Promotion suggestion selected! Fill in the details below.');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'time-based':
        return <Clock size={16} />;
      case 'combo':
        return <Gift size={16} />;
      default:
        return <TrendingUp size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'time-based':
        return 'bg-info/10 text-info border-info/20';
      case 'combo':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'bogo':
        return 'bg-accent/10 text-accent-dark border-accent/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  if (!isExpanded) {
    return (
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 shadow-soft border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">AI Promotion Suggestions</h3>
              <p className="text-sm text-text-secondary">Get data-driven promotion ideas</p>
            </div>
          </div>
          <Button
            onClick={() => setIsExpanded(true)}
            className="gradient-primary text-white hover-lift"
          >
            <Sparkles className="mr-2" size={16} />
            Generate Suggestions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 shadow-soft border border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">AI Promotion Suggestions</h3>
            <p className="text-sm text-text-secondary">Based on your sales patterns</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            onClick={() => setIsExpanded(false)}
            variant="ghost"
            size="sm"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {!isLoading && suggestions && suggestions.length > 0 && (
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`bg-surface rounded-lg p-5 border-2 ${getTypeColor(suggestion.type)} hover-lift transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(suggestion.type)}
                    <h4 className="text-lg font-bold text-text-primary">{suggestion.title}</h4>
                    <Badge className="text-xs">{suggestion.type}</Badge>
                    <Badge className="text-xs bg-success/20 text-success">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">{suggestion.description}</p>

                  {suggestion.items.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-text-secondary mb-1">Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.items.map((item, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <p className="text-text-secondary text-xs mb-1">Expected Revenue Increase</p>
                      <p className="text-text-primary font-bold text-lg">
                        +{suggestion.expectedImpact.revenueIncrease.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-xs mb-1">Expected Order Increase</p>
                      <p className="text-text-primary font-bold text-lg">
                        +{suggestion.expectedImpact.orderIncrease.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {suggestion.discountValue && (
                    <div className="mb-3">
                      <Badge className="bg-primary text-white">
                        {suggestion.discountValue}% OFF
                      </Badge>
                    </div>
                  )}

                  {suggestion.timeRange && (
                    <div className="mb-3 text-sm">
                      <p className="text-text-secondary">
                        <Clock size={14} className="inline mr-1" />
                        Valid: {suggestion.timeRange.start} - {suggestion.timeRange.end}
                      </p>
                    </div>
                  )}

                  <div className="bg-background/50 rounded-lg p-3 mt-3">
                    <p className="text-xs font-semibold text-text-secondary mb-1">AI Reasoning:</p>
                    <p className="text-xs text-text-secondary">{suggestion.reasoning}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleUseSuggestion(suggestion)}
                className="w-full gradient-primary text-white hover-lift mt-3"
              >
                <CheckCircle className="mr-2" size={16} />
                Use This Suggestion
              </Button>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!suggestions || suggestions.length === 0) && (
        <div className="text-center py-8">
          <Sparkles className="mx-auto mb-4 text-text-secondary opacity-50" size={48} />
          <p className="text-text-secondary">No suggestions available. Need more sales data.</p>
        </div>
      )}
    </div>
  );
}

