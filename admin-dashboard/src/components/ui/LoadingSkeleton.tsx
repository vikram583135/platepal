'use client';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
}

export default function LoadingSkeleton({ className = '', count = 1, variant = 'rounded' }: LoadingSkeletonProps) {
  const variantClasses = {
    text: 'h-4',
    circular: 'rounded-full aspect-square',
    rectangular: 'w-full',
    rounded: 'rounded-lg w-full h-12',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`skeleton ${variantClasses[variant]} ${className}`}
          style={{ animationDelay: `${index * 100}ms` }}
        />
      ))}
    </>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <LoadingSkeleton key={colIndex} variant="rounded" className="flex-1 h-12" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-surface rounded-lg shadow-elevated p-6 animate-pulse">
      <div className="flex items-center space-x-4">
        <LoadingSkeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" className="w-3/4" />
          <LoadingSkeleton variant="text" className="w-1/2" />
        </div>
      </div>
    </div>
  );
}

