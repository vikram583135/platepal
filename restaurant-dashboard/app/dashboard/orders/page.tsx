'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { 
  MoreHorizontal, Truck, Clock, CheckCircle2, XCircle, Search, 
  Filter, Download, RefreshCw, Bell, Package, ChevronDown,
  Calendar, DollarSign, User, Wifi, WifiOff
} from 'lucide-react';
import { toast } from 'sonner';
import { formatINR } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TableSkeleton } from '@/app/components/LoadingStates';
import withAuth from '@/app/components/withAuth';
import { initWebSocket, getWebSocketClient, disconnectWebSocket, type OrderEventType } from '@/lib/websocket';
import OrderKanbanBoard from '@/app/components/OrderKanbanBoard';

// --- TYPES ---
type OrderItem = { id: string; name: string; quantity: number; price: number };
type Order = {
  id: string;
  customer_name: string;
  order_date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  total_amount: number;
  items: OrderItem[];
};

const ORDER_STATUSES: Order['status'][] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

// --- API FUNCTIONS ---
const getOrders = async (): Promise<Order[]> => {
  const token = localStorage.getItem('accessToken');
  const { data } = await axios.get('http://localhost:3003/orders', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const updateOrderStatus = async ({ orderId, status }: { orderId: string; status: Order['status'] }): Promise<Order> => {
  const token = localStorage.getItem('accessToken');
  const { data } = await axios.patch(`http://localhost:3003/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

// --- MAIN PAGE COMPONENT ---
function OrdersPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [newOrderNotification, setNewOrderNotification] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const wsInitialized = useRef(false);
  
  // Filters
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });

  const { data: orders = [], isLoading, isError, refetch } = useQuery<Order[]>({ 
    queryKey: ['orders'], 
    queryFn: getOrders,
    refetchInterval: autoRefresh && !wsConnected ? 10000 : false, // Auto-refresh only if WebSocket not connected
  });

  // Clear notification count when orders page is viewed
  useEffect(() => {
    localStorage.setItem('restaurant_notification_count', '0');
    window.dispatchEvent(new CustomEvent('newOrderNotification', { detail: 0 }));
  }, []);

  // Initialize WebSocket for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || wsInitialized.current) return;

    const ORDER_SERVICE_URL = process.env.NEXT_PUBLIC_ORDER_URL || 'http://localhost:3003';
    
    try {
      const wsClient = initWebSocket(ORDER_SERVICE_URL, token);
      wsInitialized.current = true;

      // Check connection status
      const checkConnection = () => {
        const client = getWebSocketClient();
        setWsConnected(client?.isConnected() ?? false);
      };

      // Initial check
      setTimeout(checkConnection, 1000);

      // Listen for new orders
      const unsubscribeNewOrder = wsClient.on('order_created', (event) => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        setNewOrderNotification(`New order #${event.orderId.slice(-6)} received!`);
        
        // Update notification count in localStorage for sidebar badge
        const currentCount = parseInt(localStorage.getItem('restaurant_notification_count') || '0', 10);
        const newCount = currentCount + 1;
        localStorage.setItem('restaurant_notification_count', String(newCount));
        // Trigger custom event for sidebar update (works in same window)
        window.dispatchEvent(new CustomEvent('newOrderNotification', { detail: newCount }));
        // Also trigger storage event (works across tabs)
        window.dispatchEvent(new Event('storage'));
        
        toast.success(`New order received!`, {
          description: `Order #${event.orderId.slice(-6)}`,
          icon: <Package className="text-accent" size={20} />,
        });
        
        // Play notification sound
        if (typeof window !== 'undefined' && 'Audio' in window) {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {});
        }
        
        // Clear notification after 5 seconds
        setTimeout(() => setNewOrderNotification(null), 5000);
      });

      // Listen for order status changes
      const unsubscribeStatusChange = wsClient.on('order_status_changed', (event) => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        toast.info(`Order #${event.orderId.slice(-6)} status updated: ${event.status}`);
      });

      // Listen for delivery updates
      const unsubscribeDelivery = wsClient.on('delivery_assigned', (event) => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        toast.info(`Delivery partner assigned to order #${event.orderId.slice(-6)}`);
      });

      // Periodic connection check
      const connectionInterval = setInterval(checkConnection, 5000);

      return () => {
        unsubscribeNewOrder();
        unsubscribeStatusChange();
        unsubscribeDelivery();
        clearInterval(connectionInterval);
        disconnectWebSocket();
        wsInitialized.current = false;
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mutation = useMutation<Order, AxiosError, { orderId: string; status: Order['status'] }, unknown>({
    mutationFn: updateOrderStatus,
    onSuccess: (data) => {
      toast.success(`Order #${data.id.substring(0, 8)} updated to ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Play notification sound
      if (typeof window !== 'undefined' && 'Audio' in window) {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {}); // Ignore errors if sound file doesn't exist
      }
    },
    onError: (error) => {
      const errorMsg = (error.response?.data as any)?.message || 'Failed to update order status.';
      toast.error(errorMsg);
    },
  });

  const handleStatusChange = (orderId: string, status: string) => {
    mutation.mutate({ orderId, status: status as Order['status'] });
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = (!dateRange.from || new Date(order.order_date) >= new Date(dateRange.from)) &&
                        (!dateRange.to || new Date(order.order_date) <= new Date(dateRange.to));
    
    const matchesAmount = (!amountRange.min || order.total_amount >= parseFloat(amountRange.min)) &&
                          (!amountRange.max || order.total_amount <= parseFloat(amountRange.max));
    
    return matchesStatus && matchesSearch && matchesDate && matchesAmount;
  });

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    totalRevenue: orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.total_amount, 0),
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleBulkAction = (action: string) => {
    if (selectedOrders.size === 0) {
      toast.error('Please select orders first');
      return;
    }
    toast.info(`${action} for ${selectedOrders.size} orders - Coming soon!`);
  };

  const handleExport = () => {
    toast.info('Exporting orders to CSV - Coming soon!');
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-warning/10 text-warning';
      case 'IN_PROGRESS': return 'bg-info/10 text-info';
      case 'COMPLETED': return 'bg-success/10 text-success';
      case 'CANCELLED': return 'bg-error/10 text-error';
      default: return 'bg-background text-text-secondary';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return <Clock size={16} />;
      case 'IN_PROGRESS': return <Package size={16} />;
      case 'COMPLETED': return <CheckCircle2 size={16} />;
      case 'CANCELLED': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const clearFilters = () => {
    setSelectedStatus('all');
    setSearchQuery('');
    setDateRange({ from: '', to: '' });
    setAmountRange({ min: '', max: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* New Order Notification Banner */}
      {newOrderNotification && (
        <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-lg animate-slide-down flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="text-accent animate-bounce-once" size={20} />
            <div>
              <p className="font-semibold text-text-primary">{newOrderNotification}</p>
              <p className="text-sm text-text-secondary">Click refresh to see the new order</p>
            </div>
          </div>
          <button
            onClick={() => {
              refetch();
              setNewOrderNotification(null);
            }}
            className="px-4 py-2 bg-accent text-white rounded-md font-medium hover:bg-accent-dark transition-colors"
          >
            View Now
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-text-primary">Order Management</h1>
            {/* WebSocket Connection Indicator */}
            <div className="flex items-center gap-2">
              {wsConnected ? (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                  <Wifi size={14} />
                  <span>Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-warning/10 text-warning rounded-full text-xs font-medium">
                  <WifiOff size={14} />
                  <span>Offline</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-text-secondary mt-1">
            {wsConnected 
              ? 'Real-time order updates enabled' 
              : 'Manage and track all customer orders'}
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            disabled={wsConnected}
            title={wsConnected ? 'Real-time updates active - auto-refresh disabled' : 'Toggle auto-refresh'}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              autoRefresh && !wsConnected 
                ? 'gradient-secondary text-white' 
                : 'bg-surface border border-border text-text-primary hover:bg-background'
            } ${wsConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Bell size={18} className={autoRefresh && !wsConnected ? 'animate-pulse' : ''} />
            <span>{wsConnected ? 'Live Updates' : 'Auto-refresh'}</span>
          </button>

          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-surface border border-border rounded-lg hover:bg-background transition-colors flex items-center gap-2 text-text-primary font-medium"
          >
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 gradient-primary text-white rounded-lg hover-lift transition-all flex items-center gap-2 font-medium"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-surface rounded-lg p-4 shadow-soft hover-lift">
          <p className="text-xs text-text-secondary mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow-soft hover-lift">
          <p className="text-xs text-text-secondary mb-1">Pending</p>
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow-soft hover-lift">
          <p className="text-xs text-text-secondary mb-1">In Progress</p>
          <p className="text-2xl font-bold text-info">{stats.inProgress}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow-soft hover-lift">
          <p className="text-xs text-text-secondary mb-1">Completed</p>
          <p className="text-2xl font-bold text-success">{stats.completed}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow-soft hover-lift">
          <p className="text-xs text-text-secondary mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-error">{stats.cancelled}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 shadow-soft hover-lift">
          <p className="text-xs text-text-secondary mb-1">Revenue</p>
          <p className="text-2xl font-bold text-secondary">{formatINR(stats.totalRevenue)}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-surface rounded-lg p-6 shadow-soft">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
              <input
                type="text"
                placeholder="Search by customer name or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            <option value="all">All Status</option>
            {ORDER_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-surface border border-border rounded-lg hover:bg-background transition-colors flex items-center gap-2 text-text-primary font-medium"
          >
            <Filter size={18} />
            <span>More Filters</span>
            <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-down">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Amount Range (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={amountRange.min}
                  onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={amountRange.max}
                  onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-primary hover:bg-primary-light rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedOrders.size > 0 && (
        <div className="bg-primary-light p-4 rounded-lg flex items-center justify-between animate-slide-down">
          <span className="text-primary font-semibold">{selectedOrders.size} orders selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('Accept')}
              className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors text-sm font-medium"
            >
              Accept Selected
            </button>
            <button
              onClick={() => handleBulkAction('Export')}
              className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-background transition-colors text-sm font-medium"
            >
              Export Selected
            </button>
            <button
              onClick={() => setSelectedOrders(new Set())}
              className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors text-sm font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Orders View */}
      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : isError ? (
        <div className="bg-surface rounded-lg p-12 text-center shadow-soft">
          <XCircle size={64} className="text-error mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">Failed to load orders</h3>
          <p className="text-text-secondary mb-4">Please try again later</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 gradient-primary text-white rounded-lg hover-lift transition-all"
          >
            Try Again
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-surface rounded-lg p-12 text-center shadow-soft">
          <Package size={64} className="text-text-secondary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
          </h3>
          <p className="text-text-secondary">
            {orders.length === 0 ? 'Your orders will appear here once customers start ordering' : 'Try adjusting your search criteria'}
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        <OrderKanbanBoard 
          orders={filteredOrders} 
          onStatusUpdate={handleStatusChange}
        />
      ) : (
        <div className="bg-surface rounded-lg shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-background transition-colors animate-slide-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-medium text-text-primary">
                      #{order.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-text-primary font-medium">{order.customer_name}</td>
                    <td className="px-6 py-4 text-text-primary text-sm">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-primary text-sm">{order.items.length} items</td>
                    <td className="px-6 py-4 font-bold text-secondary">{formatINR(order.total_amount)}</td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {ORDER_STATUSES.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => handleStatusChange(order.id, status)}
                              disabled={order.status === status}
                            >
                              {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(OrdersPage);
