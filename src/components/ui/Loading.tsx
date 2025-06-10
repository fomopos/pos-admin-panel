import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingProps {
  /** Loading message title */
  title?: string;
  /** Loading message description */
  description?: string;
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to take full screen height */
  fullScreen?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Color variant for the spinner */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20'
};

const variantClasses = {
  primary: 'border-blue-600',
  secondary: 'border-gray-600',
  success: 'border-green-600',
  warning: 'border-yellow-600',
  danger: 'border-red-600'
};

const titleSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

const descriptionSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

export const Loading: React.FC<LoadingProps> = ({
  title = 'Loading',
  description = 'Please wait...',
  size = 'lg',
  fullScreen = true,
  className,
  variant = 'primary'
}) => {
  const containerClasses = cn(
    'flex items-center justify-center',
    fullScreen ? 'min-h-screen bg-gray-50' : 'py-12',
    className
  );

  const spinnerClasses = cn(
    'animate-spin rounded-full border-b-4 mx-auto mb-4',
    sizeClasses[size],
    variantClasses[variant]
  );

  const titleClasses = cn(
    'font-medium text-gray-900 mb-2',
    titleSizeClasses[size]
  );

  const descriptionClasses = cn(
    'text-gray-500',
    descriptionSizeClasses[size]
  );

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={spinnerClasses}></div>
        <h3 className={titleClasses}>{title}</h3>
        <p className={descriptionClasses}>{description}</p>
      </div>
    </div>
  );
};

export default Loading;
