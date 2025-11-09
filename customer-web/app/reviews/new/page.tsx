'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useAuthStore } from '@/lib/store';
import { apiService, Order } from '@/lib/api';
import AIReviewAssistant from '@/components/AIReviewAssistant';
import MobileNav from '@/components/MobileNav';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

function NewReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { token, user } = useAuthStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (orderId) {
      loadOrder();
    } else {
      toast.error('No order specified');
      router.push('/orders');
    }
  }, [orderId, token]);

  const loadOrder = async () => {
    if (!orderId || !token) return;

    try {
      setLoading(true);
      const orderData = await apiService.getOrderById(orderId, token);
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to load order:', error);
      toast.error('Failed to load order details');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (rating: number, review: string) => {
    if (!order) return;

    try {
      setSubmitting(true);
      
      // In a real app, this would submit to the backend
      // await apiService.submitReview(order.id, { rating, review });
      
      // Mock submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Review submitted successfully!', {
        description: 'Thank you for your feedback',
      });
      
      router.push('/orders');
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/orders');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-neutral-text-secondary mb-4">Order not found</p>
          <button
            onClick={() => router.push('/orders')}
            className="gradient-primary text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-background pb-20">
      {/* Header */}
      <div className="bg-white shadow-elevated sticky top-0 z-40">
        <div className="flex items-center p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-primary-light rounded-full active:scale-95 transition-all"
          >
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <h1 className="text-lg font-bold text-neutral-text-primary flex-1 text-center">
            Write a Review
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <AIReviewAssistant
          order={order}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>

      <MobileNav />
    </div>
  );
}

export default function NewReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    }>
      <NewReviewContent />
    </Suspense>
  );
}

