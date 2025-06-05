import React from 'react';
import { cn } from '../../utils/cn';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';

interface AlertProps {
  variant?: 'error' | 'warning' | 'success' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

const alertVariants = {
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-400',
    title: 'text-red-800',
    content: 'text-red-600',
    iconComponent: XCircleIcon
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-400',
    title: 'text-amber-800',
    content: 'text-amber-600',
    iconComponent: ExclamationTriangleIcon
  },
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-400',
    title: 'text-green-800',
    content: 'text-green-600',
    iconComponent: CheckCircleIcon
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-400',
    title: 'text-blue-800',
    content: 'text-blue-600',
    iconComponent: InformationCircleIcon
  }
};

export const Alert: React.FC<AlertProps> = ({ 
  variant = 'info', 
  title, 
  children, 
  className,
  onClose 
}) => {
  const styles = alertVariants[variant];
  const IconComponent = styles.iconComponent;

  return (
    <div className={cn(
      'border rounded-2xl p-4',
      styles.container,
      className
    )}>
      <div className="flex">
        <IconComponent className={cn('h-5 w-5 flex-shrink-0', styles.icon)} />
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={cn('text-sm font-medium', styles.title)}>
              {title}
            </h3>
          )}
          <div className={cn('text-sm', title ? 'mt-1' : '', styles.content)}>
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              'ml-3 flex-shrink-0 p-1 rounded-md hover:bg-opacity-20 hover:bg-current',
              styles.icon
            )}
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
