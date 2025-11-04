'use client';

import { useRouter } from 'next/navigation';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const router = useRouter();

  const handleRetry = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-neutral-background flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-fade-in">
        {/* Icon */}
        <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <WifiOff size={48} className="text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-neutral-text-primary mb-3">
          You&apos;re Offline
        </h1>

        {/* Description */}
        <p className="text-neutral-text-secondary mb-8 leading-relaxed">
          It looks like you&apos;ve lost your internet connection. Please check your network and try again.
        </p>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          className="gradient-primary text-white px-8 py-4 rounded-md font-semibold shadow-md hover-lift ripple flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={20} />
          <span>Try Again</span>
        </button>

        {/* Tips */}
        <div className="mt-12 p-6 bg-white rounded-md shadow-md text-left">
          <h3 className="font-bold text-neutral-text-primary mb-3">Quick Tips:</h3>
          <ul className="space-y-2 text-sm text-neutral-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Check if your WiFi or mobile data is turned on</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Try switching between WiFi and mobile data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Make sure you&apos;re not in airplane mode</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Restart your device if the problem persists</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

