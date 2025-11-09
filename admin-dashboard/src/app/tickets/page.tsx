'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { checkAdminAuthStatus } from '@/store';
import { SupportTicket } from '@/store/types';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import TicketInbox from '@/components/TicketInbox';
import AIResponseAssistant from '@/components/AIResponseAssistant';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function TicketsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, adminUser } = useSelector((state: RootState) => state.auth);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    dispatch(checkAdminAuthStatus());
    fetchTickets();
  }, [dispatch]);

  const fetchTickets = async () => {
    try {
      const data = await apiClient.getSupportTickets();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // Fallback to mock data
      setTickets([
        {
          id: 'ticket-1',
          subject: 'Payment issue',
          description: 'I was charged twice for my order',
          category: 'billing',
          priority: 'high',
          status: 'open',
          createdBy: {
            id: 'customer-1',
            name: 'John Doe',
            email: 'john@example.com',
            type: 'customer',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: 'msg-1',
              ticketId: 'ticket-1',
              senderId: 'customer-1',
              senderName: 'John Doe',
              senderType: 'customer',
              message: 'I was charged twice for my order #12345',
              createdAt: new Date().toISOString(),
            },
          ],
        },
        {
          id: 'ticket-2',
          subject: 'Restaurant account problem',
          description: 'Cannot access my dashboard',
          category: 'account',
          priority: 'medium',
          status: 'in_progress',
          createdBy: {
            id: 'restaurant-1',
            name: 'Pizza Palace',
            email: 'pizza@example.com',
            type: 'restaurant',
          },
          assignedTo: {
            id: adminUser?.id || 'admin-1',
            name: adminUser?.name || 'Admin',
            email: adminUser?.email || 'admin@example.com',
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
        },
      ]);
    }
  };

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setTicketModalOpen(true);
    setNewMessage('');
  };

  const handleBulkAction = async (ticketIds: string[], action: string) => {
    try {
      if (action === 'assign') {
        // Assign tickets to current admin
        for (const ticketId of ticketIds) {
          await apiClient.assignTicket(ticketId, adminUser?.id || '');
        }
        toast.success(`${ticketIds.length} tickets assigned`);
      } else if (action === 'close') {
        // Close tickets
        for (const ticketId of ticketIds) {
          await apiClient.updateTicketStatus(ticketId, 'closed');
        }
        toast.success(`${ticketIds.length} tickets closed`);
      }
      fetchTickets();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      await apiClient.addTicketMessage(selectedTicket.id, {
        message: newMessage,
        senderId: adminUser?.id || '',
        senderType: 'admin',
      });
      toast.success('Message sent');
      setNewMessage('');
      fetchTickets();
      // Update selected ticket with new message
      const updatedTicket = tickets.find(t => t.id === selectedTicket.id);
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleUpdateStatus = async (status: SupportTicket['status']) => {
    if (!selectedTicket) return;

    try {
      await apiClient.updateTicketStatus(selectedTicket.id, status);
      toast.success(`Ticket ${status}`);
      setTickets(prev =>
        prev.map(t => (t.id === selectedTicket.id ? { ...t, status } : t))
      );
      setSelectedTicket({ ...selectedTicket, status });
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">Support Tickets</h1>
          <p className="text-text-secondary mt-1">AI-powered ticket management and response suggestions</p>
        </div>

        {/* Ticket Inbox */}
        <TicketInbox
          tickets={tickets}
          onSelectTicket={handleSelectTicket}
          onBulkAction={handleBulkAction}
          currentAdminId={adminUser?.id || ''}
        />

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <Modal
            isOpen={ticketModalOpen}
            onClose={() => {
              setTicketModalOpen(false);
              setSelectedTicket(null);
            }}
            title={selectedTicket.subject}
            size="xl"
          >
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="bg-background rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        selectedTicket.priority === 'urgent' || selectedTicket.priority === 'high'
                          ? 'error'
                          : selectedTicket.priority === 'medium'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {selectedTicket.priority}
                    </Badge>
                    <Badge
                      variant={
                        selectedTicket.status === 'open'
                          ? 'warning'
                          : selectedTicket.status === 'resolved'
                          ? 'success'
                          : selectedTicket.status === 'closed'
                          ? 'neutral'
                          : 'info'
                      }
                    >
                      {selectedTicket.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-text-secondary">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary">
                    {format(new Date(selectedTicket.createdAt), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-text-secondary">From:</span>
                    <span className="ml-2 text-text-primary font-medium">
                      {selectedTicket.createdBy.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Email:</span>
                    <span className="ml-2 text-text-primary">{selectedTicket.createdBy.email}</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                <h3 className="font-semibold text-text-primary">Conversation</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {/* Initial message */}
                  <div className="bg-background rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-text-primary">
                        {selectedTicket.createdBy.name}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {format(new Date(selectedTicket.createdAt), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <p className="text-text-secondary">{selectedTicket.description}</p>
                  </div>

                  {/* Thread messages */}
                  {selectedTicket.messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-4 ${
                        msg.senderType === 'admin'
                          ? 'bg-primary/10 ml-8'
                          : 'bg-background mr-8'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-text-primary">{msg.senderName}</span>
                        <span className="text-xs text-text-secondary">
                          {format(new Date(msg.createdAt), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      <p className="text-text-secondary">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Response Assistant */}
              <AIResponseAssistant
                ticket={selectedTicket}
                onUseResponse={(response) => setNewMessage(response)}
              />

              {/* Reply Section */}
              <div className="space-y-3 border-t border-border pt-4">
                <label className="block font-semibold text-text-primary">Reply</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your response..."
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={4}
                />

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus('in_progress')}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors text-sm"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('closed')}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      Close
                    </button>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}

