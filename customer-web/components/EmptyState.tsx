import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="text-neutral-text-secondary mb-4 opacity-50">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-neutral-text-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-neutral-text-secondary text-sm mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

