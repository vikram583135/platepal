'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Clock, DollarSign, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { DeliveryTask } from '@/lib/store';
import { formatCurrency, formatTime } from '@/lib/utils';

interface TaskCardProps {
  task: DeliveryTask;
  onAccept?: (task: DeliveryTask) => void;
  onClick?: () => void;
}

export default function TaskCard({ task, onAccept, onClick }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  // Calculate urgency based on time since creation
  const getUrgency = () => {
    const createdAt = new Date(task.createdAt);
    const now = new Date();
    const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    if (minutesSinceCreation > 15) return 'urgent';
    if (minutesSinceCreation > 10) return 'high';
    return 'normal';
  };

  const urgency = getUrgency();
  const urgencyColor = {
    urgent: 'border-status-urgent bg-status-urgent/5',
    high: 'border-accent bg-accent/5',
    normal: 'border-neutral-border',
  }[urgency];

  const handleClick = () => {
    if (!isSwiping.current && onClick) {
      onClick();
    }
  };

  const handleAccept = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!onAccept || accepting) return;

    setAccepting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call delay
      onAccept(task);
    } catch (error) {
      setAccepting(false);
    }
  };

  // Swipe gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!onAccept) return;
    
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - touchStartX.current;
    
    if (Math.abs(deltaX) > 10) {
      isSwiping.current = true;
    }
    
    if (deltaX < 0 && Math.abs(deltaX) < 100) {
      setSwipeOffset(deltaX);
    }
  };

  const handleTouchEnd = (e?: React.TouchEvent) => {
    if (swipeOffset < -50 && onAccept) {
      if (e) {
        handleAccept(e);
      }
    }
    setSwipeOffset(0);
    setTimeout(() => {
      isSwiping.current = false;
    }, 100);
  };

  // Reset swipe on mouse events
  useEffect(() => {
    const handleMouseLeave = () => {
      setSwipeOffset(0);
    };
    if (cardRef.current) {
      cardRef.current.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        if (cardRef.current) {
          cardRef.current.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }
  }, []);

  const earnings = task.total * 0.15;
  const MAX_ADDRESS_LENGTH = 40;

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={onClick ? 0 : -1}
      aria-label={`Task from ${task.restaurantName}, earnings ${formatCurrency(earnings)}`}
      className={`bg-gradient-to-br from-neutral-surface to-white rounded-xl p-5 shadow-elevated border-2 ${urgencyColor} active:scale-[0.98] transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 animate-fade-in-up relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
      style={{
        transform: `translateX(${swipeOffset}px)`,
      }}
    >
      {/* Urgency Indicator */}
      {urgency === 'urgent' && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-status-urgent">
          <AlertCircle size={12} className="absolute -top-4 left-1 text-white" />
        </div>
      )}

      {/* Swipe Indicator */}
      {onAccept && swipeOffset < -30 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-bold text-sm animate-pulse">
          Swipe to accept →
        </div>
      )}

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-neutral-text-primary text-lg">{task.restaurantName}</h3>
            {urgency === 'urgent' && (
              <span className="text-xs bg-status-urgent text-white px-2 py-0.5 rounded-full font-semibold animate-pulse">
                Urgent
              </span>
            )}
            {urgency === 'high' && (
              <span className="text-xs bg-accent text-neutral-text-primary px-2 py-0.5 rounded-full font-semibold">
                Soon
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-text-secondary">Order #{task.orderId.slice(-6)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-status-active font-bold text-xl">
            <DollarSign size={20} />
            <span className="animate-fade-in">{formatCurrency(earnings)}</span>
          </div>
          <p className="text-xs text-neutral-text-secondary">Earnings</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-3 text-sm">
          <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
            <MapPin size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-neutral-text-primary mb-1">Pickup</p>
            <p className="text-neutral-text-secondary text-sm">
              {(task.pickupAddress || task.restaurantName).length > MAX_ADDRESS_LENGTH && !expanded
                ? `${(task.pickupAddress || task.restaurantName).substring(0, MAX_ADDRESS_LENGTH)}...`
                : task.pickupAddress || task.restaurantName}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <div className="w-11 h-11 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
            <MapPin size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-neutral-text-primary mb-1">Delivery</p>
            <p className="text-neutral-text-secondary text-sm">
              {(task.deliveryAddress || task.customerName).length > MAX_ADDRESS_LENGTH && !expanded
                ? `${(task.deliveryAddress || task.customerName).substring(0, MAX_ADDRESS_LENGTH)}...`
                : task.deliveryAddress || task.customerName}
            </p>
          </div>
          {((task.pickupAddress || task.restaurantName).length > MAX_ADDRESS_LENGTH ||
            (task.deliveryAddress || task.customerName).length > MAX_ADDRESS_LENGTH) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="text-primary hover:text-primary-hover transition-colors touch-target"
              aria-label={expanded ? 'Collapse addresses' : 'Expand addresses'}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t-2 border-neutral-border">
        <div className="flex items-center gap-2 text-sm">
          <Clock size={18} className="text-neutral-text-secondary" />
          <span className="font-medium text-neutral-text-secondary">{formatTime(task.createdAt)}</span>
        </div>
        {onAccept && (
          <button
            onClick={handleAccept}
            disabled={accepting}
            aria-label={`Accept task from ${task.restaurantName}`}
            aria-busy={accepting}
            className="gradient-primary text-white px-6 py-3 rounded-xl font-bold text-base active:scale-95 transition-all duration-300 touch-target-large shadow-md hover:shadow-glow disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
          >
            {accepting ? (
              <>
                <div className="spinner-sm" />
                <span>Accepting...</span>
              </>
            ) : (
              <span>Accept</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

