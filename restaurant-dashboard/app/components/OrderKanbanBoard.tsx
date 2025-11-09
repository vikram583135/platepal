'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Package, Truck, CheckCircle, AlertCircle, Sparkles, DollarSign, User } from 'lucide-react';
import { analyzeOrder, prioritizeOrders, type OrderAnalysis } from '@/app/services/ai.service';
import { getRestaurantId } from '@/app/services/restaurant.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatINR } from '@/lib/currency';
import { toast } from 'sonner';
import axios from 'axios';

interface Order {
  id: string;
  customer_name?: string;
  customerName?: string;
  order_date?: string;
  createdAt?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NEW' | 'PREPARING' | 'READY_FOR_PICKUP';
  total_amount?: number;
  totalPrice?: number;
  items: Array<{ id?: string; name: string; quantity: number; price: number }>;
  analysis?: OrderAnalysis;
}

interface OrderKanbanBoardProps {
  orders: Order[];
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
}

const updateOrderStatusAPI = async (orderId: string, status: string) => {
  const token = localStorage.getItem('accessToken');
  const { data } = await axios.patch(
    `http://localhost:3003/orders/${orderId}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export default function OrderKanbanBoard({ orders, onStatusUpdate }: OrderKanbanBoardProps) {
  const [restaurantId, setRestaurantId] = React.useState<number | null>(null);
  const [prioritizedOrders, setPrioritizedOrders] = React.useState<Order[]>([]);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    getRestaurantId().then(setRestaurantId);
  }, []);

  // Analyze and prioritize orders
  const { data: analyzedOrders, isLoading: analyzing } = useQuery({
    queryKey: ['order-analysis', orders.length, restaurantId],
    queryFn: async () => {
      if (!restaurantId || orders.length === 0) return [];
      
      // Analyze each order
      const analyzed = await Promise.all(
        orders.map(async (order) => {
          try {
            const analysis = await analyzeOrder(order, restaurantId);
            return { ...order, analysis };
          } catch (error) {
            return order;
          }
        })
      );

      // Prioritize orders
      try {
        const prioritized = await prioritizeOrders(analyzed, restaurantId);
        return prioritized;
      } catch (error) {
        return analyzed;
      }
    },
    enabled: !!restaurantId && orders.length > 0,
  });

  React.useEffect(() => {
    if (analyzedOrders) {
      setPrioritizedOrders(analyzedOrders);
    } else {
      setPrioritizedOrders(orders);
    }
  }, [analyzedOrders, orders]);

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatusAPI(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated');
    },
    onError: () => {
      toast.error('Failed to update order status');
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    statusMutation.mutate({ orderId, status: newStatus });
    if (onStatusUpdate) {
      onStatusUpdate(orderId, newStatus);
    }
  };

  const getStatusColumns = () => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      NEW: { label: 'New Orders', color: 'bg-info/10 border-info/20', icon: Package },
      PENDING: { label: 'Pending', color: 'bg-info/10 border-info/20', icon: Package },
      PREPARING: { label: 'Preparing', color: 'bg-accent/10 border-accent/20', icon: Clock },
      IN_PROGRESS: { label: 'In Progress', color: 'bg-accent/10 border-accent/20', icon: Clock },
      READY_FOR_PICKUP: { label: 'Ready', color: 'bg-success/10 border-success/20', icon: CheckCircle },
      COMPLETED: { label: 'Completed', color: 'bg-success/10 border-success/20', icon: CheckCircle },
    };

    return [
      { key: 'NEW', ...statusMap['NEW'] },
      { key: 'PENDING', ...statusMap['PENDING'] },
      { key: 'PREPARING', ...statusMap['PREPARING'] },
      { key: 'IN_PROGRESS', ...statusMap['IN_PROGRESS'] },
      { key: 'READY_FOR_PICKUP', ...statusMap['READY_FOR_PICKUP'] },
      { key: 'COMPLETED', ...statusMap['COMPLETED'] },
    ];
  };

  const getOrdersByStatus = (status: string) => {
    return prioritizedOrders.filter((order) => {
      const orderStatus = order.status?.toUpperCase();
      if (status === 'NEW') return orderStatus === 'NEW' || orderStatus === 'PENDING';
      if (status === 'PENDING') return orderStatus === 'PENDING';
      if (status === 'PREPARING') return orderStatus === 'PREPARING' || orderStatus === 'IN_PROGRESS';
      if (status === 'IN_PROGRESS') return orderStatus === 'IN_PROGRESS';
      if (status === 'READY_FOR_PICKUP') return orderStatus === 'READY_FOR_PICKUP';
      if (status === 'COMPLETED') return orderStatus === 'COMPLETED';
      return false;
    });
  };

  const getFlagColor = (flag: string) => {
    switch (flag) {
      case 'large':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'complex':
        return 'bg-accent/10 text-accent-dark border-accent/20';
      case 'high-priority':
      case 'vip':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-info/10 text-info border-info/20';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 70) return 'bg-error/10 text-error';
    if (priority >= 50) return 'bg-accent/10 text-accent-dark';
    return 'bg-info/10 text-info';
  };

  if (analyzing) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const columns = getStatusColumns();

  return (
    <div className="space-y-4">
      {/* Header with AI Priority Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={20} />
          <span className="text-sm font-semibold text-text-primary">AI-Powered Order Management</span>
        </div>
        <Badge className="bg-primary/10 text-primary">
          {prioritizedOrders.length} orders
        </Badge>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnOrders = getOrdersByStatus(column.key);
          const Icon = column.icon;

          return (
            <div
              key={column.key}
              className={`${column.color} rounded-lg p-4 min-w-[280px] border-2`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={18} />
                  <h3 className="font-semibold text-text-primary">{column.label}</h3>
                </div>
                <Badge className="bg-background/50">{columnOrders.length}</Badge>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {columnOrders.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary text-sm">
                    No orders
                  </div>
                ) : (
                  columnOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                      getFlagColor={getFlagColor}
                      getPriorityColor={getPriorityColor}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onStatusChange,
  getFlagColor,
  getPriorityColor,
}: {
  order: Order;
  onStatusChange: (orderId: string, status: string) => void;
  getFlagColor: (flag: string) => string;
  getPriorityColor: (priority: number) => string;
}) {
  const totalPrice = order.total_amount || order.totalPrice || 0;
  const customerName = order.customer_name || order.customerName || 'Customer';
  const itemCount = order.items?.length || 0;
  const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  const analysis = order.analysis;

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, string> = {
      NEW: 'PREPARING',
      PENDING: 'PREPARING',
      PREPARING: 'READY_FOR_PICKUP',
      IN_PROGRESS: 'READY_FOR_PICKUP',
      READY_FOR_PICKUP: 'COMPLETED',
    };
    return statusFlow[currentStatus.toUpperCase()] || currentStatus;
  };

  return (
    <div className="bg-surface rounded-lg p-4 shadow-soft border border-border hover-lift transition-all">
      {/* Order Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-text-primary text-sm">#{order.id.slice(-6)}</p>
          <p className="text-xs text-text-secondary">{customerName}</p>
        </div>
        {analysis && (
          <Badge className={`text-xs ${getPriorityColor(analysis.priority)}`}>
            Priority {analysis.priority}
          </Badge>
        )}
      </div>

      {/* AI Flags */}
      {analysis && analysis.flags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {analysis.flags.map((flag, index) => (
            <Badge key={index} className={`text-xs border ${getFlagColor(flag)}`}>
              {flag === 'large' && 'Large'}
              {flag === 'complex' && 'Complex'}
              {flag === 'high-priority' && 'High Priority'}
              {flag === 'vip' && 'VIP'}
            </Badge>
          ))}
        </div>
      )}

      {/* Order Details */}
      <div className="space-y-1 mb-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Items:</span>
          <span className="text-text-primary font-medium">{itemCount} ({totalQuantity} qty)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Total:</span>
          <span className="text-text-primary font-bold">{formatINR(totalPrice)}</span>
        </div>
        {analysis && (
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Est. Prep:</span>
            <span className="text-text-primary font-medium">{analysis.estimatedPrepTime} min</span>
          </div>
        )}
      </div>

      {/* AI Reasoning */}
      {analysis && analysis.reasoning && (
        <div className="bg-background/50 rounded p-2 mb-3 text-xs">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles size={12} className="text-primary" />
            <span className="font-semibold text-text-secondary">AI Insight:</span>
          </div>
          <p className="text-text-secondary line-clamp-2">{analysis.reasoning}</p>
        </div>
      )}

      {/* Action Button */}
      {order.status !== 'COMPLETED' && (
        <Button
          onClick={() => onStatusChange(order.id, getNextStatus(order.status))}
          className="w-full text-xs gradient-primary text-white hover-lift"
          size="sm"
        >
          {order.status === 'NEW' || order.status === 'PENDING' ? 'Start Preparing' :
           order.status === 'PREPARING' || order.status === 'IN_PROGRESS' ? 'Mark Ready' :
           order.status === 'READY_FOR_PICKUP' ? 'Complete' : 'Update'}
        </Button>
      )}
    </div>
  );
}

