'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { checkAdminAuthStatus, fetchDashboardStats, fetchOrders, fetchRestaurants, fetchDeliveryPartners, fetchCustomers } from '@/store';
import { formatINR } from '@/lib/currency';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCards from '@/components/StatsCards';
import OrdersTable from '@/components/OrdersTable';
import RestaurantsTable from '@/components/RestaurantsTable';
import DeliveryPartnersTable from '@/components/DeliveryPartnersTable';
import CustomersTable from '@/components/CustomersTable';
import RevenueChart from '@/components/RevenueChart';
import { CardSkeleton, TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { 
  ShoppingBagIcon, 
  ClipboardDocumentCheckIcon, 
  BuildingStorefrontIcon, 
  UsersIcon,
  TruckIcon,
  ArrowRightIcon,
  ChartBarIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const { stats, orders, restaurants, deliveryPartners, customers, loading: dashboardLoading } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(checkAdminAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDashboardStats());
      dispatch(fetchOrders());
      dispatch(fetchRestaurants());
      dispatch(fetchDeliveryPartners());
      dispatch(fetchCustomers());
    }
  }, [isAuthenticated, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const quickActions = [
    { icon: ClipboardDocumentCheckIcon, label: 'Restaurant Approvals', href: '/approvals', count: 5, color: 'from-blue-500 to-blue-600' },
    { icon: ShoppingBagIcon, label: 'View Orders', href: '/orders', count: orders.length, color: 'from-green-500 to-green-600' },
    { icon: BuildingStorefrontIcon, label: 'Restaurants', href: '/restaurants', count: restaurants.length, color: 'from-purple-500 to-purple-600' },
    { icon: UsersIcon, label: 'Customers', href: '/customers', count: customers.length, color: 'from-pink-500 to-pink-600' },
    { icon: TruckIcon, label: 'Delivery Partners', href: '/delivery-partners', count: deliveryPartners.length, color: 'from-orange-500 to-orange-600' },
    { icon: ChartBarIcon, label: 'Analytics', href: '/analytics', color: 'from-indigo-500 to-indigo-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 page-transition">
        {/* Header with Quick Actions */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-text-secondary mt-1">Welcome to PlatePal Admin Dashboard</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={action.label}
              href={action.href}
              className="bg-surface rounded-lg shadow-elevated p-4 card-hover group relative overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-text-primary">{action.label}</p>
                {action.count !== undefined && (
                  <p className="text-xs text-text-secondary mt-1">{action.count} {action.label === 'View Orders' ? 'active' : 'total'}</p>
                )}
                <ArrowRightIcon className="h-4 w-4 text-primary mt-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Cards */}
        {dashboardLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 7 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : stats && <StatsCards stats={stats} />}
        
        {/* Charts and Top Restaurants */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dashboardLoading ? (
            <CardSkeleton />
          ) : (
            <RevenueChart />
          )}
          {dashboardLoading ? (
            <CardSkeleton />
          ) : (
            <div className="bg-surface rounded-lg shadow-elevated p-6 animate-fade-in card-hover">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Top Restaurants</h3>
                <Link href="/restaurants" className="text-sm text-primary hover:text-primary-hover flex items-center">
                  View All <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-3">
                {stats?.topRestaurants.map((restaurant, index) => (
                  <div key={restaurant.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-primary-light hover:bg-opacity-10 transition-colors border border-transparent hover:border-border">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold mr-3">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-text-primary">{restaurant.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-text-primary">{restaurant.orderCount} orders</div>
                      <div className="text-xs text-text-secondary">{formatINR(restaurant.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {dashboardLoading ? (
            <TableSkeleton rows={3} cols={5} />
          ) : (
            <OrdersTable orders={orders} />
          )}
          {dashboardLoading ? (
            <TableSkeleton rows={3} cols={6} />
          ) : (
            <RestaurantsTable restaurants={restaurants} />
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {dashboardLoading ? (
            <TableSkeleton rows={3} cols={7} />
          ) : (
            <DeliveryPartnersTable deliveryPartners={deliveryPartners} />
          )}
          {dashboardLoading ? (
            <TableSkeleton rows={3} cols={6} />
          ) : (
            <CustomersTable customers={customers} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}