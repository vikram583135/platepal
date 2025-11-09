/**
 * Natural Language Query Hook
 * Processes NL queries and executes API calls
 */

import { useState, useCallback } from 'react';
import { aiService } from '@/lib/ai-service';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

interface QueryResult {
  query: string;
  results: any[];
  timestamp: string;
  apiCall: string;
}

export function useNLQuery() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  const executeQuery = useCallback(async (query: string) => {
    if (!query.trim()) {
      return { results: [], error: null };
    }

    setLoading(true);
    setLastQuery(query);

    try {
      // Convert NL query to API call
      const nlResult = await aiService.naturalLanguageQuery(query);

      // Execute API call
      let data = null;
      const apiCall = nlResult.apiCall.toLowerCase();
      const params = nlResult.parameters || {};

      if (apiCall.includes('orders')) {
        data = await apiClient.getOrders(params);
      } else if (apiCall.includes('restaurants')) {
        data = await apiClient.getRestaurants(params);
      } else if (apiCall.includes('customers')) {
        data = await apiClient.getCustomers(params);
      } else if (apiCall.includes('delivery-partners') || apiCall.includes('partners')) {
        data = await apiClient.getDeliveryPartners(params);
      } else if (apiCall.includes('support-tickets') || apiCall.includes('tickets')) {
        data = await apiClient.getSupportTickets(params);
      } else if (apiCall.includes('analytics') || apiCall.includes('platform-health')) {
        data = await apiClient.getPlatformHealth();
      } else if (apiCall.includes('fraud')) {
        data = await apiClient.getFraudAlerts();
      } else {
        throw new Error('Unable to understand query. Please try rephrasing.');
      }

      const resultArray = Array.isArray(data) ? data : [data];
      setResults(resultArray);

      return { results: resultArray, error: null, apiCall: nlResult.apiCall };
    } catch (error: any) {
      console.error('NL Query error:', error);
      const errorMessage = error.message || 'Failed to execute query. Please try again.';
      toast.error(errorMessage);
      setResults([]);
      return { results: [], error: errorMessage, apiCall: null };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setLastQuery(null);
  }, []);

  return {
    executeQuery,
    loading,
    results,
    lastQuery,
    clearResults,
  };
}
