'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { aiService } from '@/lib/ai-service';
import { apiClient } from '@/lib/api-client';
import { MagnifyingGlassIcon, SparklesIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface QueryHistory {
  id: string;
  query: string;
  timestamp: string;
  resultCount?: number;
}

interface NLQueryBarProps {
  onResults?: (results: any) => void;
  placeholder?: string;
}

export default function NLQueryBar({ onResults, placeholder = 'Ask anything... e.g., "Show me all one-star reviews from last week"' }: NLQueryBarProps) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [suggestions] = useState([
    'Show me all one-star reviews from last week',
    "What's the total revenue from Pizza Palace?",
    'List all pending restaurant approvals',
    'Show orders with delivery time over 45 minutes',
    'Find customers who ordered more than 10 times',
    'Display all high-priority support tickets',
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('nl_query_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load query history:', e);
      }
    }
  }, []);

  const saveToHistory = useCallback((query: string, resultCount?: number) => {
    const newEntry: QueryHistory = {
      id: Date.now().toString(),
      query,
      timestamp: new Date().toISOString(),
      resultCount,
    };

    const updatedHistory = [newEntry, ...history.slice(0, 9)]; // Keep last 10
    setHistory(updatedHistory);
    localStorage.setItem('nl_query_history', JSON.stringify(updatedHistory));
  }, [history]);

  const executeQuery = useCallback(async (queryText: string) => {
    if (!queryText.trim()) return;

    setIsProcessing(true);
    setShowHistory(false);

    try {
      // Convert NL query to API call using AI
      const nlResult = await aiService.naturalLanguageQuery(queryText);

      // Execute the API call
      let results = null;
      const apiCall = nlResult.apiCall.toLowerCase();
      const params = nlResult.parameters || {};

      if (apiCall.includes('orders')) {
        results = await apiClient.getOrders(params);
      } else if (apiCall.includes('restaurants')) {
        results = await apiClient.getRestaurants(params);
      } else if (apiCall.includes('customers')) {
        results = await apiClient.getCustomers(params);
      } else if (apiCall.includes('support-tickets') || apiCall.includes('tickets')) {
        results = await apiClient.getSupportTickets(params);
      } else if (apiCall.includes('analytics') || apiCall.includes('platform-health')) {
        results = await apiClient.getPlatformHealth();
      } else {
        toast.error('Unable to understand query. Please try rephrasing.');
        return;
      }

      const resultArray = Array.isArray(results) ? results : [results];
      saveToHistory(queryText, resultArray.length);

      onResults?.(resultArray);
      toast.success(`Found ${resultArray.length} result${resultArray.length !== 1 ? 's' : ''}`);

      setQuery('');
    } catch (error: any) {
      console.error('Query execution error:', error);
      toast.error(error.message || 'Failed to execute query. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [onResults, saveToHistory]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    executeQuery(query);
  }, [query, executeQuery]);

  const handleHistoryClick = useCallback((historyItem: QueryHistory) => {
    setQuery(historyItem.query);
    executeQuery(historyItem.query);
  }, [executeQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={historyRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 flex items-center pointer-events-none">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            ) : (
              <SparklesIcon className="h-5 w-5 text-text-secondary" />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowHistory(e.target.value.length === 0 && history.length > 0);
            }}
            onFocus={() => setShowHistory(history.length > 0 && query.length === 0)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-secondary"
            disabled={isProcessing}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-12 p-1 text-text-secondary hover:text-text-primary transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
          <button
            type="submit"
            disabled={isProcessing || !query.trim()}
            className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* History Dropdown */}
      <AnimatePresence>
        {showHistory && (history.length > 0 || suggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-lg shadow-elevated max-h-96 overflow-y-auto"
          >
            {history.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-secondary uppercase">
                  <ClockIcon className="h-4 w-4" />
                  Recent Queries
                </div>
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleHistoryClick(item)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-background transition-colors text-sm text-text-primary"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.query}</span>
                      {item.resultCount !== undefined && (
                        <span className="text-xs text-text-secondary ml-2">
                          {item.resultCount} results
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {query.length === 0 && suggestions.length > 0 && (
              <div className="p-2 border-t border-border">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-secondary uppercase">
                  <SparklesIcon className="h-4 w-4" />
                  Suggested Queries
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(suggestion);
                      executeQuery(suggestion);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-background transition-colors text-sm text-text-primary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
