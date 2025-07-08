import React from 'react';
import { Card } from '../ui';

interface TenderWidgetProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export const TenderWidget: React.FC<TenderWidgetProps> = ({
  title,
  description,
  icon: Icon,
  children,
  className = '',
  headerActions
}) => {
  return (
    <Card className={`${className.includes('overflow-visible') ? 'overflow-visible' : 'overflow-hidden'} ${className}`}>
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
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
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </Card>
  );
};

export default TenderWidget;
