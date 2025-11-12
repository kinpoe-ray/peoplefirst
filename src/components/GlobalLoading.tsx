import React from 'react';
import { Loader2 } from 'lucide-react';

interface GlobalLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function GlobalLoading({ message = '加载中...', size = 'md' }: GlobalLoadingProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4 max-w-sm mx-4">
        <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
        <p className="text-gray-700 text-center">{message}</p>
      </div>
    </div>
  );
}