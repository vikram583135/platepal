'use client';

import { ReactNode } from 'react';
import { Sparkles, TrendingUp, Clock, Heart, Star } from 'lucide-react';

interface PersonalizedSectionProps {
  title: string;
  reason: string;
  icon?: 'sparkles' | 'trending' | 'clock' | 'heart' | 'star';
  children: ReactNode;
}

const iconMap = {
  sparkles: Sparkles,
  trending: TrendingUp,
  clock: Clock,
  heart: Heart,
  star: Star,
};

export default function PersonalizedSection({ 
  title, 
  reason, 
  icon = 'sparkles',
  children 
}: PersonalizedSectionProps) {
  const IconComponent = iconMap[icon];

  return (
    <div className="mb-6 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-md">
          <IconComponent size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-neutral-text-primary">{title}</h2>
          <p className="text-sm text-neutral-text-secondary">{reason}</p>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

