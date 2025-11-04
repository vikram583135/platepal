'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { checkAdminAuthStatus } from '@/store';
import { RestaurantApproval } from '@/store/types';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import RestaurantApprovals from '@/components/RestaurantApprovals';
import { hasPermission } from '@/lib/rbac';

export default function ApprovalsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, adminUser } = useSelector((state: RootState) => state.auth);
  
  // Mock data - in production, this would come from the store/API
  const [approvals, setApprovals] = useState<RestaurantApproval[]>([
    {
      id: 'approval-1',
      restaurantId: 'rest-1',
      restaurantName: 'New Pizza Place',
      ownerName: 'John Doe',
      ownerEmail: 'john@pizza.com',
      submittedAt: new Date().toISOString(),
      status: 'pending',
      documents: {
        license: 'https://example.com/license.pdf',
        taxId: 'https://example.com/tax.pdf',
        addressProof: 'https://example.com/address.pdf',
      },
    },
    {
      id: 'approval-2',
      restaurantId: 'rest-2',
      restaurantName: 'Burger Joint',
      ownerName: 'Jane Smith',
      ownerEmail: 'jane@burger.com',
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'under_review',
      documents: {
        license: 'https://example.com/license2.pdf',
        taxId: 'https://example.com/tax2.pdf',
      },
    },
  ]);

  useEffect(() => {
    dispatch(checkAdminAuthStatus());
  }, [dispatch]);

  const handleApprove = (id: string, notes?: string) => {
    setApprovals(prev => prev.map(a => 
      a.id === id 
        ? { ...a, status: 'approved' as const, reviewNotes: notes, reviewedBy: adminUser?.id, reviewedAt: new Date().toISOString() }
        : a
    ));
    // In production: dispatch API call
  };

  const handleReject = (id: string, notes: string) => {
    setApprovals(prev => prev.map(a => 
      a.id === id 
        ? { ...a, status: 'rejected' as const, reviewNotes: notes, reviewedBy: adminUser?.id, reviewedAt: new Date().toISOString() }
        : a
    ));
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
  // if (!hasPermission(adminUser?.role, 'approve_restaurants')) {
  //   return (
  //     <DashboardLayout>
  //       <div className="text-center py-12">
  //         <p className="text-text-secondary">You don&apos;t have permission to access this page.</p>
  //       </div>
  //     </DashboardLayout>
  //   );
  // }

  const pendingCount = approvals.filter(a => a.status === 'pending' || a.status === 'under_review').length;
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length;

  return (
    <DashboardLayout>
      <div className="space-y-6 page-transition">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">Restaurant Approvals</h1>
          <p className="text-text-secondary mt-1">Review and approve new restaurant applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pending Review</p>
                <p className="text-3xl font-bold mt-2">{pendingCount}</p>
              </div>
              <svg className="h-12 w-12 text-yellow-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Approved</p>
                <p className="text-3xl font-bold mt-2">{approvedCount}</p>
              </div>
              <svg className="h-12 w-12 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-elevated p-6 text-white card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Rejected</p>
                <p className="text-3xl font-bold mt-2">{rejectedCount}</p>
              </div>
              <svg className="h-12 w-12 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <RestaurantApprovals 
          approvals={approvals}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </DashboardLayout>
  );
}

