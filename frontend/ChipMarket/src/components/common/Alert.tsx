// src/components/common/Alert.tsx
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import '../../styles/Alert.css';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export default function Alert({ type, message }: AlertProps) {
  const styles = {
    success: {
      icon: CheckCircle
    },
    error: {
      icon: XCircle
    },
    warning: {
      icon: AlertCircle
    },
    info: {
      icon: Info
    }
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={`alert alert--${type}`}>
      <Icon className="alert__icon" />
      <p className="alert__message">{message}</p>
    </div>
  );
}