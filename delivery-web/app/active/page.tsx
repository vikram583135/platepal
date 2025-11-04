'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { useAuthStore, useTaskStore, useEarningsStore } from '@/lib/store';
import StatusButton from '@/components/StatusButton';
import PhotoCapture from '@/components/PhotoCapture';
import SignatureCapture from '@/components/SignatureCapture';
import { ArrowLeft, MapPin, Phone, Navigation, Camera, PenTool, Clock, CheckCircle, Package, Truck, AlertCircle, Map } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function ActiveDeliveryPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { currentTask, setCurrentTask } = useTaskStore();
  const { addEarning } = useEarningsStore();
  const [updating, setUpdating] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [showSignatureCapture, setShowSignatureCapture] = useState(false);
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const [deliverySignature, setDeliverySignature] = useState<string | null>(null);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<{ pickup?: string; delivery?: string }>({});

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    if (!currentTask) {
      router.push('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentTask]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!token || !currentTask) return;

    // Require photo and signature for delivery completion
    if (newStatus === 'delivered' && (!deliveryPhoto || !deliverySignature)) {
      toast.error('Please capture delivery photo and signature before completing delivery');
      return;
    }

    setUpdating(true);
    try {
      // In a real app, you would upload photo and signature to server
      const deliveryData: any = {
        status: newStatus,
      };

      if (newStatus === 'delivered') {
        deliveryData.deliveryPhoto = deliveryPhoto;
        deliveryData.customerSignature = deliverySignature;
      }

      await apiService.updateOrderStatus(currentTask.orderId, newStatus, token);
      
      if (newStatus === 'delivered') {
        // Add earnings
        const earning = currentTask.total * 0.15;
        addEarning(earning);
        
        // Show completion animation
        setShowCompletionAnimation(true);
        setTimeout(() => {
          setCurrentTask(null);
          setDeliveryPhoto(null);
          setDeliverySignature(null);
          toast.success('🎉 Delivery completed! Earnings added to your account.', {
            icon: '✅',
            duration: 3000,
          });
          router.push('/dashboard');
        }, 2000);
      } else {
        setCurrentTask({ ...currentTask, status: newStatus });
        toast.success(`Status updated to ${newStatus}`, {
          icon: '✓',
        });
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoCapture = (imageData: string) => {
    setDeliveryPhoto(imageData);
    setShowPhotoCapture(false);
    toast.success('Delivery photo captured!');
  };

  const handleSignatureCapture = (signatureData: string) => {
    setDeliverySignature(signatureData);
    setShowSignatureCapture(false);
    toast.success('Customer signature captured!');
  };

  const handleNavigate = (address: string, type: 'pickup' | 'delivery') => {
    try {
      const encodedAddress = encodeURIComponent(address);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(mapsUrl, '_blank');
      
      // Mock estimated time (in real app, would use distance calculation)
      if (type === 'pickup') {
        setEstimatedTime(prev => ({ ...prev, pickup: '~5 min' }));
      } else {
        setEstimatedTime(prev => ({ ...prev, delivery: '~12 min' }));
      }
    } catch (error) {
      toast.error('Failed to open navigation. Please check your device settings.', {
        icon: '❌',
      });
    }
  };

  const handlePhoneCall = (phoneNumber?: string) => {
    const number = phoneNumber || '+1234567890'; // In real app, get from task
    try {
      window.location.href = `tel:${number}`;
    } catch (error) {
      toast.error('Unable to initiate call. Please use your phone directly.', {
        icon: '📞',
      });
    }
  };

  const getDeliveryStages = () => {
    const status = currentTask?.status.toLowerCase() || '';
    return [
      { id: 'ready', label: 'Ready', icon: Package, completed: ['picked_up', 'delivered'].includes(status) },
      { id: 'picked_up', label: 'Picked Up', icon: Truck, completed: status === 'delivered' },
      { id: 'delivered', label: 'Delivered', icon: CheckCircle, completed: status === 'delivered' },
    ];
  };

  if (!currentTask) {
    return null;
  }

  const stages = getDeliveryStages();
  const currentStageIndex = stages.findIndex(s => s.id === currentTask.status.toLowerCase() || 
    (s.id === 'ready' && currentTask.status.toLowerCase() === 'ready'));

  return (
    <div className="min-h-screen bg-neutral-background pb-8">
      {/* Completion Animation Overlay */}
      {showCompletionAnimation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-gradient-to-br from-success to-primary rounded-3xl p-12 text-center shadow-2xl-glow animate-scale-in">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-once">
              <CheckCircle size={48} className="text-success" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Delivery Complete!</h2>
            <p className="text-white/90 text-lg">Earnings: {formatCurrency(currentTask.total * 0.15)}</p>
            <div className="spinner-lg mx-auto mt-6" />
          </div>
        </div>
      )}

      {/* Enhanced Header */}
      <div className="gradient-primary text-white p-5 sticky top-0 z-40 shadow-xl-glow">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-white/10 rounded-full active:scale-95 transition-transform touch-target"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">
            Active Delivery
          </h1>
          <div className="w-10"></div>
        </div>
        
        {/* Progress Indicator */}
        <div className="mt-4 flex items-center justify-between relative" role="progressbar" aria-label="Delivery progress" aria-valuenow={currentStageIndex + 1} aria-valuemin={1} aria-valuemax={stages.length}>
          {stages.map((stage, index) => {
            const StageIcon = stage.icon;
            const isActive = index <= currentStageIndex;
            const isCurrent = index === currentStageIndex;
            
            return (
              <div key={stage.id} className="flex-1 flex flex-col items-center relative">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${
                    isCurrent
                      ? 'bg-white border-white shadow-glow scale-110'
                      : isActive
                      ? 'bg-white border-white'
                      : 'bg-white/30 border-white/30'
                  }`}
                  aria-label={`${stage.label} - ${isCurrent ? 'current' : isActive ? 'completed' : 'pending'}`}
                >
                  <StageIcon size={20} className={isActive ? 'text-primary' : 'text-white/50'} aria-hidden="true" />
                </div>
                <span className={`text-xs mt-2 font-semibold ${isActive ? 'text-white' : 'text-white/60'}`}>
                  {stage.label}
                </span>
                {index < stages.length - 1 && (
                  <div 
                    className={`absolute top-6 left-[60%] w-full h-1 transition-all ${
                      isActive ? 'bg-white' : 'bg-white/30'
                    }`} 
                    style={{ width: 'calc(100% - 48px)' }}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Enhanced Order Info */}
        <div className="bg-gradient-to-br from-neutral-surface to-primary-light/10 rounded-xl p-6 shadow-xl border-2 border-primary/20 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-neutral-text-primary">{currentTask.restaurantName}</h2>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                  Order #{currentTask.orderId.slice(-6)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-text-secondary">
                <Clock size={14} />
                <span>{formatDate(currentTask.createdAt)}</span>
              </div>
            </div>
            <div className="text-right bg-gradient-primary rounded-xl p-4 shadow-md">
              <p className="text-3xl font-bold text-white">
                {formatCurrency(currentTask.total * 0.15)}
              </p>
              <p className="text-xs text-white/80 mt-1">Earnings</p>
            </div>
          </div>
        </div>

        {/* Enhanced Pickup Location */}
        <div className="bg-gradient-to-br from-neutral-surface to-white rounded-xl p-6 shadow-elevated border border-primary/10 animate-fade-in-up animate-stagger-1">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <MapPin size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-neutral-text-primary text-lg">Pickup Location</h3>
                {estimatedTime.pickup && (
                  <span className="bg-primary-light text-primary px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Clock size={12} />
                    {estimatedTime.pickup}
                  </span>
                )}
              </div>
              <p className="text-neutral-text-primary font-semibold mb-1">{currentTask.restaurantName}</p>
              <p className="text-sm text-neutral-text-secondary">{currentTask.pickupAddress}</p>
            </div>
          </div>
          {/* Map Preview Placeholder */}
          <div className="w-full h-32 bg-gradient-to-br from-primary-light to-primary/20 rounded-lg mb-4 flex items-center justify-center border-2 border-primary/20 relative overflow-hidden">
            <Map size={32} className="text-primary/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-neutral-text-secondary font-medium">Map Preview</span>
            </div>
          </div>
          <button
            onClick={() => handleNavigate(currentTask.pickupAddress, 'pickup')}
            className="w-full flex items-center justify-center gap-2 gradient-primary text-white py-4 rounded-xl font-bold text-lg touch-target-large shadow-xl hover:shadow-2xl-glow transition-all active:scale-95"
            aria-label="Navigate to pickup location"
          >
            <Navigation size={20} />
            <span>Navigate to Pickup</span>
          </button>
        </div>

        {/* Enhanced Delivery Location */}
        <div className="bg-gradient-to-br from-neutral-surface to-secondary/5 rounded-xl p-6 shadow-elevated border border-secondary/10 animate-fade-in-up animate-stagger-2">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <MapPin size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-neutral-text-primary text-lg">Delivery Location</h3>
                {estimatedTime.delivery && (
                  <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Clock size={12} />
                    {estimatedTime.delivery}
                  </span>
                )}
              </div>
              <p className="text-neutral-text-primary font-semibold mb-1">{currentTask.customerName}</p>
              <p className="text-sm text-neutral-text-secondary">{currentTask.deliveryAddress}</p>
            </div>
          </div>
          {/* Map Preview Placeholder */}
          <div className="w-full h-32 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg mb-4 flex items-center justify-center border-2 border-secondary/20 relative overflow-hidden">
            <Map size={32} className="text-secondary/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-neutral-text-secondary font-medium">Map Preview</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleNavigate(currentTask.deliveryAddress, 'delivery')}
              className="flex-1 flex items-center justify-center gap-2 gradient-primary text-white py-4 rounded-xl font-bold text-lg touch-target-large shadow-xl hover:shadow-2xl-glow transition-all active:scale-95"
              aria-label="Navigate to delivery location"
            >
              <Navigation size={20} />
              <span>Navigate</span>
            </button>
            <button 
              onClick={() => handlePhoneCall()}
              className="px-6 py-4 bg-secondary text-white rounded-xl font-bold touch-target-large shadow-xl hover:shadow-2xl hover:bg-secondary-hover transition-all active:scale-95 flex items-center justify-center"
              aria-label="Call customer"
              title="Call customer"
            >
              <Phone size={20} />
            </button>
          </div>
        </div>

        {/* Enhanced Order Items */}
        <div className="bg-gradient-to-br from-neutral-surface to-white rounded-xl p-6 shadow-elevated animate-fade-in-up animate-stagger-3">
          <div className="flex items-center gap-2 mb-5">
            <Package size={24} className="text-primary" />
            <h3 className="font-bold text-neutral-text-primary text-lg">Order Items</h3>
          </div>
          <div className="space-y-3">
            {currentTask.items.map((item: any, index: number) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-primary-light/10 rounded-lg border border-primary/10 hover:bg-primary-light/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{item.quantity}</span>
                  </div>
                  <span className="text-neutral-text-primary font-semibold">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-status-active text-lg">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-primary mt-5 pt-5 flex justify-between items-center">
            <span className="text-neutral-text-primary font-bold text-lg">Total</span>
            <span className="text-primary font-bold text-2xl">{formatCurrency(currentTask.total)}</span>
          </div>
        </div>

        {/* Photo Proof & Signature - Show when picked up */}
        {currentTask.status.toLowerCase() === 'picked_up' && (
          <>
            {/* Enhanced Delivery Photo */}
            <div className="bg-gradient-to-br from-neutral-surface to-accent/5 rounded-xl p-6 shadow-elevated border border-accent/20 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <Camera size={24} className="text-accent-dark" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-text-primary text-lg">Delivery Photo</h3>
                    <p className="text-sm text-neutral-text-secondary flex items-center gap-1">
                      {deliveryPhoto ? (
                        <>
                          <CheckCircle size={14} className="text-success" />
                          Photo captured
                        </>
                      ) : (
                        <>
                          <AlertCircle size={14} className="text-accent-dark" />
                          Required for delivery completion
                        </>
                      )}
                    </p>
                  </div>
                </div>
                {deliveryPhoto && (
                  <div className="w-20 h-20 rounded-xl border-2 border-success overflow-hidden shadow-md">
                    <img src={deliveryPhoto} alt="Delivery photo" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              {!showPhotoCapture && (
                <button
                  onClick={() => setShowPhotoCapture(true)}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg touch-target-large shadow-xl transition-all ${
                    deliveryPhoto
                      ? 'bg-gradient-to-r from-accent to-accent-dark text-neutral-text-primary hover:shadow-2xl'
                      : 'gradient-accent text-neutral-text-primary hover:shadow-2xl-glow'
                  } active:scale-95`}
                >
                  <Camera size={24} />
                  <span>{deliveryPhoto ? 'Retake Photo' : 'Capture Delivery Photo'}</span>
                </button>
              )}
              {showPhotoCapture && (
                <PhotoCapture
                  onCapture={handlePhotoCapture}
                  onCancel={() => setShowPhotoCapture(false)}
                  title="Delivery Photo"
                  description="Take a photo of the delivered order"
                />
              )}
            </div>

            {/* Enhanced Customer Signature */}
            <div className="bg-gradient-to-br from-neutral-surface to-primary-light/10 rounded-xl p-6 shadow-elevated border border-primary/20 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <PenTool size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-text-primary text-lg">Customer Signature</h3>
                    <p className="text-sm text-neutral-text-secondary flex items-center gap-1">
                      {deliverySignature ? (
                        <>
                          <CheckCircle size={14} className="text-success" />
                          Signature captured
                        </>
                      ) : (
                        <>
                          <AlertCircle size={14} className="text-primary" />
                          Required for delivery completion
                        </>
                      )}
                    </p>
                  </div>
                </div>
                {deliverySignature && (
                  <div className="w-20 h-20 rounded-xl border-2 border-success bg-white p-2 shadow-md">
                    <img src={deliverySignature} alt="Signature" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
              {!showSignatureCapture && (
                <button
                  onClick={() => setShowSignatureCapture(true)}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg touch-target-large shadow-xl transition-all ${
                    deliverySignature
                      ? 'bg-gradient-to-r from-primary-light to-primary text-primary hover:shadow-2xl'
                      : 'gradient-primary text-white hover:shadow-2xl-glow'
                  } active:scale-95`}
                >
                  <PenTool size={24} />
                  <span>{deliverySignature ? 'Resign' : 'Get Customer Signature'}</span>
                </button>
              )}
              {showSignatureCapture && (
                <SignatureCapture
                  onSave={handleSignatureCapture}
                  onCancel={() => setShowSignatureCapture(false)}
                  title="Customer Signature"
                  description="Have the customer sign to confirm delivery"
                />
              )}
            </div>
          </>
        )}

        {/* Enhanced Status Update Section */}
        <div className="bg-gradient-to-br from-neutral-surface to-white rounded-xl p-6 shadow-elevated space-y-4 animate-fade-in-up animate-stagger-4 border-2 border-primary/10">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Truck size={20} className="text-primary" />
            </div>
            <h3 className="font-bold text-neutral-text-primary text-lg">Update Status</h3>
          </div>
          
          {currentTask.status.toLowerCase() === 'ready' && (
            <StatusButton
              label="Picked Up Order"
              status="picked_up"
              currentStatus={currentTask.status.toLowerCase()}
              onClick={async () => {
                if (window.confirm('Confirm that you have picked up the order?')) {
                  await handleUpdateStatus('picked_up');
                }
              }}
              disabled={updating}
              description="Confirm pickup from restaurant"
            />
          )}

          {currentTask.status.toLowerCase() === 'picked_up' && (
            <div className="space-y-4">
              {(!deliveryPhoto || !deliverySignature) && (
                <div className="bg-gradient-to-r from-accent/20 to-accent/10 border-2 border-accent rounded-xl p-5 animate-pulse">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={24} className="text-accent-dark flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-neutral-text-primary mb-1">
                        Required Before Completion
                      </p>
                      <ul className="text-xs text-neutral-text-secondary space-y-1">
                        {!deliveryPhoto && <li>• Capture delivery photo</li>}
                        {!deliverySignature && <li>• Get customer signature</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {deliveryPhoto && deliverySignature && (
                <div className="bg-success-light border-2 border-success rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-success" />
                    <p className="text-sm font-semibold text-success">All requirements completed!</p>
                  </div>
                </div>
              )}
              <StatusButton
                label="Mark as Delivered"
                status="delivered"
                currentStatus={currentTask.status.toLowerCase()}
                onClick={async () => {
                  if (!deliveryPhoto || !deliverySignature) {
                    toast.error('Please capture photo and signature first', {
                      icon: '⚠️',
                    });
                    return;
                  }
                  if (window.confirm('Confirm delivery completion? This action cannot be undone.')) {
                    await handleUpdateStatus('delivered');
                  }
                }}
                disabled={updating || !deliveryPhoto || !deliverySignature}
                description="Complete the delivery"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

