'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // In production, send to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate error tracking service
      // trackError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-background flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-elevated p-8 max-w-md w-full text-center animate-fade-in">
        <div className="w-16 h-16 bg-status-error bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-status-error" />
        </div>
        
        <h1 className="text-2xl font-bold text-neutral-text-primary mb-2">
          Something went wrong
        </h1>
        
        <p className="text-neutral-text-secondary mb-6">
          We&apos;re sorry, but something unexpected happened. Please try again.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left bg-neutral-background p-4 rounded-md">
            <summary className="cursor-pointer text-sm font-semibold text-neutral-text-primary mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="text-xs text-status-error overflow-auto">
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={onReset}
            className="gradient-primary text-white px-6 py-3 rounded-md font-semibold shadow-md hover-lift ripple transition-all flex items-center justify-center gap-2"
            aria-label="Try again"
          >
            <RefreshCw size={20} />
            Try Again
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="bg-neutral-surface border-2 border-neutral-border text-neutral-text-primary px-6 py-3 rounded-md font-semibold hover:bg-primary-light hover:bg-opacity-10 transition-all flex items-center justify-center gap-2"
            aria-label="Go to home page"
          >
            <Home size={20} />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

