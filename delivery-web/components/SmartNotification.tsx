'use client';

import { useState } from 'react';
import { X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { SmartNotification as SmartNotificationType } from '@/lib/store';

interface SmartNotificationProps {
  notification: SmartNotificationType;
  onDismiss?: (id: string) => void;
  onAction?: (notification: SmartNotificationType) => void;
  className?: string;
}

export default function SmartNotification({
  notification,
  onDismiss,
  onAction,
  className = '',
}: SmartNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) {
        onDismiss(notification.id);
      }
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'error':
        return <AlertCircle size={20} className="text-error" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-warning" />;
      case 'success':
        return <CheckCircle size={20} className="text-success" />;
      case 'info':
      default:
        return <Info size={20} className="text-info" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'error':
        return 'bg-error/10 border-error/30';
      case 'warning':
        return 'bg-warning/10 border-warning/30';
      case 'success':
        return 'bg-success/10 border-success/30';
      case 'info':
      default:
        return 'bg-info/10 border-info/30';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case 'error':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      case 'success':
        return 'text-success';
      case 'info':
      default:
        return 'text-info';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`rounded-xl p-4 border-2 shadow-elevated animate-fade-in-up ${getBgColor()} ${className}`}
      role="alert"
      aria-live={notification.priority === 'high' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-base ${getTextColor()} mb-1`}>
            {notification.message}
          </p>
          
          {notification.action && (
            <button
              onClick={() => onAction && onAction(notification)}
              className={`text-sm font-medium ${getTextColor()} hover:underline mt-2`}
              aria-label={`Action: ${notification.action}`}
            >
              {notification.action}
            </button>
          )}

          {/* Priority Badge */}
          {notification.priority === 'high' && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-error/20 text-error text-xs font-semibold rounded-full">
              High Priority
            </span>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors touch-target"
          aria-label="Dismiss notification"
        >
          <X size={18} className="text-neutral-text-secondary" />
        </button>
      </div>
    </div>
  );
}

