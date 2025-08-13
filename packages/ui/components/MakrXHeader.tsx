import React from 'react';
import { cn } from '../utils/cn';

interface MakrXHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const MakrXHeader: React.FC<MakrXHeaderProps> = ({ 
  title, 
  subtitle, 
  actions, 
  className 
}) => {
  return (
    <header className={cn("flex items-center justify-between py-6", className)}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center space-x-4">
          {actions}
        </div>
      )}
    </header>
  );
};

export default MakrXHeader;
