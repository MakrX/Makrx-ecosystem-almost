import React from 'react';
import { cn } from '../utils/cn';

interface MakrXLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
}

export const MakrXLoader: React.FC<MakrXLoaderProps> = ({ 
  size = 'md', 
  variant = 'spinner', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  if (variant === 'spinner') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div 
          className={cn(
            "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
            sizeClasses[size]
          )}
        />
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("animate-pulse bg-gray-300 rounded", sizeClasses[size], className)} />
    );
  }

  return null;
};

export default MakrXLoader;
