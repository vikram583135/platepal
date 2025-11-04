'use client';

import { useState, useEffect } from 'react';
import { Power, PowerOff, Zap } from 'lucide-react';
import { useAvailabilityStore, useEarningsStore } from '@/lib/store';
import { toast } from 'sonner';

export default function AvailabilityToggle() {
  const { isAvailable, toggleAvailability } = useAvailabilityStore();
  const { todayEarnings } = useEarningsStore();
  const [isToggling, setIsToggling] = useState(false);
  const [pulse, setPulse] = useState(false);

  // Pulse effect when available
  useEffect(() => {
    if (isAvailable) {
      const interval = setInterval(() => {
        setPulse(!pulse);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isAvailable, pulse]);

  const handleToggle = async () => {
    setIsToggling(true);
    // Add smooth transition delay
    await new Promise(resolve => setTimeout(resolve, 200));
    toggleAvailability();
    
    const message = isAvailable 
      ? 'You are now offline' 
      : `You are now available for deliveries! Today's earnings: ₹${todayEarnings.toFixed(2)}`;
    
    toast.success(message, {
      icon: isAvailable ? '👋' : '🚀',
      duration: 3000,
    });
    
    setIsToggling(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 touch-target-large shadow-xl overflow-hidden group ${
        isAvailable
          ? 'gradient-primary text-white hover:shadow-2xl-glow'
          : 'bg-secondary text-white hover:bg-secondary-hover'
      } ${isToggling ? 'opacity-70' : ''}`}
      aria-label={isAvailable ? 'Go offline' : 'Go online'}
    >
      {/* Animated background when available */}
      {isAvailable && (
        <div className={`absolute inset-0 bg-white/20 ${pulse ? 'animate-pulse' : ''}`} />
      )}
      
      <div className="relative z-10 flex items-center gap-3">
        {isToggling ? (
          <div className="spinner-sm" />
        ) : isAvailable ? (
          <Power size={24} className="group-hover:scale-110 transition-transform" />
        ) : (
          <PowerOff size={24} className="group-hover:scale-110 transition-transform" />
        )}
        <span className="flex items-center gap-2">
          {isAvailable ? 'Available' : 'Offline'}
          {isAvailable && (
            <Zap size={16} className="animate-pulse" />
          )}
        </span>
      </div>
    </button>
  );
}

