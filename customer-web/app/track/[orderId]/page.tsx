'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService, Order } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import OrderStatus from '@/components/OrderStatus';
import ConversationalOrderTracking from '@/components/ConversationalOrderTracking';
import EmptyState from '@/components/EmptyState';
import { ArrowLeft, MapPin, Clock, Package, CheckCircle2, ChefHat, Bike, Home, Receipt, Wifi, WifiOff } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { initWebSocket, OrderEvent } from '@/lib/websocket';

export default function TrackOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const { token, user } = useAuthStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    loadOrder();

    // Initialize WebSocket for real-time updates
    // Use nginx proxy path for WebSocket or direct URL
    const USE_NGINX_PROXY = process.env.NEXT_PUBLIC_USE_NGINX_PROXY === 'true';
    const ORDER_URL = USE_NGINX_PROXY
      ? (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost/socket.io')
      : (process.env.NEXT_PUBLIC_ORDER_URL?.replace('http://', 'ws://').replace('https://', 'wss://') || 'ws://localhost:3003');
    const wsClient = initWebSocket(ORDER_URL, token, user?.id);

    // Check connection status
    const checkConnection = () => {
      setWsConnected(wsClient.isConnected());
    };
    setTimeout(checkConnection, 1000);

    // Subscribe to this specific order
    wsClient.subscribeToOrder(orderId);

    // Listen for order status changes
    const unsubscribeStatus = wsClient.on('order_status_changed', (event: OrderEvent) => {
      if (String(event.orderId) === String(orderId)) {
        setOrder((prev) => prev ? { ...prev, status: event.status || prev.status } : null);
        toast.success(`Order updated: ${event.status}`, {
          description: 'Your order status has been updated',
        });
      }
    });

    // Listen for delivery assignment
    const unsubscribeDelivery = wsClient.on('delivery_assigned', (event: OrderEvent) => {
      if (String(event.orderId) === String(orderId)) {
        toast.info('Delivery partner assigned', {
          description: 'Your order is on its way!',
        });
      }
    });

    // Listen for delivery picked up
    const unsubscribePickedUp = wsClient.on('delivery_picked_up', (event: OrderEvent) => {
      if (String(event.orderId) === String(orderId)) {
        setOrder((prev) => prev ? { ...prev, status: 'out_for_delivery' } : null);
        toast.success('Order picked up!', {
          description: 'Your order is out for delivery',
        });
      }
    });

    // Listen for delivery completed
    const unsubscribeDelivered = wsClient.on('order_delivered', (event: OrderEvent) => {
      if (String(event.orderId) === String(orderId)) {
        setOrder((prev) => prev ? { ...prev, status: 'delivered' } : null);
        toast.success('Order delivered!', {
          description: 'Your order has been delivered successfully',
        });
      }
    });

    // Listen for order cancellation
    const unsubscribeCancelled = wsClient.on('order_cancelled', (event: OrderEvent) => {
      if (String(event.orderId) === String(orderId)) {
        setOrder((prev) => prev ? { ...prev, status: 'cancelled' } : null);
        toast.error('Order cancelled', {
          description: 'This order has been cancelled',
        });
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeDelivery();
      unsubscribePickedUp();
      unsubscribeDelivered();
      unsubscribeCancelled();
      wsClient.unsubscribeFromOrder(orderId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, token]);

  const loadOrder = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const data = await apiService.getOrderById(orderId, token);
      setOrder(data);
    } catch (error) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Receipt, color: 'status-info', time: 'Just now' },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: 'status-success', time: '2 min ago' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, color: 'status-warning', time: '5 min ago' },
    { key: 'ready', label: 'Ready for Pickup', icon: Package, color: 'accent', time: '10 min ago' },
    { key: 'picked_up', label: 'Out for Delivery', icon: Bike, color: 'secondary', time: '15 min ago' },
    { key: 'delivered', label: 'Delivered', icon: Home, color: 'status-success', time: 'Delivered' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Package size={32} className="text-white" />
          </div>
          <p className="text-neutral-text-secondary">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-background flex items-center justify-center p-4">
        <EmptyState
          icon={<Package size={64} />}
          title="Order not found"
          description="We couldn't find this order. It may have been cancelled or doesn't exist."
          action={
            <button
              onClick={() => router.push('/orders')}
              className="gradient-primary text-white px-6 py-3 rounded-md font-semibold shadow-md hover-lift"
            >
              View All Orders
            </button>
          }
        />
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status.toLowerCase());

  return (
    <div className="min-h-screen bg-neutral-background pb-20">
      {/* Header */}
      <div className="bg-white shadow-elevated sticky top-0 z-40 animate-slide-down">
        <div className="flex items-center p-4">
          <button
            onClick={() => router.push('/orders')}
            className="p-2 hover:bg-primary-light rounded-full active:scale-95 transition-all"
          >
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <h1 className="text-lg font-bold text-neutral-text-primary flex-1 text-center">
            Track Order
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Order Header */}
        <div className="bg-white rounded-md p-6 shadow-md animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-neutral-text-primary">Order #{String(order.id).slice(-6)}</h2>
              <div className="flex items-center gap-2 text-sm text-neutral-text-secondary mt-1">
                <Clock size={14} />
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>
            {/* Conversational Order Tracking */}
            <ConversationalOrderTracking
              order={order}
              eta={currentStepIndex < statusSteps.length - 1 ? '10-15 minutes' : undefined}
              driverName="Alex"
            />
            
            <OrderStatus status={order.status} />
          </div>

          {/* Estimated Time */}
          {currentStepIndex < statusSteps.length - 1 && (
            <div className="mt-4 p-3 bg-secondary-light rounded-md">
              <p className="text-xs text-secondary font-semibold mb-1">ESTIMATED DELIVERY</p>
              <p className="text-lg font-bold text-secondary">15-20 minutes</p>
            </div>
          )}
        </div>

        {/* Animated Timeline */}
        <div className="bg-white rounded-md p-6 shadow-md animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="font-bold text-neutral-text-primary mb-6">Order Status</h3>
          
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-neutral-border" />
            
            {/* Active Progress Line */}
            <div 
              className="absolute left-5 top-0 w-0.5 bg-gradient-to-b from-status-success to-primary transition-all duration-1000"
              style={{ height: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            />

            {/* Steps */}
            <div className="space-y-6 relative">
              {statusSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isPending = index > currentStepIndex;
                
                return (
                  <div 
                    key={step.key} 
                    className={`flex items-start gap-4 relative animate-slide-up ${
                      isCurrent ? 'animate-pulse' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Icon Circle */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 ${
                      isCompleted 
                        ? `bg-${step.color} text-white shadow-md` 
                        : isCurrent
                        ? `gradient-${step.color.includes('status') ? 'primary' : step.color} text-white shadow-lg animate-bounce-once`
                        : 'bg-neutral-border text-neutral-text-secondary'
                    }`}>
                      <StepIcon size={20} strokeWidth={2.5} />
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1 pt-1">
                      <p className={`font-semibold mb-1 ${
                        isCurrent ? 'text-primary' : isCompleted ? 'text-neutral-text-primary' : 'text-neutral-text-secondary'
                      }`}>
                        {step.label}
                      </p>
                      {(isCompleted || isCurrent) && (
                        <p className="text-xs text-neutral-text-secondary">{step.time}</p>
                      )}
                    </div>
                    
                    {/* Checkmark */}
                    {isCompleted && (
                      <div className="w-6 h-6 rounded-full bg-status-success flex items-center justify-center animate-scale-in">
                        <CheckCircle2 size={16} className="text-white" fill="currentColor" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-md p-6 shadow-md animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="font-bold text-neutral-text-primary mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-neutral-border last:border-0">
                <div className="flex-1">
                  <span className="text-sm text-neutral-text-primary font-medium">
                    <span className="text-primary font-bold">{item.quantity}x</span> {item.name}
                  </span>
                </div>
                <span className="font-semibold text-neutral-text-primary">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-neutral-border mt-4 pt-4 flex justify-between">
            <span className="font-bold text-lg text-neutral-text-primary">Total</span>
            <span className="font-bold text-lg text-primary">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {order.status === 'delivered' && (
          <div className="bg-white rounded-md p-4 shadow-md animate-slide-up" style={{ animationDelay: '300ms' }}>
            <button
              onClick={() => router.push('/')}
              className="w-full gradient-primary text-white py-3 rounded-md font-semibold shadow-md hover-lift ripple"
            >
              Order Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


