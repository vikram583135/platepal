'use client';

import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Receipt } from 'lucide-react';
import { formatINR, formatINRCompact, calculateGrowth } from '@/lib/currency';

interface StatsData {
  totalRevenue: number;
  previousRevenue: number;
  totalOrders: number;
  previousOrders: number;
  totalCustomers: number;
  previousCustomers: number;
  averageOrderValue: number;
  previousAverageOrderValue: number;
}

interface StatsCardsProps {
  data: StatsData;
  loading?: boolean;
}

export default function StatsCards({ data, loading = false }: StatsCardsProps) {
  const stats = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: formatINRCompact(data.totalRevenue),
      fullValue: formatINR(data.totalRevenue),
      growth: calculateGrowth(data.totalRevenue, data.previousRevenue),
      isPositive: data.totalRevenue >= data.previousRevenue,
      icon: DollarSign,
      gradient: 'from-secondary to-secondary-hover',
      bgLight: 'bg-secondary-light',
      textColor: 'text-secondary',
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: data.totalOrders.toString(),
      fullValue: `${data.totalOrders} orders`,
      growth: calculateGrowth(data.totalOrders, data.previousOrders),
      isPositive: data.totalOrders >= data.previousOrders,
      icon: ShoppingBag,
      gradient: 'from-primary to-primary-hover',
      bgLight: 'bg-primary-light',
      textColor: 'text-primary',
    },
    {
      id: 'customers',
      title: 'Customers',
      value: data.totalCustomers.toString(),
      fullValue: `${data.totalCustomers} customers`,
      growth: calculateGrowth(data.totalCustomers, data.previousCustomers),
      isPositive: data.totalCustomers >= data.previousCustomers,
      icon: Users,
      gradient: 'from-accent to-accent-dark',
      bgLight: 'bg-accent/10',
      textColor: 'text-accent-dark',
    },
    {
      id: 'aov',
      title: 'Avg Order Value',
      value: formatINRCompact(data.averageOrderValue),
      fullValue: formatINR(data.averageOrderValue),
      growth: calculateGrowth(data.averageOrderValue, data.previousAverageOrderValue),
      isPositive: data.averageOrderValue >= data.previousAverageOrderValue,
      icon: Receipt,
      gradient: 'from-info to-info',
      bgLight: 'bg-info/10',
      textColor: 'text-info',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface rounded-lg p-6 shadow-soft animate-pulse">
            <div className="h-12 w-12 bg-background rounded-full mb-4"></div>
            <div className="h-4 bg-background rounded w-24 mb-2"></div>
            <div className="h-8 bg-background rounded w-32 mb-2"></div>
            <div className="h-4 bg-background rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.isPositive ? TrendingUp : TrendingDown;
        
        return (
          <div
            key={stat.id}
            className="bg-surface rounded-lg p-6 shadow-soft hover-lift animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Icon and Trend */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                <Icon className="text-white" size={24} />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${stat.bgLight}`}>
                <TrendIcon 
                  size={14} 
                  className={stat.isPositive ? 'text-success' : 'text-error'} 
                />
                <span className={`text-xs font-semibold ${stat.isPositive ? 'text-success' : 'text-error'}`}>
                  {stat.growth}
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-text-secondary text-sm font-medium mb-2">
              {stat.title}
            </h3>

            {/* Value */}
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${stat.textColor}`} title={stat.fullValue}>
                {stat.value}
              </p>
            </div>

            {/* Progress Bar (optional visual element) */}
            <div className="mt-4 w-full h-1 bg-background rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${stat.gradient} animate-slide-up`}
                style={{ width: '75%', animationDelay: `${index * 100 + 300}ms` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

