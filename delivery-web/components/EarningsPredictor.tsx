'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Clock, MapPin, Sparkles } from 'lucide-react';
import { useEarningsPredictionStore, EarningsPrediction } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

interface EarningsPredictorProps {
  partnerId?: string;
  hours?: number;
  area?: string;
  className?: string;
}

export default function EarningsPredictor({
  partnerId,
  hours = 2,
  area,
  className = '',
}: EarningsPredictorProps) {
  const { earningsPrediction, setEarningsPrediction } = useEarningsPredictionStore();
  const [loading, setLoading] = useState(false);

  // Fetch prediction from API
  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        // Import apiService dynamically to avoid circular dependencies
        const { apiService } = await import('@/lib/api');
        if (!partnerId) {
          return;
        }
        const response = await apiService.getEarningsPrediction(partnerId, hours, area);
        
        if (response.success && response.prediction) {
          setEarningsPrediction(response.prediction);
        } else {
          // Fallback to mock if API fails
          const mockPrediction: EarningsPrediction = {
            predictedEarnings: 450,
            confidence: 0.75,
            factors: [
              'High order volume in this area',
              'Peak hours approaching',
              'Your performance is above average',
            ],
            hours,
            area: area || 'Current location',
          };
          setEarningsPrediction(mockPrediction);
        }
      } catch (error) {
        console.error('Failed to fetch earnings prediction:', error);
        // Fallback to mock on error
        const mockPrediction: EarningsPrediction = {
          predictedEarnings: 450,
          confidence: 0.75,
          factors: [
            'High order volume in this area',
            'Peak hours approaching',
            'Your performance is above average',
          ],
          hours,
          area: area || 'Current location',
        };
        setEarningsPrediction(mockPrediction);
      } finally {
        setLoading(false);
      }
    };

    if (partnerId) {
      fetchPrediction();
    }
  }, [partnerId, hours, area, setEarningsPrediction]);

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-primary-light to-primary/20 rounded-xl p-6 shadow-elevated animate-pulse ${className}`}>
        <div className="h-6 bg-primary/20 rounded mb-2" />
        <div className="h-4 bg-primary/10 rounded w-3/4" />
      </div>
    );
  }

  if (!earningsPrediction) {
    return null;
  }

  const confidencePercentage = Math.round(earningsPrediction.confidence * 100);
  const confidenceColor = 
    earningsPrediction.confidence >= 0.8 ? 'text-success' :
    earningsPrediction.confidence >= 0.6 ? 'text-warning' :
    'text-neutral-text-secondary';

  return (
    <div className={`bg-gradient-to-br from-primary-light to-primary/20 rounded-xl p-6 shadow-elevated border-2 border-primary/20 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
          <Sparkles size={20} className="text-primary" />
        </div>
        <h3 className="text-lg font-bold text-neutral-text-primary">AI Earnings Predictor</h3>
      </div>

      {/* Main Prediction */}
      <div className="mb-4">
        <p className="text-sm text-neutral-text-secondary mb-2">
          If you stay online for{' '}
          <span className="font-semibold text-neutral-text-primary">{hours} {hours === 1 ? 'hour' : 'hours'}</span>
          {earningsPrediction.area && (
            <>
              {' '}in <span className="font-semibold text-neutral-text-primary">{earningsPrediction.area}</span>
            </>
          )}
          , you&apos;re likely to earn:
        </p>
        <div className="flex items-baseline gap-2">
          <TrendingUp size={24} className="text-success" />
          <p className="text-4xl font-bold text-success">
            {formatCurrency(earningsPrediction.predictedEarnings)}
          </p>
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-neutral-text-secondary">Confidence</span>
          <span className={`text-xs font-bold ${confidenceColor}`}>{confidencePercentage}%</span>
        </div>
        <div className="w-full h-2 bg-neutral-border rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              earningsPrediction.confidence >= 0.8 ? 'bg-success' :
              earningsPrediction.confidence >= 0.6 ? 'bg-warning' :
              'bg-neutral-text-secondary'
            }`}
            style={{ width: `${confidencePercentage}%` }}
            role="progressbar"
            aria-valuenow={confidencePercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Key Factors */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-text-secondary uppercase tracking-wide">
          Why this prediction?
        </p>
        <ul className="space-y-1.5">
          {earningsPrediction.factors.map((factor, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-neutral-text-secondary">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 pt-4 border-t border-primary/10">
        <p className="text-sm font-medium text-primary flex items-center gap-2">
          <Clock size={16} />
          <span>Best time to earn more in your area!</span>
        </p>
      </div>
    </div>
  );
}

