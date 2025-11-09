'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api-client';
import { detectFraud, FraudAlert } from '@/lib/fraud-detection';
import { ShieldExclamationIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface SuspiciousOrder {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  timestamp: string;
  couponCode?: string;
  status: string;
  alerts?: FraudAlert[];
  reviewed?: boolean;
  reviewDecision?: 'fraud' | 'legitimate';
}

export default function FraudDetectionPage() {
  const [suspiciousOrders, setSuspiciousOrders] = useState<SuspiciousOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<SuspiciousOrder | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'fraud' | 'legitimate'>('all');

  useEffect(() => {
    fetchSuspiciousOrders();
  }, []);

  const fetchSuspiciousOrders = async () => {
    setLoading(true);
    try {
      const orders = await apiClient.getSuspiciousOrders();
      
      // Run fraud detection on each order
      const ordersWithAlerts = await Promise.all(
        orders.map(async (order: any) => {
          const alerts = await detectFraud({
            orderId: order.id || order.orderId,
            userId: order.userId || order.customerId,
            amount: order.totalAmount || order.amount || 0,
            timestamp: order.createdAt || order.timestamp || new Date().toISOString(),
            couponCode: order.couponCode,
            userHistory: order.userHistory,
          });

          return {
            ...order,
            alerts,
            reviewed: order.reviewed || false,
            reviewDecision: order.reviewDecision,
          };
        })
      );

      setSuspiciousOrders(ordersWithAlerts);
    } catch (error) {
      console.error('Error fetching suspicious orders:', error);
      toast.error('Failed to load suspicious orders');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (order: SuspiciousOrder, decision: 'fraud' | 'legitimate', reason: string) => {
    try {
      if (decision === 'fraud') {
        await apiClient.flagOrderAsFraud(order.orderId || order.id, reason);
        toast.success('Order flagged as fraud');
      }

      // Update local state
      setSuspiciousOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, reviewed: true, reviewDecision: decision }
            : o
        )
      );

      setReviewModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error reviewing order:', error);
      toast.error('Failed to review order');
    }
  };

  const filteredOrders = suspiciousOrders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !order.reviewed;
    if (filter === 'fraud') return order.reviewDecision === 'fraud';
    if (filter === 'legitimate') return order.reviewDecision === 'legitimate';
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <LoadingSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Fraud Detection Center</h1>
            <p className="text-text-secondary mt-1">AI-powered fraud detection and manual review queue</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="warning">{suspiciousOrders.filter((o) => !o.reviewed).length} Pending</Badge>
            <Badge variant="error">{suspiciousOrders.filter((o) => o.reviewDecision === 'fraud').length} Fraud</Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'pending', 'fraud', 'legitimate'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-primary hover:bg-background'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Fraud Feed */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-lg">
              <ShieldExclamationIcon className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">No suspicious orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface rounded-lg shadow-elevated p-6 border-l-4 border-orange-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-text-primary">
                        Order #{order.orderId || order.id}
                      </h3>
                      <Badge variant="neutral">${order.amount}</Badge>
                      {order.couponCode && (
                        <Badge variant="warning">Coupon: {order.couponCode}</Badge>
                      )}
                      {order.reviewed && (
                        <Badge
                          variant={order.reviewDecision === 'fraud' ? 'error' : 'success'}
                        >
                          {order.reviewDecision === 'fraud' ? 'Fraud' : 'Legitimate'}
                        </Badge>
                      )}
                    </div>

                    {/* Fraud Alerts */}
                    {order.alerts && order.alerts.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {order.alerts.map((alert, idx) => (
                          <div
                            key={idx}
                            className={`${getSeverityColor(alert.severity)} rounded-lg p-3`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold">{alert.type.replace(/_/g, ' ').toUpperCase()}</span>
                              <span className="text-sm opacity-90">
                                Confidence: {(alert.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-sm opacity-90">{alert.description}</p>
                            {alert.aiReasoning && (
                              <p className="text-xs opacity-75 mt-1 italic">{alert.aiReasoning}</p>
                            )}
                            {alert.flags && alert.flags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {alert.flags.map((flag, flagIdx) => (
                                  <span key={flagIdx} className="text-xs bg-white/20 px-2 py-1 rounded">
                                    {flag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-sm text-text-secondary">
                      <p>User ID: {order.userId}</p>
                      <p>Timestamp: {new Date(order.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  {!order.reviewed && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setReviewModalOpen(true);
                      }}
                      className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Review
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Review Modal */}
        {selectedOrder && (
          <Modal
            isOpen={reviewModalOpen}
            onClose={() => {
              setReviewModalOpen(false);
              setSelectedOrder(null);
            }}
            title={`Review Order #${selectedOrder.orderId || selectedOrder.id}`}
          >
            <ReviewOrderModal
              order={selectedOrder}
              onReview={handleReview}
              onCancel={() => {
                setReviewModalOpen(false);
                setSelectedOrder(null);
              }}
            />
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}

function ReviewOrderModal({
  order,
  onReview,
  onCancel,
}: {
  order: SuspiciousOrder;
  onReview: (order: SuspiciousOrder, decision: 'fraud' | 'legitimate', reason: string) => void;
  onCancel: () => void;
}) {
  const [decision, setDecision] = useState<'fraud' | 'legitimate' | null>(null);
  const [reason, setReason] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2">Order Details</h4>
        <div className="bg-background rounded-lg p-4 space-y-2 text-sm">
          <p>Order ID: {order.orderId || order.id}</p>
          <p>Amount: ${order.amount}</p>
          <p>User ID: {order.userId}</p>
          {order.couponCode && <p>Coupon: {order.couponCode}</p>}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Fraud Alerts</h4>
        <div className="space-y-2">
          {order.alerts?.map((alert, idx) => (
            <div key={idx} className="bg-background rounded-lg p-3 border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{alert.type.replace(/_/g, ' ')}</span>
                <Badge variant={alert.severity === 'critical' || alert.severity === 'high' ? 'error' : 'warning'}>
                  {alert.severity}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary">{alert.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-2">Decision</label>
        <div className="flex gap-4">
          <button
            onClick={() => setDecision('fraud')}
            className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
              decision === 'fraud'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-border hover:border-red-300'
            }`}
          >
            <XCircleIcon className="h-6 w-6 mx-auto mb-1" />
            <span className="text-sm font-medium">Flag as Fraud</span>
          </button>
          <button
            onClick={() => setDecision('legitimate')}
            className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
              decision === 'legitimate'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-border hover:border-green-300'
            }`}
          >
            <CheckCircleIcon className="h-6 w-6 mx-auto mb-1" />
            <span className="text-sm font-medium">Mark as Legitimate</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-2">Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for your decision..."
          className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (decision && reason) {
              onReview(order, decision, reason);
            } else {
              toast.error('Please select a decision and provide a reason');
            }
          }}
          disabled={!decision || !reason}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}
