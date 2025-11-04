'use client';

import { useState } from 'react';
import { SupportTicket } from '@/store/types';
import DataTable, { Column } from './DataTable';
import Modal from './Modal';
import { 
  ChatBubbleLeftRightIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface SupportTicketsProps {
  tickets: SupportTicket[];
  onUpdateStatus: (id: string, status: SupportTicket['status']) => void;
  onAssign: (id: string, adminId: string) => void;
  onAddMessage: (ticketId: string, message: string) => void;
  currentAdminId: string;
}

export default function SupportTickets({
  tickets,
  onUpdateStatus,
  onAssign,
  onAddMessage,
  currentAdminId,
}: SupportTicketsProps) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');

  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(ticket => ticket.status === filter);

  const getPriorityBadge = (priority: string) => {
    const priorityClasses: Record<string, string> = {
      urgent: 'badge-critical',
      high: 'badge-error',
      medium: 'badge-warning',
      low: 'badge-info',
    };
    return priorityClasses[priority] || 'bg-border text-text-secondary';
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, { badge: string; icon: any }> = {
      open: { badge: 'badge-warning', icon: ClockIcon },
      in_progress: { badge: 'badge-info', icon: ClockIcon },
      resolved: { badge: 'badge-success', icon: CheckCircleIcon },
      closed: { badge: 'bg-border text-text-secondary', icon: XCircleIcon },
    };
    return statusClasses[status] || { badge: 'bg-border text-text-secondary', icon: ClockIcon };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
    setNewMessage('');
  };

  const handleSendMessage = () => {
    if (selectedTicket && newMessage.trim()) {
      onAddMessage(selectedTicket.id, newMessage);
      setNewMessage('');
    }
  };

  const columns: Column<SupportTicket>[] = [
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center">
          <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-text-secondary" />
          <span className="font-medium text-text-primary">{String(value)}</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => (
        <span className="capitalize text-text-primary">{String(value)}</span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex ${getPriorityBadge(String(value))}`}>
          {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const { badge, icon: Icon } = getStatusBadge(String(value));
        return (
          <span className={`inline-flex items-center ${badge}`}>
            <Icon className="h-4 w-4 mr-1" />
            {String(value).replace('_', ' ').charAt(0).toUpperCase() + String(value).replace('_', ' ').slice(1)}
          </span>
        );
      },
    },
    {
      key: 'createdBy',
      label: 'Created By',
      sortable: true,
      render: (value: any) => (
        <div>
          <div className="text-sm text-text-primary">{value.name}</div>
          <div className="text-xs text-text-secondary">{value.type.replace('_', ' ')}</div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => <span className="text-text-secondary">{formatDate(String(value))}</span>,
      format: (value) => formatDate(String(value)),
    },
  ];

  return (
    <>
      <div className="bg-surface shadow-elevated rounded-lg animate-fade-in">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Support Tickets</h3>
              <p className="text-sm text-text-secondary mt-1">
                {tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length} active tickets
              </p>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-md border border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-surface text-text-primary px-3 py-2"
            >
              <option value="all">All Tickets</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <DataTable
            data={filteredTickets}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search tickets..."
            searchKeys={['subject', 'description']}
            exportable={true}
            exportFilename="support-tickets"
            pagination={true}
            itemsPerPage={10}
            onRowClick={handleViewTicket}
            emptyMessage="No tickets found"
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTicket(null);
          setNewMessage('');
        }}
        title={`Ticket #${selectedTicket?.id.slice(-8)} - ${selectedTicket?.subject}`}
        size="xl"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-text-secondary">Category</p>
                <p className="text-text-primary capitalize">{selectedTicket.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Priority</p>
                <span className={`inline-flex mt-1 ${getPriorityBadge(selectedTicket.priority)}`}>
                  {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Status</p>
                <span className={`inline-flex items-center mt-1 ${getStatusBadge(selectedTicket.status).badge}`}>
                  {selectedTicket.status.replace('_', ' ').charAt(0).toUpperCase() + selectedTicket.status.replace('_', ' ').slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Created By</p>
                <p className="text-text-primary">{selectedTicket.createdBy.name} ({selectedTicket.createdBy.type.replace('_', ' ')})</p>
              </div>
              {selectedTicket.assignedTo && (
                <div>
                  <p className="text-sm font-medium text-text-secondary">Assigned To</p>
                  <p className="text-text-primary">{selectedTicket.assignedTo.name}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-text-secondary">Created</p>
                <p className="text-text-primary">{formatDate(selectedTicket.createdAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-text-secondary mb-2">Description</p>
              <p className="text-text-primary bg-primary-light bg-opacity-10 p-3 rounded">{selectedTicket.description}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-text-secondary mb-2">Conversation</p>
              <div className="space-y-3 max-h-64 overflow-y-auto bg-primary-light bg-opacity-5 p-3 rounded">
                {selectedTicket.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded ${
                      message.senderType === 'admin'
                        ? 'bg-primary-light bg-opacity-20 ml-8'
                        : 'bg-surface mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-text-primary">{message.senderName}</span>
                      <span className="text-xs text-text-secondary">{formatDate(message.createdAt)}</span>
                    </div>
                    <p className="text-sm text-text-primary">{message.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <label className="block text-sm font-medium text-text-primary mb-2">Add Response</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your response..."
                className="w-full px-3 py-2 border border-border rounded-md bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                rows={3}
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send Message
                </button>
                {selectedTicket.status === 'open' && (
                  <button
                    onClick={() => onUpdateStatus(selectedTicket.id, 'in_progress')}
                    className="px-4 py-2 bg-info text-white rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Mark In Progress
                  </button>
                )}
                {selectedTicket.status === 'in_progress' && (
                  <button
                    onClick={() => onUpdateStatus(selectedTicket.id, 'resolved')}
                    className="px-4 py-2 bg-success text-white rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

