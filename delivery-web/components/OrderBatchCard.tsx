'use client';

import { Package, Clock, MapPin, TrendingUp, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { DeliveryTask } from '@/lib/store';

interface OrderBatch {
  orders: DeliveryTask[];
  efficiencyScore: number;
  totalEarnings: number;
  estimatedTime: number;
  totalDistance: number;
  route: string[];
}

interface OrderBatchCardProps {
  batch: OrderBatch;
  onAccept: (batch: OrderBatch) => void;
  className?: string;
}

export default function OrderBatchCard({ batch, onAccept, className = '' }: OrderBatchCardProps) {
  const efficiencyPercentage = Math.min(100, Math.round((batch.efficiencyScore / 10) * 100));

  return (
    <div className={`bg-gradient-to-br from-neutral-surface to-primary-light/10 rounded-xl p-6 shadow-elevated border-2 border-primary/20 hover-lift animate-fade-in-up ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md">
            <Package size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-text-primary text-lg">
              Batch Delivery
            </h3>
            <p className="text-sm text-neutral-text-secondary">
              {batch.orders.length} {batch.orders.length === 1 ? 'order' : 'orders'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp size={16} className="text-success" />
            <span className="text-xs font-semibold text-success">
              {efficiencyPercentage}% Efficient
            </span>
          </div>
        </div>
      </div>

      {/* Earnings & Time */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-primary-light/20 rounded-lg p-3">
          <p className="text-xs text-neutral-text-secondary mb-1">Total Earnings</p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(batch.totalEarnings)}
          </p>
        </div>
        <div className="bg-secondary/10 rounded-lg p-3">
          <p className="text-xs text-neutral-text-secondary mb-1">Estimated Time</p>
          <div className="flex items-center gap-1">
            <Clock size={16} className="text-secondary" />
            <p className="text-2xl font-bold text-secondary">
              {Math.round(batch.estimatedTime)} min
            </p>
          </div>
        </div>
      </div>

      {/* Route Info */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-neutral-text-secondary">
          <MapPin size={14} />
          <span className="font-medium">Route: {batch.totalDistance.toFixed(1)} km</span>
        </div>
        <div className="text-xs text-neutral-text-secondary">
          {batch.orders.map((order, index) => (
            <div key={order.id} className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold text-xs">
                {index + 1}
              </span>
              <span>{order.restaurantName} → {order.customerName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Accept Button */}
      <button
        onClick={() => onAccept(batch)}
        className="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg touch-target-large shadow-xl hover:shadow-2xl-glow transition-all active:scale-95 flex items-center justify-center gap-2"
        aria-label={`Accept batch with ${batch.orders.length} orders`}
      >
        <CheckCircle size={20} />
        <span>Accept Batch</span>
      </button>
    </div>
  );
}

