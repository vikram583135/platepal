'use client';

import Modal from '@/components/Modal';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const variantClasses = {
    danger: 'bg-error text-white hover:bg-error/90',
    warning: 'bg-warning text-white hover:bg-warning/90',
    info: 'bg-info text-white hover:bg-info/90',
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const iconColors = {
    danger: 'text-error',
    warning: 'text-warning',
    info: 'text-info',
  };

  const footer = (
    <div className="flex items-center justify-end space-x-3">
      <button
        onClick={onClose}
        disabled={isLoading}
        className="px-4 py-2 text-text-primary bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cancelText}
      </button>
      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]}`}
      >
        {isLoading ? 'Processing...' : confirmText}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm" showCloseButton={false}>
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 ${iconColors[variant]}`}>
          <ExclamationTriangleIcon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>
          <p className="text-text-secondary">{message}</p>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        {footer}
      </div>
    </Modal>
  );
}

