import React from 'react';
import { Card } from './Card';

interface WidgetProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: {
    header: 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  primary: {
    header: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  success: {
    header: 'bg-gradient-to-r from-green-50 to-green-100 border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  warning: {
    header: 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600'
  },
  danger: {
    header: 'bg-gradient-to-r from-red-50 to-red-100 border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600'
  }
};

const sizeStyles = {
  sm: {
    header: 'px-3 py-2',
    content: 'p-3',
    icon: 'w-6 h-6',
    iconSize: 'h-3 w-3',
    title: 'text-base font-medium',
    description: 'text-xs'
  },
  md: {
    header: 'px-4 sm:px-6 py-4',
    content: 'p-4 sm:p-6',
    icon: 'w-8 h-8',
    iconSize: 'h-4 w-4',
    title: 'text-lg font-semibold',
    description: 'text-sm'
  },
  lg: {
    header: 'px-6 py-5',
    content: 'p-6',
    icon: 'w-10 h-10',
    iconSize: 'h-5 w-5',
    title: 'text-xl font-semibold',
    description: 'text-base'
  }
};

export const Widget: React.FC<WidgetProps> = ({
  title,
  description,
  icon: Icon,
  children,
  className = '',
  headerActions,
  variant = 'default',
  size = 'md'
}) => {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Card className={`${className.includes('overflow-visible') ? 'overflow-visible' : 'overflow-hidden'} ${className}`}>
      <div className={`${sizeStyle.header} ${variantStyle.header} border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className={`flex-shrink-0 ${sizeStyle.icon} ${variantStyle.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className={`${sizeStyle.iconSize} ${variantStyle.iconColor}`} />
              </div>
            )}
            <div>
              <h3 className={`${sizeStyle.title} text-gray-900`}>{title}</h3>
              {description && (
                <p className={`${sizeStyle.description} text-gray-600 mt-1`}>{description}</p>
              )}
            </div>
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      </div>
      <div className={sizeStyle.content}>
        {children}
      </div>
    </Card>
  );
};

export default Widget;
