import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
}

export const Input: React.FC<InputProps> = ({ 
  className, 
  variant = 'default',
  ...props 
}) => {
  const variantClasses = {
    default: 'border-gray-200 focus:border-blue-500 focus:ring-blue-100',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-100',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-100',
  };

  return (
    <input
      className={cn(
        'w-full px-4 py-3 border-2 rounded-xl',
        'focus:ring-4 focus:outline-none transition-all',
        'text-gray-800 placeholder-gray-400',
        'disabled:bg-gray-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
};
