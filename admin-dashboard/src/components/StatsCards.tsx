'use client';

import { DashboardStats } from '@/store';
import { formatINR } from '@/lib/currency';
import { 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  BuildingStorefrontIcon, 
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const statCards = [
    {
      name: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBagIcon,
      gradient: 'from-blue-500 to-blue-600',
      trend: '+12%',
      trendPositive: true,
    },
    {
      name: 'Total Revenue',
      value: formatINR(stats.totalRevenue),
      icon: CurrencyDollarIcon,
      gradient: 'from-green-500 to-green-600',
      trend: '+8%',
      trendPositive: true,
    },
    {
      name: 'Active Restaurants',
      value: stats.activeRestaurants.toString(),
      icon: BuildingStorefrontIcon,
      gradient: 'from-purple-500 to-purple-600',
      trend: '+5%',
      trendPositive: true,
    },
    {
      name: 'Delivery Partners',
      value: stats.activeDeliveryPartners.toString(),
      icon: TruckIcon,
      gradient: 'from-orange-500 to-orange-600',
      trend: '+3%',
      trendPositive: true,
    },
    {
      name: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: ClockIcon,
      gradient: 'from-yellow-500 to-yellow-600',
      trend: '-2%',
      trendPositive: false,
    },
    {
      name: 'Completed Orders',
      value: stats.completedOrders.toLocaleString(),
      icon: CheckCircleIcon,
      gradient: 'from-emerald-500 to-emerald-600',
      trend: '+15%',
      trendPositive: true,
    },
    {
      name: 'Avg Order Value',
      value: formatINR(stats.averageOrderValue),
      icon: ChartBarIcon,
      gradient: 'from-indigo-500 to-indigo-600',
      trend: '+10%',
      trendPositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <div 
          key={stat.name} 
          className={`bg-gradient-to-br ${stat.gradient} overflow-hidden shadow-elevated rounded-lg hover-lift hover-scale animate-slide-up card-hover group`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="relative p-5 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 shadow-md group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-white text-opacity-80 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-2xl font-bold text-white">
                    {stat.value}
                  </dd>
                  <div className="flex items-center mt-1">
                    {stat.trendPositive ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-white text-opacity-90" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-white text-opacity-90" />
                    )}
                    <span className="ml-1 text-xs font-semibold text-white text-opacity-90">
                      {stat.trend}
                    </span>
                    <span className="ml-1 text-xs text-white text-opacity-70">vs last month</span>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
