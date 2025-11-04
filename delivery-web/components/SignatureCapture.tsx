'use client';

import { useState, useRef, useEffect } from 'react';
import { PenTool, RotateCcw, Check, X, Undo2, Redo2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SignatureCaptureProps {
  onSave: (signatureData: string) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
}

export default function SignatureCapture({ 
  onSave, 
  onCancel,
  title = 'Customer Signature',
  description = 'Have the customer sign below'
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [strokeLength, setStrokeLength] = useState(0);
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Set drawing style
    ctx.strokeStyle = '#2D3436';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Remove any future states if we're in the middle of history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    historyIndexRef.current = historyRef.current.length - 1;
    
    // Limit history size
    if (historyRef.current.length > 20) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveState(); // Save state before drawing
    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    lastPointRef.current = { x, y };
    setStrokeLength(0);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    if (lastPointRef.current) {
      const distance = Math.sqrt(
        Math.pow(x - lastPointRef.current.x, 2) + 
        Math.pow(y - lastPointRef.current.y, 2)
      );
      setStrokeLength(prev => prev + distance);
    }
    
    lastPointRef.current = { x, y };

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const undo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
      setHasSignature(historyIndexRef.current > 0);
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
      setHasSignature(true);
    }
  };

  const clearSignature = () => {
    saveState();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setStrokeLength(0);
    lastPointRef.current = null;
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    // Validate minimum stroke length
    if (strokeLength < 50) {
      toast.error('Signature too short. Please draw a longer signature.', {
        icon: '⚠️',
      });
      return;
    }

    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
    clearSignature();
  };

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;
  const signatureQuality = strokeLength > 100 ? 'good' : strokeLength > 50 ? 'ok' : 'poor';

  return (
    <div className="bg-neutral-surface rounded-lg p-6 shadow-elevated animate-scale-in">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-neutral-text-primary mb-2">{title}</h3>
        <p className="text-sm text-neutral-text-secondary">{description}</p>
      </div>

      <div className="space-y-4">
        <div className="relative w-full bg-white rounded-lg border-2 border-neutral-border overflow-hidden touch-target-large" style={{ minHeight: '200px' }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair touch-none"
            style={{ minHeight: '200px' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Quality Indicator */}
        {strokeLength > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full font-semibold ${
              signatureQuality === 'good' ? 'bg-success-light text-success' :
              signatureQuality === 'ok' ? 'bg-warning-light text-warning' :
              'bg-error-light text-error'
            }`}>
              {signatureQuality === 'good' ? '✓ Good quality' :
               signatureQuality === 'ok' ? '⚠ Adequate' :
               '✗ Too short'}
            </span>
            {strokeLength < 50 && (
              <span className="text-error text-xs flex items-center gap-1">
                <AlertCircle size={14} />
                Minimum 50px required
              </span>
            )}
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="px-4 py-3 bg-neutral-background text-neutral-text-primary rounded-xl font-bold border-2 border-neutral-border hover:border-primary touch-target transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Undo"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="px-4 py-3 bg-neutral-background text-neutral-text-primary rounded-xl font-bold border-2 border-neutral-border hover:border-primary touch-target transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Redo"
            >
              <Redo2 size={18} />
            </button>
            <button
              onClick={clearSignature}
              disabled={!hasSignature}
              className="px-4 py-3 bg-neutral-background text-neutral-text-primary rounded-xl font-bold border-2 border-neutral-border hover:border-error touch-target transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RotateCcw size={18} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
          <button
            onClick={saveSignature}
            disabled={!hasSignature || strokeLength < 50}
            className="flex-1 gradient-success text-white py-4 rounded-xl font-bold text-lg touch-target-large shadow-xl hover:shadow-2xl-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-95 min-w-[140px]"
          >
            <Check size={24} />
            Save Signature
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-4 bg-neutral-background text-neutral-text-primary rounded-xl font-bold border-2 border-neutral-border hover:border-primary touch-target-large transition-all"
              aria-label="Cancel"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

