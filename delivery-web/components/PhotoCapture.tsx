'use client';

import { useState, useRef } from 'react';
import { Camera, X, Check, RotateCcw, Grid3x3, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
}

export default function PhotoCapture({ 
  onCapture, 
  onCancel,
  title = 'Take Photo',
  description = 'Capture proof of delivery'
}: PhotoCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      toast.error('Failed to access camera. Please check permissions.');
      console.error('Camera access error:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
    }
  };

  const handleCancel = () => {
    stopCamera();
    setCapturedImage(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="bg-neutral-surface rounded-lg p-6 shadow-elevated animate-scale-in">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-neutral-text-primary mb-2">{title}</h3>
        <p className="text-sm text-neutral-text-secondary">{description}</p>
      </div>

      {!isCapturing && !capturedImage && (
        <div className="space-y-4">
          <div className="w-full h-64 bg-neutral-background rounded-lg border-2 border-dashed border-neutral-border flex items-center justify-center">
            <div className="text-center">
              <Camera size={48} className="text-neutral-text-secondary mx-auto mb-2" />
              <p className="text-neutral-text-secondary">Ready to capture</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={startCamera}
              className="flex-1 gradient-primary text-white py-4 rounded-lg font-bold text-lg touch-target-large shadow-md hover-glow"
            >
              <Camera size={24} className="inline mr-2" />
              Open Camera
            </button>
            {onCancel && (
              <button
                onClick={handleCancel}
                className="px-6 py-4 bg-neutral-background text-neutral-text-primary rounded-lg font-bold border-2 border-neutral-border touch-target-large"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {isCapturing && (
        <div className="space-y-4 animate-fade-in">
          <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
              style={{ maxHeight: '400px', transform: `scale(${zoom})` }}
            />
            {/* Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '33.33% 33.33%' }} />
            )}
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
              <button
                onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
                className="p-2 bg-white/20 hover:bg-white/30 rounded touch-target transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn size={20} className="text-white" />
              </button>
              <button
                onClick={() => setZoom(Math.max(zoom - 0.1, 1))}
                className="p-2 bg-white/20 hover:bg-white/30 rounded touch-target transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut size={20} className="text-white" />
              </button>
            </div>
            {/* Grid Toggle */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-lg touch-target transition-colors"
              aria-label={showGrid ? 'Hide grid' : 'Show grid'}
            >
              <Grid3x3 size={20} className={`text-white ${showGrid ? 'opacity-100' : 'opacity-50'}`} />
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={capturePhoto}
              className="flex-1 gradient-primary text-white py-4 rounded-xl font-bold text-lg touch-target-large shadow-xl hover:shadow-2xl-glow transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Camera size={24} />
              <span>Capture</span>
            </button>
            <button
              onClick={stopCamera}
              className="px-6 py-4 bg-neutral-background text-neutral-text-primary rounded-xl font-bold border-2 border-neutral-border hover:border-primary touch-target-large transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="space-y-4 animate-fade-in">
          <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl">
            <img
              src={capturedImage}
              alt="Captured photo"
              className="w-full h-auto"
              style={{ maxHeight: '400px', display: 'block' }}
            />
            {/* Photo Quality Indicator */}
            <div className="absolute bottom-4 left-4 bg-success/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-2">
              <Check size={14} />
              Photo captured
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={confirmPhoto}
              className="flex-1 gradient-success text-white py-4 rounded-xl font-bold text-lg touch-target-large shadow-xl hover:shadow-2xl-glow transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Check size={24} />
              <span>Use Photo</span>
            </button>
            <button
              onClick={retakePhoto}
              className="px-6 py-4 bg-accent text-neutral-text-primary rounded-xl font-bold touch-target-large shadow-md hover:shadow-lg transition-all active:scale-95"
              aria-label="Retake photo"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

