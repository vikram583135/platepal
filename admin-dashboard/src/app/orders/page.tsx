'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchOrders, updateOrderStatus, checkAdminAuthStatus } from '@/store';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import OrdersTable from '@/components/OrdersTable';
import LoadingSkeleton, { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { ShoppingBagIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function OrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const { orders, loading: ordersLoading } = useSelector((state: RootState) => state.dashboard);
  
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });
  const [filteredOrders, setFilteredOrders] = useState(orders);

  useEffect(() => {
    dispatch(checkAdminAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchOrders());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      const filtered = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const start = new Date(dateRange.start!);
        const end = new Date(dateRange.end!);
        end.setHours(23, 59, 59, 999); // End of day
        return orderDate >= start && orderDate <= end;
      });
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [dateRange, orders]);

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

  const handleRefresh = () => {
    dispatch(fetchOrders());
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 page-transition">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Orders</h1>
            <p className="text-text-secondary mt-1">Manage and track all orders across the platform</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-soft"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-lg shadow-elevated p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="w-full md:w-64">
              <DateRangePicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                onChange={(start, end) => setDateRange({ start, end })}
                label="Filter by Date Range"
              />
            </div>
            {dateRange.start && dateRange.end && (
              <button
                onClick={() => setDateRange({ start: null, end: null })}
                className="text-sm text-primary hover:text-primary-hover"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{orders.length}</p>
              </div>
              <ShoppingBagIcon className="h-12 w-12 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Completed</p>
                <p className="text-3xl font-bold mt-2">{orders.filter(o => o.status === 'delivered').length}</p>
              </div>
              <svg className="h-12 w-12 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pending</p>
                <p className="text-3xl font-bold mt-2">{orders.filter(o => o.status === 'pending').length}</p>
              </div>
              <svg className="h-12 w-12 text-yellow-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Cancelled</p>
                <p className="text-3xl font-bold mt-2">{orders.filter(o => o.status === 'cancelled').length}</p>
              </div>
              <svg className="h-12 w-12 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {ordersLoading ? (
          <div className="bg-surface rounded-lg shadow-elevated p-6">
            <TableSkeleton rows={5} cols={6} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBagIcon className="w-16 h-16 text-gray-400" />}
            title="No orders found"
            description={dateRange.start && dateRange.end 
              ? "No orders found in the selected date range. Try adjusting your filters."
              : "No orders have been placed yet. Orders will appear here once customers start placing orders."
            }
          />
        ) : (
          <div className="bg-surface rounded-lg shadow-elevated overflow-hidden">
            <OrdersTable orders={filteredOrders} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

