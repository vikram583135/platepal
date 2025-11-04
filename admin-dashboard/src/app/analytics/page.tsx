'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { checkAdminAuthStatus } from '@/store';
import { PlatformAnalytics as AnalyticsData } from '@/store/types';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import PlatformAnalytics from '@/components/PlatformAnalytics';
import { hasPermission } from '@/lib/rbac';

export default function AnalyticsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, adminUser } = useSelector((state: RootState) => state.auth);
  
  // Mock analytics data - in production, this would come from the store/API
  const analytics: AnalyticsData = {
    overview: {
      totalUsers: 15420,
      activeUsers: 3420,
      totalRevenue: 2456789.50,
      revenueGrowth: 12.5,
      totalOrders: 45678,
      orderGrowth: 8.3,
      averageOrderValue: 456.78,
    },
    revenue: {
      daily: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenue: 50000 + Math.random() * 30000,
      })),
      monthly: [
        { month: 'Jan', revenue: 120000 },
        { month: 'Feb', revenue: 135000 },
        { month: 'Mar', revenue: 142000 },
        { month: 'Apr', revenue: 158000 },
        { month: 'May', revenue: 165000 },
        { month: 'Jun', revenue: 178000 },
      ],
      byRestaurant: [
        { restaurantId: 'r1', restaurantName: 'Pizza Palace', revenue: 125000 },
        { restaurantId: 'r2', restaurantName: 'Burger King', revenue: 98000 },
        { restaurantId: 'r3', restaurantName: 'Sushi Master', revenue: 87000 },
      ],
    },
    orders: {
      byStatus: {
        pending: 12,
        confirmed: 45,
        preparing: 23,
        ready: 8,
        delivered: 3420,
        cancelled: 5,
      },
      byTimeOfDay: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: Math.floor(50 + Math.random() * 200),
      })),
      averageDeliveryTime: 32,
    },
    users: {
      newUsers: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        count: Math.floor(10 + Math.random() * 50),
      })),
      userRetention: 0.78,
      activeUsersByDay: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        count: Math.floor(2000 + Math.random() * 1000),
      })),
    },
    restaurants: {
      total: 234,
      active: 189,
      pendingApproval: 12,
      suspended: 33,
    },
    deliveryPartners: {
      total: 456,
      active: 342,
      onDuty: 189,
      averageRating: 4.6,
    },
  };

  useEffect(() => {
    dispatch(checkAdminAuthStatus());
  }, [dispatch]);

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

  // RBAC Check - Temporarily disabled for admin users
  // if (!hasPermission(adminUser?.role, 'view_analytics')) {
  //   return (
  //     <DashboardLayout>
  //       <div className="text-center py-12">
  //         <p className="text-text-secondary">You don&apos;t have permission to access this page.</p>
  //       </div>
  //     </DashboardLayout>
  //   );
  // }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Platform Analytics</h1>
          <p className="text-text-secondary">Comprehensive insights into platform performance</p>
        </div>
        <PlatformAnalytics analytics={analytics} />
      </div>
    </DashboardLayout>
  );
}

