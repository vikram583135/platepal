'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { checkAdminAuthStatus, fetchDashboardStats, fetchOrders, fetchRestaurants, fetchDeliveryPartners, fetchCustomers } from '@/store';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCards from '@/components/StatsCards';
import OrdersTable from '@/components/OrdersTable';
import RestaurantsTable from '@/components/RestaurantsTable';
import DeliveryPartnersTable from '@/components/DeliveryPartnersTable';
import CustomersTable from '@/components/CustomersTable';
import RevenueChart from '@/components/RevenueChart';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const { stats, orders, restaurants, deliveryPartners, customers } = useSelector((state: RootState) => state.dashboard);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to PlatePal Admin Dashboard</p>
        </div>

        {stats && <StatsCards stats={stats} />}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Restaurants</h3>
            <div className="space-y-3">
              {stats?.topRestaurants.map((restaurant, index) => (
                <div key={restaurant.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 mr-2">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{restaurant.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{restaurant.orderCount} orders</div>
                    <div className="text-xs text-gray-500">${restaurant.revenue.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <OrdersTable orders={orders} />
          <RestaurantsTable restaurants={restaurants} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <DeliveryPartnersTable deliveryPartners={deliveryPartners} />
          <CustomersTable customers={customers} />
        </div>
      </div>
    </DashboardLayout>
  );
}