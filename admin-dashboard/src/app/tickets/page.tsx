'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { checkAdminAuthStatus } from '@/store';
import { SupportTicket } from '@/store/types';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import SupportTickets from '@/components/SupportTickets';
import { hasPermission } from '@/lib/rbac';

export default function TicketsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, adminUser } = useSelector((state: RootState) => state.auth);
  
  // Mock data - in production, this would come from the store/API
  const [tickets, setTickets] = useState<SupportTicket[]>([
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
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-2',
          ticketId: 'ticket-2',
          senderId: 'restaurant-1',
          senderName: 'Pizza Palace',
          senderType: 'restaurant',
          message: 'Cannot access my dashboard after updating password',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    },
  ]);

  useEffect(() => {
    dispatch(checkAdminAuthStatus());
  }, [dispatch]);

  const handleUpdateStatus = (id: string, status: SupportTicket['status']) => {
    setTickets(prev => prev.map(t => 
      t.id === id 
        ? { 
            ...t, 
            status,
            updatedAt: new Date().toISOString(),
            resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined,
          }
        : t
    ));
    // In production: dispatch API call
  };

  const handleAssign = (id: string, adminId: string) => {
    const admin = adminUser;
    if (admin) {
      setTickets(prev => prev.map(t => 
        t.id === id 
          ? { 
              ...t, 
              assignedTo: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
              },
              updatedAt: new Date().toISOString(),
            }
          : t
      ));
    }
    // In production: dispatch API call
  };

  const handleAddMessage = (ticketId: string, message: string) => {
    if (adminUser) {
      setTickets(prev => prev.map(t => 
        t.id === ticketId 
          ? { 
              ...t, 
              messages: [
                ...t.messages,
                {
                  id: `msg-${Date.now()}`,
                  ticketId,
                  senderId: adminUser.id,
                  senderName: adminUser.name,
                  senderType: 'admin',
                  message,
                  createdAt: new Date().toISOString(),
                },
              ],
              updatedAt: new Date().toISOString(),
            }
          : t
      ));
    }
    // In production: dispatch API call
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

  // RBAC Check - Temporarily disabled for admin users
  // if (!hasPermission(adminUser?.role, 'manage_support_tickets')) {
  //   return (
  //     <DashboardLayout>
  //       <div className="text-center py-12">
  //         <p className="text-text-secondary">You don&apos;t have permission to access this page.</p>
  //       </div>
  //     </DashboardLayout>
  //   );
  // }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Support Tickets</h1>
          <p className="text-text-secondary">Manage customer and partner support requests</p>
        </div>
        <SupportTickets 
          tickets={tickets}
          onUpdateStatus={handleUpdateStatus}
          onAssign={handleAssign}
          onAddMessage={handleAddMessage}
          currentAdminId={adminUser?.id || ''}
        />
      </div>
    </DashboardLayout>
  );
}

