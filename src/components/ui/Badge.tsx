import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'orange' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  color = 'gray',
  size = 'md',
  className 
}) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        colorClasses[color],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export { Badge };
export type { BadgeProps };
