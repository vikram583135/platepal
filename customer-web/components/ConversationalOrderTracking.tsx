'use client';

import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Clock, Package, CheckCircle2, ChefHat, Bike } from 'lucide-react';
import { generateOrderStatusMessage } from '@/lib/ai-service';
import { Order } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface ConversationalOrderTrackingProps {
  order: Order;
  eta?: string;
  driverName?: string;
}

export default function ConversationalOrderTracking({
  order,
  eta,
  driverName,
}: ConversationalOrderTrackingProps) {
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateMessage();
  }, [order.status, eta, driverName]);

  const generateMessage = async () => {
    setIsLoading(true);
    try {
      const message = await generateOrderStatusMessage(order, order.status, eta);
      setStatusMessage(message);
    } catch (error) {
      console.error('Failed to generate status message:', error);
      setStatusMessage(getFallbackMessage());
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackMessage = (): string => {
    const status = order.status.toLowerCase();
    if (status === 'out_for_delivery' && driverName) {
      return `Your driver, ${driverName}, is on the way! ${eta ? `Arriving in about ${eta}` : 'Your order will arrive soon!'}`;
    }
    if (status === 'preparing') {
      return 'Your order is being prepared with care. We&apos;ll notify you when it&apos;s ready!';
    }
    if (status === 'confirmed') {
      return 'Your order has been confirmed and the restaurant is getting started!';
    }
    if (status === 'delivered') {
      return 'Your order has been delivered! Enjoy your meal! 🎉';
    }
    return `Your order status: ${order.status}`;
  };

  const getStatusIcon = () => {
    const status = order.status.toLowerCase();
    if (status === 'delivered' || status === 'completed') {
      return <CheckCircle2 size={24} className="text-success" />;
    }
    if (status === 'out_for_delivery') {
      return <Bike size={24} className="text-primary" />;
    }
    if (status === 'preparing' || status === 'confirmed') {
      return <ChefHat size={24} className="text-warning" />;
    }
    return <Package size={24} className="text-info" />;
  };

  const getStatusColor = () => {
    const status = order.status.toLowerCase();
    if (status === 'delivered' || status === 'completed') {
      return 'bg-success/10 text-success border-success/20';
    }
    if (status === 'out_for_delivery') {
      return 'bg-primary/10 text-primary border-primary/20';
    }
    if (status === 'preparing' || status === 'confirmed') {
      return 'bg-warning/10 text-warning border-warning/20';
    }
    return 'bg-info/10 text-info border-info/20';
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl p-6 mb-6 animate-slide-up border border-primary/10">
      {/* AI Status Message */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-neutral-text-secondary mb-1">AI Assistant</p>
          {isLoading ? (
            <div className="h-6 bg-neutral-background rounded animate-pulse" />
          ) : (
            <p className="text-base text-neutral-text-primary leading-relaxed">
              {statusMessage}
            </p>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor()} mb-4`}>
        {getStatusIcon()}
        <span className="font-semibold capitalize">{order.status.replace('_', ' ')}</span>
      </div>

      {/* Order Details */}
      <div className="space-y-3 text-sm">
        {order.restaurantName && (
          <div className="flex items-center gap-2 text-neutral-text-secondary">
            <Package size={16} />
            <span>From: <span className="font-semibold text-neutral-text-primary">{order.restaurantName}</span></span>
          </div>
        )}
        
        {order.deliveryAddress && (
          <div className="flex items-start gap-2 text-neutral-text-secondary">
            <MapPin size={16} className="mt-0.5 flex-shrink-0" />
            <span>Delivering to: <span className="font-semibold text-neutral-text-primary">{order.deliveryAddress}</span></span>
          </div>
        )}

        {eta && (
          <div className="flex items-center gap-2 text-neutral-text-secondary">
            <Clock size={16} />
            <span>Estimated arrival: <span className="font-semibold text-neutral-text-primary">{eta}</span></span>
          </div>
        )}

        <div className="flex items-center gap-2 text-neutral-text-secondary">
          <Clock size={16} />
          <span>Order placed: <span className="font-semibold text-neutral-text-primary">{formatDate(order.createdAt)}</span></span>
        </div>
      </div>

      {/* Proactive Alerts */}
      {order.status === 'preparing' && (
        <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-sm text-warning">
            💡 Tip: Your order is being prepared. We&apos;ll notify you if there are any delays!
          </p>
        </div>
      )}
    </div>
  );
}

