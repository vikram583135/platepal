'use client';

import { Trophy, TrendingUp, Package } from 'lucide-react';
import { formatINR, calculatePercentage } from '@/lib/currency';

interface TopItem {
  id: string;
  name: string;
  category: string;
  revenue: number;
  orders: number;
  imageUrl?: string;
}

interface TopItemsProps {
  items: TopItem[];
  totalRevenue: number;
  loading?: boolean;
}

export default function TopItems({ items, totalRevenue, loading = false }: TopItemsProps) {
  if (loading) {
    return (
      <div className="bg-surface rounded-lg p-6 shadow-soft">
        <div className="h-6 w-48 bg-background rounded mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border animate-pulse">
              <div className="w-16 h-16 bg-background rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-background rounded mb-2"></div>
                <div className="h-3 w-24 bg-background rounded"></div>
              </div>
              <div className="h-6 w-20 bg-background rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Sort items by revenue
  const sortedItems = [...items].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const maxRevenue = sortedItems[0]?.revenue || 1;

  return (
    <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
          <Trophy className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-primary">Top Selling Items</h3>
          <p className="text-sm text-text-secondary">Best performing dishes by revenue</p>
        </div>
      </div>

      {/* Items List */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="text-text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-text-secondary">No sales data available yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedItems.map((item, index) => {
            const revenuePercentage = (item.revenue / maxRevenue) * 100;
            const contributionPercentage = calculatePercentage(item.revenue, totalRevenue);

            return (
              <div 
                key={item.id} 
                className="group relative p-4 rounded-lg border border-border hover:border-primary hover:shadow-soft transition-all animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-accent text-white' :
                    index === 1 ? 'bg-accent/70 text-white' :
                    index === 2 ? 'bg-accent/50 text-white' :
                    'bg-background text-text-secondary'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Item Image/Icon */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-background flex-shrink-0">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-light to-secondary-light flex items-center justify-center">
                        <Package size={24} className="text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-text-secondary px-2 py-0.5 bg-background rounded-full">
                        {item.category}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {item.orders} orders
                      </span>
                    </div>

                    {/* Revenue Bar */}
                    <div className="mt-2 w-full h-1.5 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-secondary to-secondary-hover transition-all duration-500"
                        style={{ width: `${revenuePercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-secondary text-lg">
                      {formatINR(item.revenue)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                      <TrendingUp size={12} className="text-success" />
                      <span>{contributionPercentage}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Link */}
      {sortedItems.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <button className="w-full text-center text-primary font-semibold hover:text-primary-hover transition-colors">
            View All Items →
          </button>
        </div>
      )}
    </div>
  );
}

