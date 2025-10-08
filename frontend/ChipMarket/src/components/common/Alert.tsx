// src/components/Alert.tsx
import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error';
  message: string;
}

export default function Alert({ type, message }: AlertProps) {
  return (
    <div className={`flex items-center gap-2 p-4 rounded-lg mb-6 ${
      type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
    }`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span className="text-sm">{message}</span>
    </div>
  );
}