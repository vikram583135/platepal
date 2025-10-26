'use client';

import { DashboardStats } from '@/store';
import { 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  BuildingStorefrontIcon, 
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon
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
      color: 'bg-blue-500',
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Active Restaurants',
      value: stats.activeRestaurants.toString(),
      icon: BuildingStorefrontIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Delivery Partners',
      value: stats.activeDeliveryPartners.toString(),
      icon: TruckIcon,
      color: 'bg-orange-500',
    },
    {
      name: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Completed Orders',
      value: stats.completedOrders.toLocaleString(),
      icon: CheckCircleIcon,
      color: 'bg-green-600',
    },
    {
      name: 'Avg Order Value',
      value: `$${stats.averageOrderValue.toFixed(2)}`,
      icon: ChartBarIcon,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
