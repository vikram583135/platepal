'use client';

import { useState } from 'react';
import { RestaurantApproval } from '@/store/types';
import DataTable, { Column } from './DataTable';
import Modal from './Modal';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface RestaurantApprovalsProps {
  approvals: RestaurantApproval[];
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes: string) => void;
}

export default function RestaurantApprovals({
  approvals,
  onApprove,
  onReject,
}: RestaurantApprovalsProps) {
  const [selectedApproval, setSelectedApproval] = useState<RestaurantApproval | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, { badge: string; icon: any }> = {
      pending: { badge: 'badge-warning', icon: ClockIcon },
      approved: { badge: 'badge-success', icon: CheckCircleIcon },
      rejected: { badge: 'badge-error', icon: XCircleIcon },
      under_review: { badge: 'badge-info', icon: ClockIcon },
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

  const handleViewDetails = (approval: RestaurantApproval) => {
    setSelectedApproval(approval);
    setIsModalOpen(true);
    setShowRejectForm(false);
    setRejectNotes('');
  };

  const handleApprove = () => {
    if (selectedApproval) {
      onApprove(selectedApproval.id);
      setIsModalOpen(false);
      setSelectedApproval(null);
    }
  };

  const handleReject = () => {
    if (selectedApproval && rejectNotes.trim()) {
      onReject(selectedApproval.id, rejectNotes);
      setIsModalOpen(false);
      setSelectedApproval(null);
      setRejectNotes('');
      setShowRejectForm(false);
    }
  };

  const columns: Column<RestaurantApproval>[] = [
    {
      key: 'restaurantName',
      label: 'Restaurant',
      sortable: true,
    },
    {
      key: 'ownerName',
      label: 'Owner',
      sortable: true,
    },
    {
      key: 'ownerEmail',
      label: 'Email',
      sortable: true,
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
      key: 'submittedAt',
      label: 'Submitted',
      sortable: true,
      render: (value) => <span className="text-text-secondary">{formatDate(String(value))}</span>,
      format: (value) => formatDate(String(value)),
    },
  ];

  const pendingApprovals = approvals.filter(a => a.status === 'pending' || a.status === 'under_review');

  return (
    <>
      <div className="bg-surface shadow-elevated rounded-lg animate-fade-in">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Restaurant Approvals</h3>
              <p className="text-sm text-text-secondary mt-1">
                {pendingApprovals.length} pending approval{pendingApprovals.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-success" />
              <p>No pending approvals</p>
            </div>
          ) : (
            <DataTable
              data={pendingApprovals}
              columns={columns}
              searchable={true}
              searchPlaceholder="Search approvals..."
              searchKeys={['restaurantName', 'ownerName', 'ownerEmail']}
              exportable={false}
              pagination={true}
              itemsPerPage={10}
              onRowClick={handleViewDetails}
              emptyMessage="No pending approvals found"
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApproval(null);
          setShowRejectForm(false);
          setRejectNotes('');
        }}
        title={`Restaurant Approval - ${selectedApproval?.restaurantName}`}
        size="lg"
      >
        {selectedApproval && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-text-secondary">Restaurant Name</p>
                <p className="text-text-primary">{selectedApproval.restaurantName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Owner</p>
                <p className="text-text-primary">{selectedApproval.ownerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Email</p>
                <p className="text-text-primary">{selectedApproval.ownerEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Status</p>
                <span className={`inline-flex items-center mt-1 ${getStatusBadge(selectedApproval.status).badge}`}>
                  {selectedApproval.status.replace('_', ' ').charAt(0).toUpperCase() + selectedApproval.status.replace('_', ' ').slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Submitted</p>
                <p className="text-text-primary">{formatDate(selectedApproval.submittedAt)}</p>
              </div>
              {selectedApproval.reviewedAt && (
                <div>
                  <p className="text-sm font-medium text-text-secondary">Reviewed At</p>
                  <p className="text-text-primary">{formatDate(selectedApproval.reviewedAt)}</p>
                </div>
              )}
            </div>

            {selectedApproval.documents && (
              <div>
                <p className="text-sm font-medium text-text-secondary mb-2">Documents</p>
                <div className="space-y-2">
                  {selectedApproval.documents.license && (
                    <a
                      href={selectedApproval.documents.license}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline block"
                    >
                      📄 Business License
                    </a>
                  )}
                  {selectedApproval.documents.taxId && (
                    <a
                      href={selectedApproval.documents.taxId}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline block"
                    >
                      📄 Tax ID
                    </a>
                  )}
                  {selectedApproval.documents.addressProof && (
                    <a
                      href={selectedApproval.documents.addressProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline block"
                    >
                      📄 Address Proof
                    </a>
                  )}
                </div>
              </div>
            )}

            {selectedApproval.reviewNotes && (
              <div>
                <p className="text-sm font-medium text-text-secondary mb-2">Review Notes</p>
                <p className="text-text-primary bg-primary-light bg-opacity-10 p-3 rounded">{selectedApproval.reviewNotes}</p>
              </div>
            )}

            {selectedApproval.status === 'pending' && !showRejectForm && (
              <div className="flex space-x-3 pt-4 border-t border-border">
                <button
                  onClick={handleApprove}
                  className="flex-1 px-4 py-2 bg-success text-white rounded-md hover:bg-opacity-90 transition-colors flex items-center justify-center"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="flex-1 px-4 py-2 bg-error text-white rounded-md hover:bg-opacity-90 transition-colors flex items-center justify-center"
                >
                  <XCircleIcon className="h-5 w-5 mr-2" />
                  Reject
                </button>
              </div>
            )}

            {showRejectForm && (
              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Rejection Reason <span className="text-error">*</span>
                </label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className="w-full px-3 py-2 border border-border rounded-md bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
                <div className="flex space-x-3 mt-3">
                  <button
                    onClick={handleReject}
                    disabled={!rejectNotes.trim()}
                    className="flex-1 px-4 py-2 bg-error text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirm Rejection
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectNotes('');
                    }}
                    className="px-4 py-2 border border-border rounded-md text-text-primary hover:bg-primary-light hover:bg-opacity-10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

