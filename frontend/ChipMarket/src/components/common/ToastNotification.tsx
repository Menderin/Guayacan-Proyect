// src/components/common/ToastNotification.tsx

import React, { useEffect } from 'react';
import '../../styles/ToastNotification.css';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export const ToastNotification: React.FC<ToastProps> = ({ 
  message, 
  onClose, 
  duration = 3000 
}) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="toast-notification">
      <span>{message}</span>
      <button onClick={onClose} className="toast-close-btn">
        &times;
      </button>
    </div>
  );
};