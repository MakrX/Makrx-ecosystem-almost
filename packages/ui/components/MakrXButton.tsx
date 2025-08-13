import React from 'react';
import { cn } from '../utils/cn';

interface MakrXButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function MakrXButton({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className,
  ...props 
}: MakrXButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 justify-center';
  
  const variantStyles = {
    primary: 'bg-[#FFC107] text-[#1A3D7C] hover:shadow-xl hover:shadow-[#FFC107]/30 hover:scale-105',
    secondary: 'bg-[#1A3D7C] text-white hover:shadow-xl hover:shadow-[#1A3D7C]/30 hover:scale-105',
    ghost: 'bg-transparent border border-white/20 text-white hover:bg-white/10'
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
