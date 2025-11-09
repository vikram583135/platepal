'use client';

import { Phone, Navigation, ArrowRight, Clock, MapPin } from 'lucide-react';

interface NavigationOverlayProps {
  nextTurn?: string;
  remainingTime?: string;
  remainingDistance?: string;
  onCallCustomer?: () => void;
  onCallRestaurant?: () => void;
  onNavigate?: () => void;
  destination?: string;
  className?: string;
}

export default function NavigationOverlay({
  nextTurn,
  remainingTime,
  remainingDistance,
  onCallCustomer,
  onCallRestaurant,
  onNavigate,
  destination,
  className = '',
}: NavigationOverlayProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Top Overlay - Next Turn */}
      {nextTurn && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-black/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl min-w-[280px] max-w-[90vw]">
            <div className="flex items-center gap-3">
              <ArrowRight size={32} className="text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/70 mb-1">Next Turn</p>
                <p className="text-xl font-bold leading-tight">{nextTurn}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Overlay - Remaining Time & Distance */}
      {(remainingTime || remainingDistance) && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-black/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-4">
              {remainingTime && (
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  <div>
                    <p className="text-xs font-medium text-white/70">Time</p>
                    <p className="text-2xl font-bold">{remainingTime}</p>
                  </div>
                </div>
              )}
              {remainingDistance && (
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-primary" />
                  <div>
                    <p className="text-xs font-medium text-white/70">Distance</p>
                    <p className="text-2xl font-bold">{remainingDistance}</p>
                  </div>
                </div>
              )}
            </div>
            {destination && (
              <p className="text-xs text-white/70 mt-2 text-center">{destination}</p>
            )}
          </div>
        </div>
      )}

      {/* Bottom Right - Action Buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3 pointer-events-auto">
        {/* Call Customer Button */}
        {onCallCustomer && (
          <button
            onClick={onCallCustomer}
            className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-2xl hover:shadow-2xl-glow transition-all active:scale-95 touch-target-large"
            aria-label="Call customer"
            title="Call customer"
          >
            <Phone size={24} className="text-white" />
          </button>
        )}

        {/* Call Restaurant Button */}
        {onCallRestaurant && (
          <button
            onClick={onCallRestaurant}
            className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center shadow-2xl hover:shadow-2xl-glow transition-all active:scale-95 touch-target-large"
            aria-label="Call restaurant"
            title="Call restaurant"
          >
            <Phone size={24} className="text-white" />
          </button>
        )}

        {/* Navigate Button */}
        {onNavigate && (
          <button
            onClick={onNavigate}
            className="w-14 h-14 bg-success rounded-full flex items-center justify-center shadow-2xl hover:shadow-2xl-glow transition-all active:scale-95 touch-target-large"
            aria-label="Start navigation"
            title="Start navigation"
          >
            <Navigation size={24} className="text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

