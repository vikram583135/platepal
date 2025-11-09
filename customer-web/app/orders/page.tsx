'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, Order } from '@/lib/api';
import { useAuthStore, useCartStore } from '@/lib/store';
import { initWebSocket, getWebSocketClient, OrderEvent } from '@/lib/websocket';
import MobileNav from '@/components/MobileNav';
import OrderStatus from '@/components/OrderStatus';
import { Receipt, RefreshCw, Search, Filter, RotateCcw, ChevronDown, X, Wifi, WifiOff, Star } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

type OrderFilter = 'all' | 'active' | 'completed' | 'cancelled';

export default function OrdersPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { addItem, clearCart, restaurantId: currentRestaurantId } = useCartStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'amount'>('recent');
  const [wsConnected, setWsConnected] = useState(false);
  const wsInitialized = useRef(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    loadOrders();

    // Initialize WebSocket for real-time updates
    if (!wsInitialized.current && token) {
      // Use nginx proxy path for WebSocket or direct URL
      const USE_NGINX_PROXY = process.env.NEXT_PUBLIC_USE_NGINX_PROXY === 'true';
      const ORDER_URL = USE_NGINX_PROXY
        ? (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost/socket.io')
        : (process.env.NEXT_PUBLIC_ORDER_URL?.replace('http://', 'ws://').replace('https://', 'wss://') || 'ws://localhost:3003');
      const wsClient = initWebSocket(ORDER_URL, token, user?.id);
      wsInitialized.current = true;

      // Check connection status
      const checkConnection = () => {
        setWsConnected(wsClient.isConnected());
      };
      setTimeout(checkConnection, 1000);

      // Listen for order status changes
      const unsubscribeStatus = wsClient.on('order_status_changed', (event: OrderEvent) => {
        setOrders((prev) =>
          prev.map((order) =>
            String(order.id) === String(event.orderId)
              ? { ...order, status: event.status || order.status }
              : order
          )
        );
        toast.success('Order updated', {
          description: `Order #${String(event.orderId).slice(-6)} status changed`,
        });
      });

      // Listen for new orders
      const unsubscribeCreated = wsClient.on('order_created', (event: OrderEvent) => {
        if (event.order) {
          setOrders((prev) => [event.order, ...prev]);
          toast.success('New order received!', {
            description: `Order #${String(event.orderId).slice(-6)}`,
          });
        }
      });

      // Listen for delivery updates
      const unsubscribeDelivery = wsClient.on('delivery_assigned', (event: OrderEvent) => {
        setOrders((prev) =>
          prev.map((order) =>
            String(order.id) === String(event.orderId)
              ? { ...order, status: 'out_for_delivery' }
              : order
          )
        );
      });

      // Listen for delivery completed
      const unsubscribeDelivered = wsClient.on('order_delivered', (event: OrderEvent) => {
        setOrders((prev) =>
          prev.map((order) =>
            String(order.id) === String(event.orderId)
              ? { ...order, status: 'delivered' }
              : order
          )
        );
        toast.success('Order delivered!', {
          description: `Order #${String(event.orderId).slice(-6)} has been delivered`,
        });
      });

      // Listen for cancellations
      const unsubscribeCancelled = wsClient.on('order_cancelled', (event: OrderEvent) => {
        setOrders((prev) =>
          prev.map((order) =>
            String(order.id) === String(event.orderId)
              ? { ...order, status: 'cancelled' }
              : order
          )
        );
        toast.error('Order cancelled', {
          description: `Order #${String(event.orderId).slice(-6)} has been cancelled`,
        });
      });

      return () => {
        unsubscribeStatus();
        unsubscribeCreated();
        unsubscribeDelivery();
        unsubscribeDelivered();
        unsubscribeCancelled();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadOrders = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const data = await apiService.getAllOrders(token);
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((order) => {
        const status = order.status.toLowerCase();
        if (filter === 'active') {
          return !['completed', 'cancelled', 'delivered'].includes(status);
        } else if (filter === 'completed') {
          return ['completed', 'delivered'].includes(status);
        } else if (filter === 'cancelled') {
          return status === 'cancelled';
        }
        return true;
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.items.some((item) => item.name.toLowerCase().includes(query)) ||
          (order.restaurantName && order.restaurantName.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'amount') {
        return b.total - a.total;
      }
      return 0;
    });

    return filtered;
  }, [orders, filter, searchQuery, sortBy]);

  const handleReOrder = async (order: Order) => {
    if (!token) {
      toast.error('Please login to re-order');
      router.push('/login');
      return;
    }

    try {
      // Clear current cart if it's from a different restaurant
      if (currentRestaurantId && order.restaurantId && currentRestaurantId !== order.restaurantId) {
        clearCart();
      }
      
      // If no restaurant ID in order, we can't proceed
      if (!order.restaurantId) {
        toast.error('Cannot re-order: restaurant information missing');
        return;
      }

      // Add all items from the order to cart
      order.items.forEach((item) => {
        addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          restaurantId: order.restaurantId || '',
          restaurantName: order.restaurantName || 'Restaurant',
          image: item.image,
        });
      });

      toast.success('Items added to cart!');
      router.push('/cart');
    } catch (error) {
      toast.error('Failed to add items to cart');
    }
  };

  const activeOrdersCount = orders.filter(
    (order) => !['completed', 'cancelled', 'delivered'].includes(order.status.toLowerCase())
  ).length;

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-background pb-20">
      {/* Header */}
      <div className="gradient-primary text-white p-4 sticky top-0 z-40 shadow-elevated animate-slide-down">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="text-sm opacity-90">
              {activeOrdersCount > 0 ? `${activeOrdersCount} active order${activeOrdersCount !== 1 ? 's' : ''}` : 'No active orders'}
            </p>
          </div>
          <button
            onClick={loadOrders}
            className="p-2 hover:bg-white/10 rounded-full active:scale-95 transition-all"
            disabled={loading}
            title="Refresh orders"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/80" size={18} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-md text-neutral-text-primary bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white focus:bg-white shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-text-secondary hover:text-primary transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(['all', 'active', 'completed', 'cancelled'] as OrderFilter[]).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === filterType
                  ? 'bg-white text-primary shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sort and Filter Options */}
      <div className="p-4 pb-2 flex items-center justify-between gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-neutral-text-primary text-sm font-medium"
        >
          <Filter size={16} />
          <span>Sort</span>
          <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {filteredAndSortedOrders.length > 0 && (
          <span className="text-sm text-neutral-text-secondary">
            {filteredAndSortedOrders.length} order{filteredAndSortedOrders.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Sort Dropdown */}
      {showFilters && (
        <div className="px-4 pb-2 animate-slide-down">
          <div className="bg-white rounded-lg p-3 shadow-md">
            <label className="block text-xs font-semibold text-neutral-text-secondary mb-2">Sort by</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'recent', label: 'Most Recent' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'amount', label: 'Amount (High to Low)' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value as typeof sortBy);
                    setShowFilters(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    sortBy === option.value
                      ? 'bg-primary text-white'
                      : 'bg-neutral-background text-neutral-text-primary hover:bg-primary-light'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-md h-32 skeleton" />
            ))}
          </div>
        ) : filteredAndSortedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-6">
              <Receipt size={48} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-neutral-text-primary mb-2">
              {searchQuery ? 'No orders found' : 'No orders yet'}
            </h2>
            <p className="text-neutral-text-secondary mb-6 text-center">
              {searchQuery
                ? `No orders match "${searchQuery}". Try a different search.`
                : 'Start ordering from your favorite restaurants!'}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="gradient-primary text-white px-6 py-3 rounded-md font-semibold shadow-md hover-lift"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => router.push('/')}
                className="gradient-primary text-white px-6 py-3 rounded-md font-semibold shadow-md hover-lift"
              >
                Browse Restaurants
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedOrders.map((order, index) => {
              const isCompleted = ['completed', 'delivered'].includes(order.status.toLowerCase());
              const isCancelled = order.status.toLowerCase() === 'cancelled';
              const isActive = !isCompleted && !isCancelled;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-md p-4 shadow-md hover-lift transition-all animate-slide-up"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-neutral-text-primary">
                          Order #{String(order.id).slice(-8)}
                        </p>
                        {order.restaurantName && (
                          <span className="text-xs bg-secondary-light text-secondary px-2 py-0.5 rounded-full">
                            {order.restaurantName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-text-secondary">{formatDate(order.createdAt)}</p>
                    </div>
                    <OrderStatus status={order.status} />
                  </div>

                  {/* Order Items */}
                  <div className="space-y-1 mb-3">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-text-primary">
                          <span className="font-semibold text-primary">{item.quantity}x</span> {item.name}
                        </span>
                        <span className="text-neutral-text-secondary font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <p className="text-xs text-neutral-text-secondary pt-1">
                        +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Order Summary */}
                  {(order.subtotal || order.discount || order.deliveryFee || order.tax) && (
                    <div className="bg-neutral-background p-2 rounded-md mb-3 text-xs space-y-1">
                      {order.subtotal && (
                        <div className="flex justify-between">
                          <span className="text-neutral-text-secondary">Subtotal:</span>
                          <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                        </div>
                      )}
                      {order.discount && order.discount > 0 && (
                        <div className="flex justify-between text-status-success">
                          <span>Discount{order.promoCode ? ` (${order.promoCode})` : ''}:</span>
                          <span className="font-medium">-{formatCurrency(order.discount)}</span>
                        </div>
                      )}
                      {order.deliveryFee && (
                        <div className="flex justify-between">
                          <span className="text-neutral-text-secondary">Delivery:</span>
                          <span className="font-medium">{formatCurrency(order.deliveryFee)}</span>
                        </div>
                      )}
                      {order.tax && (
                        <div className="flex justify-between">
                          <span className="text-neutral-text-secondary">Tax:</span>
                          <span className="font-medium">{formatCurrency(order.tax)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-border gap-2">
                    <div className="flex-1">
                      <span className="font-bold text-lg text-primary block">{formatCurrency(order.total)}</span>
                      {order.deliveryAddress && (
                        <p className="text-xs text-neutral-text-secondary mt-1 truncate">{order.deliveryAddress}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReOrder(order);
                          }}
                          className="flex items-center gap-1 px-3 py-2 bg-secondary text-white rounded-md text-sm font-medium hover:bg-secondary-hover transition-all active:scale-95"
                        >
                          <RotateCcw size={16} />
                          <span>Re-order</span>
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/track/${order.id}`)}
                        className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-all active:scale-95"
                      >
                        {isActive ? 'Track' : 'Details'}
                      </button>
                      {(order.status === 'completed' || order.status === 'delivered') && (
                        <button
                          onClick={() => router.push(`/reviews/new?orderId=${order.id}`)}
                          className="px-4 py-2 border border-primary text-primary rounded-md text-sm font-medium hover:bg-primary-light transition-all active:scale-95 flex items-center gap-2"
                        >
                          <Star size={16} />
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
