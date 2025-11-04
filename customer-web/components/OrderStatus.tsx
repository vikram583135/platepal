'use client';

import { CheckCircle, Clock, Package, Truck } from 'lucide-react';

interface OrderStatusProps {
  status: string;
}

export default function OrderStatus({ status }: OrderStatusProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Order Placed',
          color: 'text-amber-500',
          bg: 'bg-amber-50',
        };
      case 'confirmed':
        return {
          icon: CheckCircle,
          text: 'Confirmed',
          color: 'text-blue-500',
          bg: 'bg-blue-50',
        };
      case 'preparing':
        return {
          icon: Package,
          text: 'Preparing',
          color: 'text-purple-500',
          bg: 'bg-purple-50',
        };
      case 'ready':
        return {
          icon: CheckCircle,
          text: 'Ready for Pickup',
          color: 'text-green-500',
          bg: 'bg-green-50',
        };
      case 'picked_up':
        return {
          icon: Truck,
          text: 'Out for Delivery',
          color: 'text-indigo-500',
          bg: 'bg-indigo-50',
        };
      case 'delivered':
        return {
          icon: CheckCircle,
          text: 'Delivered',
          color: 'text-green-600',
          bg: 'bg-green-50',
        };
      default:
        return {
          icon: Clock,
          text: status,
          color: 'text-gray-500',
          bg: 'bg-gray-50',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${config.bg}`}>
      <Icon size={18} className={config.color} />
      <span className={`text-sm font-semibold ${config.color}`}>
        {config.text}
      </span>
    </div>
  );
}

