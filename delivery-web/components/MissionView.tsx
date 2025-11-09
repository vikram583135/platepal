'use client';

import { DeliveryTask } from '@/lib/store';
import { Navigation, Package, MapPin, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export type MissionState = 'navigate' | 'pickup' | 'delivery';

interface MissionViewProps {
  task: DeliveryTask;
  missionState: MissionState;
  onNavigate?: () => void;
  onCall?: () => void;
  onComplete?: () => void;
  estimatedTime?: string;
  className?: string;
}

export default function MissionView({
  task,
  missionState,
  onNavigate,
  onCall,
  onComplete,
  estimatedTime,
  className = '',
}: MissionViewProps) {
  const getMissionConfig = () => {
    switch (missionState) {
      case 'navigate':
        return {
          title: 'Drive to Restaurant',
          subtitle: task.restaurantName,
          address: task.pickupAddress,
          icon: Navigation,
          iconColor: 'text-primary',
          bgColor: 'bg-primary',
          actionLabel: 'Start Navigation',
          actionIcon: Navigation,
          primaryAction: onNavigate,
        };
      case 'pickup':
        return {
          title: 'Pick up Order',
          subtitle: `Order #${task.orderId.slice(-6)}`,
          address: task.pickupAddress,
          icon: Package,
          iconColor: 'text-warning',
          bgColor: 'bg-warning',
          actionLabel: 'Mark as Picked Up',
          actionIcon: CheckCircle,
          primaryAction: onComplete,
        };
      case 'delivery':
        return {
          title: 'Deliver to Customer',
          subtitle: task.customerName || 'Customer',
          address: task.deliveryAddress,
          icon: MapPin,
          iconColor: 'text-success',
          bgColor: 'bg-success',
          actionLabel: 'Mark as Delivered',
          actionIcon: CheckCircle,
          primaryAction: onComplete,
        };
      default:
        return null;
    }
  };

  const config = getMissionConfig();
  if (!config) return null;

  const MissionIcon = config.icon;
  const ActionIcon = config.actionIcon;

  return (
    <div
      className={`min-h-screen flex flex-col ${className}`}
      style={{
        backgroundColor: '#000000',
        color: '#FFFFFF',
      }}
    >
      {/* Mission Header - High Contrast */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        {/* Large Icon */}
        <div
          className={`w-32 h-32 ${config.bgColor} rounded-full flex items-center justify-center mb-8 shadow-2xl animate-scale-in`}
          style={{
            backgroundColor: missionState === 'navigate' ? '#00B894' : 
                           missionState === 'pickup' ? '#FDCB6E' : '#00B894',
          }}
          aria-hidden="true"
        >
          <MissionIcon size={64} className="text-white" />
        </div>

        {/* Mission Title - Extra Large */}
        <h1
          className="text-6xl font-bold mb-6 leading-tight"
          style={{
            color: '#FFFFFF',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          {config.title}
        </h1>

        {/* Subtitle - Large */}
        <h2
          className="text-4xl font-semibold mb-4 text-white/90"
          style={{
            color: '#FFFFFF',
            opacity: 0.9,
          }}
        >
          {config.subtitle}
        </h2>

        {/* Address - Large, Readable */}
        <div className="mt-8 max-w-2xl">
          <p
            className="text-2xl font-medium text-white/80 leading-relaxed"
            style={{
              color: '#FFFFFF',
              opacity: 0.8,
            }}
          >
            {config.address}
          </p>
        </div>

        {/* Estimated Time - If Available */}
        {estimatedTime && (
          <div className="mt-6 flex items-center gap-3">
            <Clock size={28} className="text-white/70" />
            <span className="text-3xl font-semibold text-white/90">{estimatedTime}</span>
          </div>
        )}

        {/* Earnings Display - Only for Delivery */}
        {missionState === 'delivery' && (
          <div className="mt-8">
            <div
              className="px-8 py-4 rounded-2xl"
              style={{
                backgroundColor: '#00B894',
              }}
            >
              <p className="text-sm font-medium text-white/80 mb-1">Earnings</p>
              <p className="text-4xl font-bold text-white">
                {formatCurrency(task.total * 0.15)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Large, Touch-Friendly */}
      <div className="px-6 pb-8 space-y-4">
        {/* Primary Action Button */}
        <button
          onClick={config.primaryAction}
          className="w-full py-6 rounded-2xl font-bold text-3xl flex items-center justify-center gap-4 transition-all active:scale-95"
          style={{
            backgroundColor: missionState === 'navigate' ? '#00B894' :
                           missionState === 'pickup' ? '#FDCB6E' : '#00B894',
            color: '#FFFFFF',
            minHeight: '72px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
          aria-label={config.actionLabel}
        >
          <ActionIcon size={32} />
          <span>{config.actionLabel}</span>
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-4">
          {/* Call Button */}
          {onCall && (
            <button
              onClick={onCall}
              className="py-5 rounded-xl font-semibold text-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                backgroundColor: '#2D3436',
                color: '#FFFFFF',
                minHeight: '64px',
              }}
              aria-label="Call"
            >
              <span className="text-2xl">📞</span>
              <span>Call</span>
            </button>
          )}

          {/* Navigation Button (if not primary) */}
          {missionState !== 'navigate' && onNavigate && (
            <button
              onClick={onNavigate}
              className="py-5 rounded-xl font-semibold text-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                backgroundColor: '#2D3436',
                color: '#FFFFFF',
                minHeight: '64px',
              }}
              aria-label="Navigate"
            >
              <Navigation size={24} />
              <span>Navigate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

