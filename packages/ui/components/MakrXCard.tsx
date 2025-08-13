import React from 'react';
import { cn } from '../utils/cn';

interface MakrXCardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
}

export function MakrXCard({ children, className, glass = true, hover = true }: MakrXCardProps) {
  const baseStyles = 'rounded-xl p-6 transition-all duration-300';
  
  const glassStyles = glass 
    ? 'backdrop-blur-md border border-white/20 bg-white/10' 
    : 'bg-white/95 border border-gray-200';
    
  const hoverStyles = hover 
    ? 'hover:scale-105 hover:shadow-lg hover:shadow-[#FFC107]/20' 
    : '';

  return (
    <div className={cn(baseStyles, glassStyles, hoverStyles, className)}>
      {children}
    </div>
  );
}
