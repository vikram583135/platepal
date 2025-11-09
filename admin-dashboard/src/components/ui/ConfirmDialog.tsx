'use client';

import { useState } from 'react';
import Modal from './Modal';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'warning' | 'danger' | 'success' | 'info';
  showNotes?: boolean;
  requireNotes?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  showNotes = false,
  requireNotes = false,
}: ConfirmDialogProps) {
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    if (requireNotes && !notes.trim()) {
      return;
    }
    onConfirm(showNotes ? notes : undefined);
    setNotes('');
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  const variantStyles = {
    warning: {
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
    },
    danger: {
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
    },
    success: {
      icon: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
    },
    info: {
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <ExclamationTriangleIcon className={`h-6 w-6 ${styles.icon} flex-shrink-0 mt-0.5`} />
          <p className="text-text-primary">{message}</p>
        </div>

        {showNotes && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {requireNotes ? 'Notes *' : 'Notes (optional)'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes..."
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              required={requireNotes}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={requireNotes && !notes.trim()}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${styles.button} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

