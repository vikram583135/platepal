'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Sparkles, DollarSign, TrendingUp, TrendingDown, CheckCircle, X } from 'lucide-react';
import { suggestPricing, type PricingSuggestion } from '@/app/services/ai.service';
import { getRestaurantId } from '@/app/services/restaurant.service';
import { getOrders } from '@/app/services/restaurant.service';
import { getMenuItems } from '@/app/services/restaurant.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatINR } from '@/lib/currency';
import { toast } from 'sonner';

interface PricingOptimizerProps {
  menuItemId?: string;
  onPriceUpdate?: (itemId: string, newPrice: number) => void;
}

export default function PricingOptimizer({ menuItemId, onPriceUpdate }: PricingOptimizerProps) {
  const [restaurantId, setRestaurantId] = React.useState<number | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [showOptimizer, setShowOptimizer] = React.useState(false);

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

  // Generate sales history for selected item
  const salesHistory = React.useMemo(() => {
    if (!selectedItem || !orders.length) return [];
    
    return orders
      .filter((order: any) => {
        const items = order.items || [];
        return items.some((item: any) => 
          item.name === selectedItem.name || 
          item.itemId === selectedItem.id
        );
      })
      .map((order: any) => ({
        orderDate: order.createdAt || order.order_date,
        totalPrice: order.totalPrice || order.total_price || 0,
      }));
  }, [selectedItem, orders]);

  const { data: pricingSuggestion, isLoading, refetch } = useQuery<PricingSuggestion>({
    queryKey: ['pricing-suggestion', selectedItem?.id, restaurantId],
    queryFn: () => suggestPricing(selectedItem, salesHistory, [], restaurantId!),
    enabled: !!restaurantId && !!selectedItem && salesHistory.length > 0,
  });

  React.useEffect(() => {
    if (menuItemId && menuItems.length > 0) {
      const item = menuItems.find((mi: any) => mi.id === menuItemId);
      if (item) {
        setSelectedItem(item);
        setShowOptimizer(true);
      }
    }
  }, [menuItemId, menuItems]);

  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    setShowOptimizer(true);
    refetch();
  };

  const handleApplyPrice = () => {
    if (!selectedItem || !pricingSuggestion) return;
    
    if (onPriceUpdate) {
      onPriceUpdate(selectedItem.id, pricingSuggestion.suggestedPrice);
      toast.success('Price updated successfully!');
    } else {
      toast.info('Price update handler not configured');
    }
  };

  if (!showOptimizer) {
    return (
      <div className="bg-surface rounded-lg p-6 shadow-soft border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">AI Pricing Optimizer</h3>
              <p className="text-sm text-text-secondary">Get AI-powered pricing suggestions</p>
            </div>
          </div>
          <Button
            onClick={() => setShowOptimizer(true)}
            className="gradient-primary text-white hover-lift"
          >
            <Sparkles className="mr-2" size={16} />
            Optimize Pricing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg p-6 shadow-soft border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="text-primary" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">AI Pricing Optimizer</h3>
            <p className="text-sm text-text-secondary">Select a menu item to get pricing suggestions</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setShowOptimizer(false);
            setSelectedItem(null);
          }}
          variant="ghost"
          size="sm"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Item Selector */}
      {!selectedItem && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {menuItems.map((item: any) => (
            <button
              key={item.id}
              onClick={() => handleSelectItem(item)}
              className="w-full text-left p-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-text-primary">{item.name}</p>
                  <p className="text-sm text-text-secondary">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-text-primary">{formatINR(item.price)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pricing Analysis */}
      {selectedItem && (
        <div className="space-y-4">
          <div className="bg-background/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-text-primary">{selectedItem.name}</h4>
              <Badge>Current: {formatINR(selectedItem.price)}</Badge>
            </div>
            <p className="text-sm text-text-secondary">{selectedItem.category}</p>
          </div>

          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {!isLoading && pricingSuggestion && (
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-5 border border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-text-primary">AI Pricing Suggestion</h4>
                <Badge className="bg-success/10 text-success">
                  {Math.round(pricingSuggestion.confidence * 100)}% confidence
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-background/50 rounded-lg p-3">
                  <p className="text-xs text-text-secondary mb-1">Current Price</p>
                  <p className="text-lg font-bold text-text-primary">{formatINR(pricingSuggestion.currentPrice)}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3">
                  <p className="text-xs text-text-secondary mb-1">Suggested Price</p>
                  <p className="text-lg font-bold text-success flex items-center gap-1">
                    {formatINR(pricingSuggestion.suggestedPrice)}
                    {pricingSuggestion.suggestedPrice > pricingSuggestion.currentPrice ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Expected Revenue Change</p>
                  <p className={`text-sm font-semibold ${
                    pricingSuggestion.expectedImpact.revenueChange > 0 ? 'text-success' : 'text-error'
                  }`}>
                    {pricingSuggestion.expectedImpact.revenueChange > 0 ? '+' : ''}
                    {pricingSuggestion.expectedImpact.revenueChange.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Expected Order Change</p>
                  <p className={`text-sm font-semibold ${
                    pricingSuggestion.expectedImpact.orderChange > 0 ? 'text-success' : 'text-error'
                  }`}>
                    {pricingSuggestion.expectedImpact.orderChange > 0 ? '+' : ''}
                    {pricingSuggestion.expectedImpact.orderChange.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="bg-background/50 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-text-secondary mb-2">AI Reasoning:</p>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{pricingSuggestion.reasoning}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApplyPrice}
                  className="flex-1 gradient-primary text-white hover-lift"
                >
                  <CheckCircle className="mr-2" size={16} />
                  Apply Suggested Price
                </Button>
                <Button
                  onClick={() => {
                    setSelectedItem(null);
                    refetch();
                  }}
                  variant="outline"
                >
                  Analyze Another Item
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !pricingSuggestion && salesHistory.length === 0 && (
            <div className="text-center py-8 bg-background/50 rounded-lg">
              <p className="text-text-secondary">Not enough sales data for this item. Need more orders to analyze.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

