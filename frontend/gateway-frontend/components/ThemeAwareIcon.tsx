import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ThemeAwareIconProps {
  icon: LucideIcon;
  className?: string;
  lightColor?: string;
  darkColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
};

export default function ThemeAwareIcon({
  icon: Icon,
  className = '',
  lightColor = 'text-gray-600',
  darkColor = 'text-gray-300',
  size = 'md'
}: ThemeAwareIconProps) {
  const baseClasses = `${sizeClasses[size]} ${lightColor} dark:${darkColor} transition-colors`;
  
  return <Icon className={`${baseClasses} ${className}`} />;
}

// Preset variants for common use cases
export function PrimaryIcon({ icon: Icon, className = '', size = 'md' }: Omit<ThemeAwareIconProps, 'lightColor' | 'darkColor'>) {
  return (
    <ThemeAwareIcon
      icon={Icon}
      className={className}
      lightColor="text-makrx-blue"
      darkColor="text-makrx-blue"
      size={size}
    />
  );
}

export function AccentIcon({ icon: Icon, className = '', size = 'md' }: Omit<ThemeAwareIconProps, 'lightColor' | 'darkColor'>) {
  return (
    <ThemeAwareIcon
      icon={Icon}
      className={className}
      lightColor="text-makrx-yellow"
      darkColor="text-makrx-yellow"
      size={size}
    />
  );
}

export function MutedIcon({ icon: Icon, className = '', size = 'md' }: Omit<ThemeAwareIconProps, 'lightColor' | 'darkColor'>) {
  return (
    <ThemeAwareIcon
      icon={Icon}
      className={className}
      lightColor="text-gray-400"
      darkColor="text-gray-500"
      size={size}
    />
  );
}

export function InteractiveIcon({ icon: Icon, className = '', size = 'md' }: Omit<ThemeAwareIconProps, 'lightColor' | 'darkColor'>) {
  return (
    <ThemeAwareIcon
      icon={Icon}
      className={`hover:text-makrx-blue dark:hover:text-makrx-yellow cursor-pointer ${className}`}
      lightColor="text-gray-600"
      darkColor="text-gray-300"
      size={size}
    />
  );
}
