'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, Order } from '@/lib/api';
import { useAuthStore, useTaskStore, DeliveryTask } from '@/lib/store';
import TaskCard from '@/components/TaskCard';
import { LogOut, RefreshCw, Package, DollarSign, TrendingUp, TrendingDown, ArrowRight, Search, Wifi, WifiOff, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { initWebSocket, getWebSocketClient, DeliveryEvent } from '@/lib/websocket';
import AvailabilityToggle from '@/components/AvailabilityToggle';
import { useAvailabilityStore, useEarningsStore } from '@/lib/store';

export default function DashboardPage() {
  const router = useRouter();
  const { token, deliveryPartner, logout } = useAuthStore();
  const { currentTask, setCurrentTask, availableTasks, setAvailableTasks, addAvailableTask, removeAvailableTask } = useTaskStore();
  const { isAvailable } = useAvailabilityStore();
  const { totalEarnings, todayEarnings, completedDeliveries } = useEarningsStore();
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef<number>(0);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    loadTasks();

    // Initialize WebSocket for real-time updates
    const ORDER_URL = process.env.NEXT_PUBLIC_ORDER_URL || 'http://localhost:3003';
    const wsClient = initWebSocket(ORDER_URL, token, deliveryPartner?.id);

    // Check connection status periodically
    const checkConnection = () => {
      setWsConnected(wsClient.isConnected());
    };
    setTimeout(checkConnection, 1000);
    
    const connectionInterval = setInterval(() => {
      checkConnection();
    }, 5000);

    // Listen for delivery assignments
    const unsubscribeAssigned = wsClient.on('delivery_assigned', (event: DeliveryEvent) => {
      // Map order to task and add to available tasks
      // In production, fetch full order details from API
      toast.success('New delivery assigned!', {
        description: `Order #${String(event.orderId).slice(-6)}`,
      });
      loadTasks(); // Refresh tasks list
    });

    // Listen for order updates
    const unsubscribeUpdate = wsClient.on('order_update', (event: DeliveryEvent) => {
      if (event.order) {
        const task = mapOrderToTask(event.order);
        // Update task in list if it exists
        setAvailableTasks((prev) =>
          prev.map((t) => (t.id === task.id ? task : t))
        );
      }
    });

    // Listen for cancellations
    const unsubscribeCancelled = wsClient.on('order_cancelled', (event: DeliveryEvent) => {
      removeAvailableTask(String(event.orderId));
      toast.error('Order cancelled', {
        description: `Order #${String(event.orderId).slice(-6)} has been cancelled`,
      });
    });

    return () => {
      unsubscribeAssigned();
      unsubscribeUpdate();
      unsubscribeCancelled();
      clearInterval(connectionInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadTasks = async (showRefresh = false) => {
    if (!token) return;
    
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const orders = await apiService.getActiveOrders(token);
      const tasks = orders
        .filter((o) => ['ready', 'picked_up'].includes(o.status.toLowerCase()))
        .map(mapOrderToTask);
      setAvailableTasks(tasks);
      if (showRefresh) {
        toast.success('Tasks refreshed', { duration: 1500 });
      }
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePullToRefresh = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartY.current = touch.clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartY.current;
    if (deltaY > 100 && window.scrollY === 0 && !refreshing) {
      loadTasks(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshing]);

  const mapOrderToTask = (order: Order): DeliveryTask => ({
    id: order.id,
    orderId: order.id,
    restaurantName: order.items[0]?.restaurantName || 'Restaurant',
    customerName: 'Customer',
    pickupAddress: 'Restaurant Address',
    deliveryAddress: 'Customer Address',
    status: order.status,
    items: order.items,
    total: order.total,
    createdAt: order.createdAt,
  });

  const handleAcceptTask = async (task: DeliveryTask) => {
    if (!token) return;

    try {
      await apiService.updateOrderStatus(task.orderId, 'picked_up', token);
      setCurrentTask(task);
      removeAvailableTask(task.id);
      toast.success('Task accepted!');
      router.push(`/active`);
    } catch (error) {
      toast.error('Failed to accept task');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const filteredTasks = availableTasks.filter(task => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      task.restaurantName.toLowerCase().includes(query) ||
      task.orderId.toLowerCase().includes(query) ||
      task.pickupAddress.toLowerCase().includes(query) ||
      task.deliveryAddress.toLowerCase().includes(query)
    );
  });

  // Calculate earnings trend (mock - in real app would compare with previous period)
  const earningsTrend: number = 0; // positive = up, negative = down

  if (!token) {
    return null;
  }

  return (
    <div 
      className="min-h-screen bg-neutral-background"
      onTouchStart={handlePullToRefresh}
      onTouchMove={handleTouchMove}
    >
      {/* Enhanced Header */}
      <div className="gradient-primary text-white p-5 sticky top-0 z-40 shadow-xl-glow">
        <div className="flex items-center justify-between mb-3 animate-slide-down">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              {/* WebSocket Connection Indicator */}
              <div className="relative" title={wsConnected ? 'Connected' : 'Disconnected'}>
                <div className={`absolute top-0 right-0 w-2 h-2 rounded-full ${wsConnected ? 'bg-white animate-pulse' : 'bg-red-300'}`} />
                {wsConnected ? (
                  <Wifi size={18} className="text-white/80" />
                ) : (
                  <WifiOff size={18} className="text-white/80" />
                )}
              </div>
            </div>
            <p className="text-sm opacity-90 flex items-center gap-2">
              <span>Hello, {deliveryPartner?.name || 'Driver'}</span>
              {wsConnected && (
                <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  <Zap size={12} />
                  Live
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadTasks(true)}
              className="p-3 hover:bg-white/10 rounded-full active:scale-95 transition-transform touch-target relative"
              disabled={loading || refreshing}
              aria-label="Refresh tasks"
              title="Refresh"
            >
              <RefreshCw size={22} className={`${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="p-3 hover:bg-white/10 rounded-full active:scale-95 transition-transform touch-target"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Current Task Banner */}
      {currentTask && (
        <div className="bg-gradient-to-r from-primary-light to-primary/10 border-b-2 border-primary p-4 animate-slide-down shadow-elevated">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
                <Package className="text-white" size={24} />
              </div>
              <div>
                <span className="text-neutral-text-primary font-bold text-lg block">Active Delivery</span>
                <span className="text-xs text-neutral-text-secondary">Order #{currentTask.orderId.slice(-6)}</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/active')}
              className="gradient-primary text-white font-bold text-base touch-target-large px-6 py-3 rounded-xl transition-all hover:shadow-glow active:scale-95 flex items-center gap-2"
            >
              View Details
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Availability Toggle */}
        <div className="bg-neutral-surface rounded-lg p-5 shadow-elevated animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-text-primary">Availability Status</h3>
              <p className="text-sm text-neutral-text-secondary">
                {isAvailable ? 'You are available to receive orders' : 'You are offline'}
              </p>
            </div>
          </div>
          <AvailabilityToggle />
        </div>

        {/* Enhanced Quick Earnings Summary with Animations */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-neutral-surface to-primary-light/20 rounded-xl p-5 shadow-elevated hover-lift animate-fade-in-up border border-primary/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-status-active" />
                </div>
                <p className="text-sm font-semibold text-neutral-text-secondary">Today</p>
              </div>
              {earningsTrend > 0 ? (
                <TrendingUp size={16} className="text-success" />
              ) : earningsTrend < 0 ? (
                <TrendingDown size={16} className="text-error" />
              ) : null}
            </div>
            <p className="text-3xl font-bold text-status-active animate-fade-in">
              ₹{todayEarnings.toFixed(2)}
            </p>
            {earningsTrend !== 0 && (
              <p className={`text-xs mt-1 ${earningsTrend > 0 ? 'text-success' : 'text-error'}`}>
                {earningsTrend > 0 ? '+' : ''}{earningsTrend.toFixed(1)}% vs yesterday
              </p>
            )}
          </div>
          <div className="bg-gradient-to-br from-neutral-surface to-status-completed/10 rounded-xl p-5 shadow-elevated hover-lift animate-fade-in-up animate-stagger-1 border border-status-completed/10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-status-completed/10 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-status-completed" />
              </div>
              <p className="text-sm font-semibold text-neutral-text-secondary">Deliveries</p>
            </div>
            <p className="text-3xl font-bold text-status-completed animate-fade-in">{completedDeliveries}</p>
            <p className="text-xs text-neutral-text-secondary mt-1">Completed today</p>
          </div>
        </div>

        {/* Enhanced Earnings Link */}
        <button
          onClick={() => router.push('/earnings')}
          aria-label={`View full earnings. Total earnings: ₹${totalEarnings.toFixed(2)}`}
          className="w-full bg-gradient-to-r from-neutral-surface to-primary-light/30 rounded-xl p-5 shadow-elevated hover-lift border-2 border-primary/20 animate-fade-in-up animate-stagger-2 flex items-center justify-between touch-target-large transition-all hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md">
              <DollarSign size={24} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-neutral-text-primary text-lg">View Full Earnings</p>
              <p className="text-sm text-neutral-text-secondary">Total: ₹{totalEarnings.toFixed(2)}</p>
            </div>
          </div>
          <ArrowRight size={24} className="text-primary" />
        </button>

        {/* Enhanced Available Tasks Section */}
        <div className="animate-fade-in-up animate-stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-neutral-text-primary">Available Tasks</h2>
            {availableTasks.length > 0 && (
              <span className="text-sm text-neutral-text-secondary bg-primary-light/30 px-3 py-1 rounded-full font-semibold">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            )}
          </div>

          {/* Search Bar */}
          {availableTasks.length > 3 && (
            <div className="mb-4 relative animate-fade-in-up">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-text-secondary" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by restaurant, order ID, or address..."
                className="w-full pl-12 pr-4 py-3 border-2 border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-neutral-text-primary font-medium"
                aria-label="Search tasks"
                aria-describedby="search-description"
              />
              <span id="search-description" className="sr-only">
                Search for tasks by restaurant name, order ID, or delivery address
              </span>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-neutral-surface rounded-xl p-5 shadow-elevated skeleton animate-pulse" style={{ height: '180px' }}>
                  <div className="h-4 bg-neutral-border/50 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-neutral-border/50 rounded w-1/2 mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-neutral-border/50 rounded" />
                    <div className="h-3 bg-neutral-border/50 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-16 animate-fade-in bg-neutral-surface rounded-xl border-2 border-dashed border-neutral-border">
              <div className="w-24 h-24 bg-neutral-background rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={48} className="text-neutral-text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-neutral-text-primary mb-2">
                {searchQuery ? 'No matching tasks' : 'No tasks available'}
              </h3>
              <p className="text-neutral-text-secondary">
                {searchQuery ? 'Try adjusting your search' : 'New delivery tasks will appear here'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
                  aria-label="Clear search"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className="animate-fade-in-up animate-stagger-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TaskCard
                    task={task}
                    onAccept={handleAcceptTask}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

