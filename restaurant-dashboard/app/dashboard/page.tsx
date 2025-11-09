'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { RefreshCw, Download, Calendar } from 'lucide-react';
import StatsCards from '@/app/components/StatsCards';
import AdvancedCharts from '@/app/components/AdvancedCharts';
import TopItems from '@/app/components/TopItems';
import AICoPilotSummary from '@/app/components/AICoPilotSummary';
import { DashboardSkeleton } from '@/app/components/LoadingStates';
import { toast } from 'sonner';

// --- TYPES ---
type DashboardData = {
  stats: {
    totalRevenue: number;
    previousRevenue: number;
    totalOrders: number;
    previousOrders: number;
    totalCustomers: number;
    previousCustomers: number;
    averageOrderValue: number;
    previousAverageOrderValue: number;
  };
  revenueData: Array<{ date: string; revenue: number; orders: number }>;
  orderVolumeData: Array<{ date: string; revenue: number; orders: number }>;
  peakHoursData: Array<{ hour: string; orders: number }>;
  topItems: Array<{
    id: string;
    name: string;
    category: string;
    revenue: number;
    orders: number;
    imageUrl?: string;
  }>;
};

// Generate mock data for demonstration
// In production, this would come from your analytics API
const generateMockData = (): DashboardData => {
  // Generate last 7 days of data
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  });

  const revenueData = dates.map(date => ({
    date,
    revenue: Math.floor(Math.random() * 50000) + 30000,
    orders: Math.floor(Math.random() * 50) + 30,
  }));

  const peakHoursData = [
    { hour: '9 AM', orders: 12 },
    { hour: '10 AM', orders: 18 },
    { hour: '11 AM', orders: 25 },
    { hour: '12 PM', orders: 45 },
    { hour: '1 PM', orders: 52 },
    { hour: '2 PM', orders: 38 },
    { hour: '3 PM', orders: 22 },
    { hour: '4 PM', orders: 28 },
    { hour: '5 PM', orders: 32 },
    { hour: '6 PM', orders: 35 },
    { hour: '7 PM', orders: 48 },
    { hour: '8 PM', orders: 55 },
    { hour: '9 PM', orders: 42 },
    { hour: '10 PM', orders: 25 },
  ];

  const topItems = [
    { id: '1', name: 'Butter Chicken', category: 'Main Course', revenue: 45000, orders: 125, imageUrl: '' },
    { id: '2', name: 'Margherita Pizza', category: 'Main Course', revenue: 38000, orders: 95, imageUrl: '' },
    { id: '3', name: 'Chicken Biryani', category: 'Main Course', revenue: 52000, orders: 140, imageUrl: '' },
    { id: '4', name: 'Paneer Tikka', category: 'Starters', revenue: 28000, orders: 85, imageUrl: '' },
    { id: '5', name: 'Gulab Jamun', category: 'Desserts', revenue: 12000, orders: 95, imageUrl: '' },
    { id: '6', name: 'Garlic Naan', category: 'Main Course', revenue: 18000, orders: 200, imageUrl: '' },
    { id: '7', name: 'Chicken Tikka', category: 'Starters', revenue: 32000, orders: 90, imageUrl: '' },
    { id: '8', name: 'Dal Makhani', category: 'Main Course', revenue: 24000, orders: 75, imageUrl: '' },
  ];

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = revenueData.reduce((sum, d) => sum + d.orders, 0);

  return {
    stats: {
      totalRevenue,
      previousRevenue: totalRevenue * 0.85,
      totalOrders,
      previousOrders: Math.floor(totalOrders * 0.9),
      totalCustomers: 245,
      previousCustomers: 220,
      averageOrderValue: totalRevenue / totalOrders,
      previousAverageOrderValue: (totalRevenue * 0.85) / Math.floor(totalOrders * 0.9),
    },
    revenueData,
    orderVolumeData: revenueData,
    peakHoursData,
    topItems,
  };
};

// --- API FUNCTIONS ---
const getDashboardData = async (): Promise<DashboardData> => {
  // TODO: Replace with actual API call
  // const token = localStorage.getItem('accessToken');
  // const { data } = await axios.get('http://localhost:3003/analytics/dashboard', {
  //   headers: { Authorization: `Bearer ${token}` },
  // });
  // return data;
  
  // For now, return mock data
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  return generateMockData();
};

// --- MAIN PAGE COMPONENT ---
function DashboardPage() {
  const { data, isLoading, refetch, isFetching } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    refetchInterval: 60000, // Auto-refresh every minute
  });

  const handleRefresh = async () => {
    toast.info('Refreshing dashboard data...');
    await refetch();
    toast.success('Dashboard updated!');
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon!');
    // TODO: Implement export to CSV/Excel
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-text-secondary">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">
            Welcome back! Here's what's happening with your restaurant today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-surface border border-border rounded-lg hover:bg-background transition-colors flex items-center gap-2 text-text-primary font-medium"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="px-4 py-2 gradient-primary text-white rounded-lg hover-lift transition-all flex items-center gap-2 font-medium disabled:opacity-50"
          >
            <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* AI Co-Pilot Summary */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary mb-4">AI Co-Pilot Insights</h2>
        <AICoPilotSummary />
      </div>

      {/* Stats Cards */}
      <StatsCards data={data.stats} loading={false} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts - Takes 2 columns */}
        <div className="lg:col-span-2">
          <AdvancedCharts
            revenueData={data.revenueData}
            orderVolumeData={data.orderVolumeData}
            peakHoursData={data.peakHoursData}
            loading={false}
          />
        </div>

        {/* Top Items - Takes 1 column */}
        <div className="lg:col-span-1">
          <TopItems
            items={data.topItems}
            totalRevenue={data.stats.totalRevenue}
            loading={false}
          />
        </div>
      </div>

      {/* Quick Actions or Additional Widgets can go here */}
      <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift animate-slide-up">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-info to-info/80 flex items-center justify-center flex-shrink-0">
            <Calendar className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Need more insights?
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              View detailed reports, analytics, and performance metrics in the Analytics section.
              Track your growth over time and identify opportunities for improvement.
            </p>
            <button className="gradient-primary text-white px-6 py-2 rounded-lg font-semibold hover-lift transition-all">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;