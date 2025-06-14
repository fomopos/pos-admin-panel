import React from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;
  subtitle?: string;
  format?: 'currency' | 'percentage' | 'number' | 'time' | 'rating';
  prefix?: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  alert?: 'warning' | 'success' | 'error' | 'info';
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-100',
  subtitle,
  format = 'number',
  prefix,
  suffix,
  size = 'md',
  alert,
  loading = false,
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'time':
        return `${val} min`;
      case 'rating':
        return `${val.toFixed(1)}/5`;
      default:
        return val.toLocaleString();
    }
  };

  const getAlertIcon = () => {
    switch (alert) {
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'info':
        return <ClockIcon className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getChangeColor = () => {
    if (!change) return 'text-slate-500';
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-slate-500';
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const titleSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const valueSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  if (loading) {
    return (
      <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${sizeClasses[size]}`}>
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
            {alert && <div className="w-4 h-4 bg-slate-200 rounded-full"></div>}
          </div>
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 ${sizeClasses[size]}`}>
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div className={`inline-flex items-center justify-center w-12 h-12 ${iconBg} rounded-2xl`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
        {alert && getAlertIcon()}
      </div>

      <div className="space-y-2">
        <h3 className={`font-semibold text-slate-900 ${titleSizeClasses[size]}`}>
          {title}
        </h3>
        
        <div className="flex items-baseline space-x-2">
          {prefix && <span className="text-sm text-slate-500">{prefix}</span>}
          <span className={`font-bold text-slate-900 ${valueSizeClasses[size]}`}>
            {formatValue(value)}
          </span>
          {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
        </div>

        {change !== undefined && (
          <div className="flex items-center space-x-1">
            {trend === 'up' && <ArrowUpIcon className="w-4 h-4 text-green-600" />}
            {trend === 'down' && <ArrowDownIcon className="w-4 h-4 text-red-600" />}
            <span className={`text-sm font-medium ${getChangeColor()}`}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
            <span className="text-sm text-slate-500">vs last period</span>
          </div>
        )}

        {subtitle && (
          <p className="text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default KPICard;
