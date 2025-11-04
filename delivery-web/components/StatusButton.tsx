'use client';

import { useState } from 'react';
import { CheckCircle, Package, Truck, Loader2 } from 'lucide-react';

interface StatusButtonProps {
  label: string;
  status: string;
  currentStatus: string;
  onClick: () => void;
  disabled?: boolean;
  description?: string;
}

export default function StatusButton({ label, status, currentStatus, onClick, disabled, description }: StatusButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isCompleted = getStatusIndex(currentStatus) > getStatusIndex(status);
  const isCurrent = currentStatus === status;
  const isNext = getStatusIndex(currentStatus) + 1 === getStatusIndex(status);
  const isActive = isCurrent || isNext;

  const getIcon = () => {
    switch (status) {
      case 'ready':
        return Package;
      case 'picked_up':
        return Truck;
      case 'delivered':
        return CheckCircle;
      default:
        return Package;
    }
  };

  const Icon = getIcon();

  const handleClick = async () => {
    if (disabled || isCompleted || !isActive || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onClick();
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  // Calculate progress percentage
  const progress = isCompleted ? 100 : isCurrent ? 50 : isNext ? 0 : 0;

  return (
    <div className="relative">
      {/* Progress Ring */}
      {isActive && !isCompleted && (
        <div className="absolute -inset-1 rounded-xl bg-gradient-primary opacity-20 animate-pulse" />
      )}
      
      <button
        onClick={handleClick}
        disabled={disabled || isCompleted || !isActive || isProcessing}
        className={`relative w-full flex items-center justify-between p-5 rounded-xl font-bold text-lg transition-all duration-300 touch-target-large shadow-md group ${
          isCompleted
            ? 'bg-primary-light text-status-active cursor-not-allowed border-2 border-status-active'
            : isActive
            ? 'gradient-primary text-white hover:shadow-2xl-glow active:scale-[0.98] border-2 border-primary'
            : 'bg-neutral-background text-neutral-text-secondary cursor-not-allowed border-2 border-neutral-border opacity-50'
        }`}
        aria-label={label}
        aria-describedby={description ? `status-desc-${status}` : undefined}
        title={description}
      >
        <span className="flex items-center gap-3">
          {isProcessing ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <Icon size={24} className={`${isActive ? 'group-hover:scale-110' : ''} transition-transform`} />
          )}
          <div className="flex flex-col items-start">
            <span>{label}</span>
            {description && isActive && (
              <span id={`status-desc-${status}`} className="text-xs opacity-90 font-normal mt-0.5">
                {description}
              </span>
            )}
          </div>
        </span>
        
        {isCompleted && (
          <CheckCircle size={24} className="text-status-active animate-bounce-once" />
        )}
        
        {isProcessing && (
          <div className="spinner-sm" />
        )}
      </button>
    </div>
  );
}

function getStatusIndex(status: string): number {
  const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered'];
  return statuses.indexOf(status.toLowerCase());
}

