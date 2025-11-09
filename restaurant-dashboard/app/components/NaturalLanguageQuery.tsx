'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Send, Loader2, Sparkles } from 'lucide-react';
import { processNaturalLanguageQuery, type NaturalLanguageQueryResponse } from '@/app/services/ai.service';
import { getRestaurantId } from '@/app/services/restaurant.service';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface NaturalLanguageQueryProps {
  onResult?: (result: NaturalLanguageQueryResponse) => void;
  dataContext?: any;
}

export default function NaturalLanguageQuery({ onResult, dataContext }: NaturalLanguageQueryProps) {
  const [query, setQuery] = useState('');
  const [restaurantId, setRestaurantId] = React.useState<number | null>(null);
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

  React.useEffect(() => {
    getRestaurantId().then(setRestaurantId);
  }, []);

  const { data, isLoading, error } = useQuery<NaturalLanguageQueryResponse>({
    queryKey: ['nl-query', submittedQuery, restaurantId],
    queryFn: () => processNaturalLanguageQuery(submittedQuery!, restaurantId!, dataContext),
    enabled: !!submittedQuery && !!restaurantId,
  });

  React.useEffect(() => {
    if (data && onResult) {
      onResult(data);
    }
  }, [data, onResult]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }
    if (!restaurantId) {
      toast.error('Restaurant ID not available');
      return;
    }
    setSubmittedQuery(query.trim());
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question... e.g., 'Compare weekend sales vs weekday sales this month'"
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-6 gradient-primary text-white hover-lift"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Send size={18} className="mr-2" />
              <span>Ask</span>
            </>
          )}
        </Button>
      </form>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-sm text-error">
          Failed to process query. Please try again.
        </div>
      )}

      {data && submittedQuery && (
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 shadow-soft border border-primary/20">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-secondary mb-1">Your Question:</p>
              <p className="text-text-primary font-medium">{submittedQuery}</p>
            </div>
          </div>
          <div className="bg-background/50 rounded-lg p-4">
            <p className="text-text-primary whitespace-pre-wrap">{data.answer}</p>
          </div>
          {data.visualization && (
            <div className="mt-4 text-sm text-text-secondary">
              <span className="font-medium">Suggested visualization:</span> {data.visualization} chart
            </div>
          )}
        </div>
      )}
    </div>
  );
}

