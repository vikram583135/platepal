'use client';

import { useState, useEffect, useMemo } from 'react';
import { SupportTicket } from '@/store/types';
import { analyzeTicket, SentimentResult, TICKET_CATEGORIES } from '@/lib/sentiment-analysis';
import Badge from './ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface TicketInboxProps {
  tickets: SupportTicket[];
  onSelectTicket: (ticket: SupportTicket) => void;
  onBulkAction?: (ticketIds: string[], action: string) => void;
  currentAdminId: string;
}

interface TicketWithSentiment extends SupportTicket {
  sentiment?: SentimentResult;
}

export default function TicketInbox({
  tickets,
  onSelectTicket,
  onBulkAction,
  currentAdminId,
}: TicketInboxProps) {
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [ticketsWithSentiment, setTicketsWithSentiment] = useState<TicketWithSentiment[]>([]);
  const [loading, setLoading] = useState(true);

  // Analyze tickets on mount
  useEffect(() => {
    analyzeTickets();
  }, [tickets]);

  const analyzeTickets = async () => {
    setLoading(true);
    try {
      const analyzed = await Promise.all(
        tickets.map(async (ticket) => {
          const sentiment = await analyzeTicket(
            ticket.description,
            ticket.subject
          );
          return { ...ticket, sentiment };
        })
      );
      setTicketsWithSentiment(analyzed);
    } catch (error) {
      console.error('Error analyzing tickets:', error);
      setTicketsWithSentiment(tickets.map(t => ({ ...t })));
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return ticketsWithSentiment.filter((ticket) => {
      // Status filter
      if (filter !== 'all' && ticket.status !== filter) return false;

      // Category filter
      if (categoryFilter !== 'all' && ticket.category !== categoryFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;

      // Sentiment filter
      if (sentimentFilter !== 'all' && ticket.sentiment?.sentiment !== sentimentFilter) return false;

      // Search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !ticket.subject.toLowerCase().includes(searchLower) &&
          !ticket.description.toLowerCase().includes(searchLower) &&
          !ticket.createdBy.name.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [ticketsWithSentiment, filter, categoryFilter, priorityFilter, sentimentFilter, searchTerm]);

  const toggleTicketSelection = (ticketId: string) => {
    setSelectedTickets((prev) => {
      const next = new Set(prev);
      if (next.has(ticketId)) {
        next.delete(ticketId);
      } else {
        next.add(ticketId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTickets.size === filteredTickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(filteredTickets.map((t) => t.id)));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedTickets.size === 0) {
      toast.error('Please select tickets first');
      return;
    }
    if (onBulkAction) {
      onBulkAction(Array.from(selectedTickets), action);
    }
    setSelectedTickets(new Set());
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="error">Urgent</Badge>;
      case 'high':
        return <Badge variant="error">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'low':
        return <Badge variant="neutral">Low</Badge>;
      default:
        return <Badge variant="neutral">{priority}</Badge>;
    }
  };

  const getSentimentBadge = (sentiment?: SentimentResult) => {
    if (!sentiment) return null;
    switch (sentiment.sentiment) {
      case 'positive':
        return <Badge variant="success">Positive</Badge>;
      case 'negative':
        return <Badge variant="error">Negative</Badge>;
      case 'neutral':
        return <Badge variant="neutral">Neutral</Badge>;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'border-l-yellow-500';
      case 'in_progress':
        return 'border-l-blue-500';
      case 'resolved':
        return 'border-l-green-500';
      case 'closed':
        return 'border-l-gray-500';
      default:
        return 'border-l-gray-300';
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevated">
      {/* Header with Filters */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedTickets.size === filteredTickets.length && filteredTickets.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
            />
            <h2 className="text-xl font-semibold text-text-primary">Support Tickets</h2>
            {selectedTickets.size > 0 && (
              <span className="text-sm text-text-secondary">
                ({selectedTickets.size} selected)
              </span>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedTickets.size > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('assign')}
                className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Assign
              </button>
              <button
                onClick={() => handleBulkAction('close')}
                className="px-3 py-1.5 text-sm bg-error text-white rounded-lg hover:bg-error/90"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <ChatBubbleLeftRightIcon className="absolute left-3 top-2.5 h-5 w-5 text-text-secondary" />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1.5 border border-border rounded-lg bg-background text-text-primary text-sm"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 border border-border rounded-lg bg-background text-text-primary text-sm"
            >
              <option value="all">All Categories</option>
              {TICKET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 border border-border rounded-lg bg-background text-text-primary text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Sentiment Filter */}
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="px-3 py-1.5 border border-border rounded-lg bg-background text-text-primary text-sm"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="divide-y divide-border">
        {loading ? (
          <div className="p-8 text-center text-text-secondary">Analyzing tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tickets found</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`border-l-4 ${getStatusColor(ticket.status)} hover:bg-background transition-colors cursor-pointer`}
                onClick={() => onSelectTicket(ticket)}
              >
                <div className="p-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedTickets.has(ticket.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleTicketSelection(ticket.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-text-primary truncate">
                            {ticket.subject}
                          </h3>
                          {getPriorityBadge(ticket.priority)}
                          {getSentimentBadge(ticket.sentiment)}
                          {ticket.sentiment?.category && (
                            <Badge variant="info">
                              <SparklesIcon className="h-3 w-3 mr-1" />
                              {ticket.sentiment.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>
                      <div className="text-xs text-text-secondary whitespace-nowrap">
                        {format(new Date(ticket.createdAt), 'MMM d, HH:mm')}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-text-secondary mt-2">
                      <span>{ticket.createdBy.name}</span>
                      <span>•</span>
                      <span className="capitalize">{ticket.category}</span>
                      {ticket.assignedTo && (
                        <>
                          <span>•</span>
                          <span>Assigned to {ticket.assignedTo.name}</span>
                        </>
                      )}
                      {ticket.messages && ticket.messages.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
