'use client';

import { 
  InboxIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  const defaultIcon = icon || <InboxIcon className="w-12 h-12 text-gray-400" />;

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="flex justify-center mb-4">
        {defaultIcon}
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary max-w-sm mx-auto mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function NoResultsFound({ searchTerm, onClearSearch }: { searchTerm: string; onClearSearch: () => void }) {
  return (
    <EmptyState
      icon={<MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />}
      title="No results found"
      description={`We couldn't find any results for "${searchTerm}". Try adjusting your search or filters.`}
      action={{
        label: 'Clear Search',
        onClick: onClearSearch,
      }}
    />
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<ExclamationCircleIcon className="w-12 h-12 text-error" />}
      title="Something went wrong"
      description={message}
      action={onRetry ? {
        label: 'Try Again',
        onClick: onRetry,
      } : undefined}
    />
  );
}

