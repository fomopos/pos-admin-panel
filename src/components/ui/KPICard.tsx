import React from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { formattingService } from '../../services/formatting';

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
        return formattingService.formatCurrency(val, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
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
        return <ExclamationTriangleIcon className="w-3 h-3 text-amber-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />;
      case 'success':
        return <CheckCircleIcon className="w-3 h-3 text-emerald-500" />;
      case 'info':
        return <ClockIcon className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getChangeColor = () => {
    if (!change) return 'text-slate-400';
    if (trend === 'up') return 'text-emerald-600';
    if (trend === 'down') return 'text-red-500';
    return 'text-slate-400';
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  const titleSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const valueSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  if (loading) {
    return (
      <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${sizeClasses[size]}`}>
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 bg-slate-200 rounded-lg"></div>
            {alert && <div className="w-3 h-3 bg-slate-200 rounded-full"></div>}
          </div>
          <div className="h-3 bg-slate-200 rounded w-3/4 mb-3"></div>
          <div className="h-5 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div className="h-2 bg-slate-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative bg-gradient-to-br from-white to-slate-50/30 border border-slate-200/80 rounded-xl shadow-sm hover:shadow-md hover:shadow-slate-200/60 transition-all duration-300 hover:scale-[1.02] hover:border-slate-300/80 ${sizeClasses[size]} overflow-hidden`}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          {Icon && (
            <div className={`inline-flex items-center justify-center w-9 h-9 ${iconBg} rounded-lg shadow-sm group-hover:scale-110 transition-all duration-200 group-hover:shadow-md`}>
              <Icon className={`w-4 h-4 ${iconColor} transition-colors duration-200`} />
            </div>
          )}
          {alert && (
            <div className="animate-pulse">
              {getAlertIcon()}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className={`font-medium text-slate-600 tracking-wide uppercase ${titleSizeClasses[size]} group-hover:text-slate-700 transition-colors duration-200`}>
            {title}
          </h3>
          
          <div className="flex items-baseline space-x-1">
            {prefix && <span className="text-xs text-slate-400 font-medium">{prefix}</span>}
            <span className={`font-bold text-slate-900 ${valueSizeClasses[size]} tracking-tight group-hover:text-slate-800 transition-colors duration-200`}>
              {formatValue(value)}
            </span>
            {suffix && <span className="text-xs text-slate-400 font-medium">{suffix}</span>}
          </div>

          {change !== undefined && (
            <div className="flex items-center space-x-1">
              {trend === 'up' && <ArrowUpIcon className="w-3 h-3 text-emerald-500 animate-pulse" />}
              {trend === 'down' && <ArrowDownIcon className="w-3 h-3 text-red-500 animate-pulse" />}
              <span className={`text-xs font-semibold ${getChangeColor()}`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400">vs last period</span>
            </div>
          )}

          {subtitle && (
            <p className="text-xs text-slate-500 leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
