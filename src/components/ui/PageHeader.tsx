import React from 'react';
import { cn } from '../../utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  children, 
  className 
}) => {
  return (
    <div className={cn('flex items-center justify-between mb-8', className)}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        {description && (
          <p className="text-slate-500 mt-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center space-x-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
