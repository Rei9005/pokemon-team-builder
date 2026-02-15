'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50
        min-w-[300px] max-w-[500px]
        px-4 py-3 rounded-lg shadow-lg
        flex items-center gap-3
        animate-slide-in
        ${getTypeStyles()}
      `}
    >
      <span className="text-xl font-bold">{getIcon()}</span>
      <p className="flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-xl hover:opacity-70 transition-opacity"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}