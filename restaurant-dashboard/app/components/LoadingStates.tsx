'use client';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface rounded-lg p-6 shadow-soft">
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 bg-background rounded-lg animate-pulse"></div>
              <div className="h-6 w-16 bg-background rounded-full animate-pulse"></div>
            </div>
            <div className="h-4 bg-background rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-8 bg-background rounded w-32 mb-4 animate-pulse"></div>
            <div className="h-1 bg-background rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-lg p-6 shadow-soft">
          <div className="h-6 w-48 bg-background rounded mb-4 animate-pulse"></div>
          <div className="h-80 bg-background rounded animate-pulse"></div>
        </div>
        <div className="bg-surface rounded-lg p-6 shadow-soft">
          <div className="h-6 w-48 bg-background rounded mb-4 animate-pulse"></div>
          <div className="h-80 bg-background rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-surface rounded-lg shadow-soft overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-border">
        <div className="h-6 w-48 bg-background rounded animate-pulse"></div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-background rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-background rounded w-1/3 animate-pulse"></div>
              <div className="h-3 bg-background rounded w-1/4 animate-pulse"></div>
            </div>
            <div className="h-6 w-20 bg-background rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-6 shadow-soft animate-fade-in">
      <div className="h-6 w-48 bg-background rounded mb-4 animate-pulse"></div>
      <div className="space-y-3">
        <div className="h-4 bg-background rounded w-full animate-pulse"></div>
        <div className="h-4 bg-background rounded w-5/6 animate-pulse"></div>
        <div className="h-4 bg-background rounded w-4/6 animate-pulse"></div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-6 shadow-soft animate-fade-in">
      <div className="h-6 w-48 bg-background rounded mb-6 animate-pulse"></div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-4 w-32 bg-background rounded mb-2 animate-pulse"></div>
            <div className="h-10 w-full bg-background rounded animate-pulse"></div>
          </div>
        ))}
        <div className="h-10 w-full bg-primary/20 rounded animate-pulse mt-6"></div>
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3 animate-fade-in">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-surface rounded-lg p-4 shadow-soft flex items-center gap-4">
          <div className="h-16 w-16 bg-background rounded-lg animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-background rounded w-2/3 animate-pulse"></div>
            <div className="h-3 bg-background rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="h-8 w-24 bg-background rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-surface-dark/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-surface rounded-lg p-8 shadow-floating flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-primary font-semibold">{message}</p>
      </div>
    </div>
  );
}

