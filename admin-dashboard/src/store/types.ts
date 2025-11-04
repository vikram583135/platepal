/**
 * Extended types for Admin Dashboard advanced features
 */

// Restaurant Approval
export interface RestaurantApproval {
  id: string;
  restaurantId: string;
  restaurantName: string;
  ownerName: string;
  ownerEmail: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  documents: {
    license?: string;
    taxId?: string;
    addressProof?: string;
  };
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

// Support Ticket
export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'order' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdBy: {
    id: string;
    name: string;
    email: string;
    type: 'customer' | 'restaurant' | 'delivery_partner';
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: 'admin' | 'customer' | 'restaurant' | 'delivery_partner';
  message: string;
  attachments?: string[];
  createdAt: string;
}

// Platform Analytics
export interface PlatformAnalytics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    orderGrowth: number;
    averageOrderValue: number;
  };
  revenue: {
    daily: Array<{ date: string; revenue: number }>;
    monthly: Array<{ month: string; revenue: number }>;
    byRestaurant: Array<{ restaurantId: string; restaurantName: string; revenue: number }>;
  };
  orders: {
    byStatus: Record<string, number>;
    byTimeOfDay: Array<{ hour: number; count: number }>;
    averageDeliveryTime: number;
  };
  users: {
    newUsers: Array<{ date: string; count: number }>;
    userRetention: number;
    activeUsersByDay: Array<{ date: string; count: number }>;
  };
  restaurants: {
    total: number;
    active: number;
    pendingApproval: number;
    suspended: number;
  };
  deliveryPartners: {
    total: number;
    active: number;
    onDuty: number;
    averageRating: number;
  };
}

// Audit Log
export interface AuditLog {
  id: string;
  action: string;
  entityType: 'restaurant' | 'order' | 'customer' | 'delivery_partner' | 'ticket' | 'user';
  entityId: string;
  performedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  performedAt: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

