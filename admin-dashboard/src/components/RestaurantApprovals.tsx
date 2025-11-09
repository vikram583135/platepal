'use client';

import { useState } from 'react';
import { RestaurantApproval } from '@/store/types';
import { apiClient } from '@/lib/api-client';
import AIApprovalAssistant from './AIApprovalAssistant';
import Badge from './ui/Badge';
import Modal from './ui/Modal';
import ConfirmDialog from './ui/ConfirmDialog';
import { CheckCircleIcon, XCircleIcon, ClockIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface RestaurantApprovalsProps {
  approvals: RestaurantApproval[];
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, reason: string) => void;
}

export default function RestaurantApprovals({ approvals, onApprove, onReject }: RestaurantApprovalsProps) {
  const [selectedApproval, setSelectedApproval] = useState<RestaurantApproval | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<'approve' | 'reject' | 'request-info' | null>(null);

  const handleReview = (approval: RestaurantApproval) => {
    setSelectedApproval(approval);
    setReviewModalOpen(true);
    setAiRecommendation(null);
  };

  const handleApproveClick = () => {
    setReviewModalOpen(false);
    setApproveModalOpen(true);
  };

  const handleRejectClick = () => {
    setReviewModalOpen(false);
    setRejectModalOpen(true);
  };

  const confirmApprove = async (notes?: string) => {
    if (!selectedApproval) return;
    try {
      await apiClient.approveRestaurant(selectedApproval.restaurantId, notes);
      onApprove(selectedApproval.id, notes);
      toast.success('Restaurant approved successfully');
      setApproveModalOpen(false);
      setSelectedApproval(null);
    } catch (error) {
      console.error('Error approving restaurant:', error);
      toast.error('Failed to approve restaurant');
    }
  };

  const confirmReject = async (reason: string) => {
    if (!selectedApproval) return;
    try {
      await apiClient.rejectRestaurant(selectedApproval.restaurantId, reason);
      onReject(selectedApproval.id, reason);
      toast.success('Restaurant rejected');
      setRejectModalOpen(false);
      setSelectedApproval(null);
    } catch (error) {
      console.error('Error rejecting restaurant:', error);
      toast.error('Failed to reject restaurant');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'under_review':
        return <Badge variant="warning">Under Review</Badge>;
      default:
        return <Badge variant="neutral">Pending</Badge>;
    }
  };

  const hasMissingDocuments = (approval: RestaurantApproval) => {
    const docs = approval.documents || {};
    const missing: string[] = [];
    if (!docs.license) missing.push('License');
    if (!docs.taxId) missing.push('Tax ID');
    if (!docs.addressProof) missing.push('Address Proof');
    return missing;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Restaurant Approvals</h2>
          <p className="text-text-secondary mt-1">
            {approvals.filter(a => a.status === 'pending').length} pending review
          </p>
        </div>
      </div>

      {/* Approval Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {approvals.map((approval) => {
          const missingDocs = hasMissingDocuments(approval);
          const isHighRisk = missingDocs.length > 2 || !approval.ownerEmail || !approval.ownerName;

          return (
            <motion.div
              key={approval.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface rounded-lg shadow-elevated p-6 border border-border hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {approval.restaurantName}
                  </h3>
                  <p className="text-sm text-text-secondary">{approval.ownerName}</p>
                </div>
                {getStatusBadge(approval.status)}
              </div>

              {/* AI Pre-screening Badge */}
              {approval.status === 'pending' && (
                <div className="mb-4">
                  {isHighRisk ? (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-700">High Risk - Review Required</span>
                    </div>
                  ) : missingDocs.length > 0 ? (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <ClockIcon className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700">Missing Documents</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Low Risk - Ready for Review</span>
                    </div>
                  )}
                </div>
              )}

              {/* Missing Documents Highlight */}
              {missingDocs.length > 0 && approval.status === 'pending' && (
                <div className="mb-4 p-3 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <DocumentTextIcon className="h-4 w-4 text-warning" />
                    <span className="text-sm font-semibold text-text-primary">Missing Documents</span>
                  </div>
                  <div className="space-y-1">
                    {missingDocs.map((doc, idx) => (
                      <div key={idx} className="text-xs text-text-secondary flex items-center gap-1">
                        <XCircleIcon className="h-3 w-3 text-error" />
                        {doc}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="font-medium">Email:</span>
                  <span>{approval.ownerEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="font-medium">Submitted:</span>
                  <span>{new Date(approval.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              {approval.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(approval)}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    Review Application
                  </button>
                </div>
              )}

              {approval.status === 'under_review' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(approval)}
                    className="flex-1 px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-background transition-colors text-sm font-medium"
                  >
                    Continue Review
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Review Modal with AI Assistant */}
      {selectedApproval && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedApproval(null);
            setAiRecommendation(null);
          }}
          title={`Review: ${selectedApproval.restaurantName}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* AI Approval Assistant */}
            <AIApprovalAssistant
              application={{
                id: selectedApproval.restaurantId,
                name: selectedApproval.restaurantName,
                ownerName: selectedApproval.ownerName,
                email: selectedApproval.ownerEmail,
                phone: '', // Would come from API
                address: '', // Would come from API
                cuisineType: '', // Would come from API
                documents: selectedApproval.documents,
                submittedAt: selectedApproval.submittedAt,
              }}
              onRecommendation={(rec) => setAiRecommendation(rec)}
            />

            {/* Application Details */}
            <div className="bg-background rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-text-primary">Application Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-text-secondary">Restaurant Name:</span>
                  <span className="ml-2 text-text-primary font-medium">{selectedApproval.restaurantName}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Owner:</span>
                  <span className="ml-2 text-text-primary font-medium">{selectedApproval.ownerName}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Email:</span>
                  <span className="ml-2 text-text-primary">{selectedApproval.ownerEmail}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Submitted:</span>
                  <span className="ml-2 text-text-primary">
                    {new Date(selectedApproval.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Documents */}
              {selectedApproval.documents && (
                <div className="mt-4">
                  <h5 className="font-semibold text-text-primary mb-2">Documents</h5>
                  <div className="space-y-2">
                    {selectedApproval.documents.license && (
                      <a
                        href={selectedApproval.documents.license}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                        Business License
                      </a>
                    )}
                    {selectedApproval.documents.taxId && (
                      <a
                        href={selectedApproval.documents.taxId}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                        Tax ID
                      </a>
                    )}
                    {selectedApproval.documents.addressProof && (
                      <a
                        href={selectedApproval.documents.addressProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                        Address Proof
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => {
                  setReviewModalOpen(false);
                  setSelectedApproval(null);
                }}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectClick}
                className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={handleApproveClick}
                className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
              >
                Approve
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmDialog
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={(notes) => confirmApprove(notes)}
        title="Approve Restaurant"
        message="Are you sure you want to approve this restaurant? They will be able to start accepting orders."
        confirmText="Approve"
        cancelText="Cancel"
        variant="success"
        showNotes={true}
      />

      {/* Reject Confirmation Modal */}
      <ConfirmDialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={(reason) => confirmReject(reason || 'No reason provided')}
        title="Reject Restaurant Application"
        message="Please provide a reason for rejecting this application. The restaurant owner will be notified."
        confirmText="Reject"
        cancelText="Cancel"
        variant="danger"
        showNotes={true}
        requireNotes={true}
      />
    </div>
  );
}

