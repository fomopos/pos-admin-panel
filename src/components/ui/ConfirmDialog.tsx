import React from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import { cn } from '../../utils/cn';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const variantStyles = {
  danger: {
    icon: 'text-red-600',
    iconBg: 'bg-red-100',
    confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
  },
  warning: {
    icon: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
  },
  info: {
    icon: 'text-blue-600',
    iconBg: 'bg-blue-100',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
  }
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const styles = variantStyles[variant];
  const IconComponent = variant === 'info' ? InformationCircleIcon : ExclamationTriangleIcon;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Enhanced Backdrop with blur and gradient */}
      <div 
        className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleBackdropClick}
      >
        {/* Backdrop with enhanced blur and gradient effect */}
        <div 
          className="fixed inset-0 bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-gray-900/60 backdrop-blur-md transition-all duration-300 ease-out"
          style={{
            background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%)',
            backdropFilter: 'blur(16px) saturate(150%)',
            WebkitBackdropFilter: 'blur(16px) saturate(150%)'
          }}
          aria-hidden="true"
        />

        {/* Animated overlay pattern */}
        <div 
          className="fixed inset-0 opacity-20 animate-pulse"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)`
          }}
          aria-hidden="true"
        />

        {/* Center positioning trick */}
        <span 
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal panel with enhanced styling and stronger blur */}
        <div className="relative inline-block align-bottom bg-white/90 backdrop-blur-xl rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all duration-300 ease-out sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-white/30"
             style={{
               backdropFilter: 'blur(24px) saturate(180%)',
               WebkitBackdropFilter: 'blur(24px) saturate(180%)',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
             }}>
          {/* Enhanced close button */}
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white/80 backdrop-blur-md rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 p-1.5 border border-gray-200/60 shadow-md"
              onClick={onClose}
              disabled={isLoading}
              style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            {/* Enhanced icon with glassmorphism effect */}
            <div className={cn(
              'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl sm:mx-0 sm:h-10 sm:w-10 backdrop-blur-sm border border-white/20 shadow-lg',
              styles.iconBg
            )}
            style={{
              background: `linear-gradient(135deg, ${styles.iconBg.includes('red') ? 'rgba(254, 226, 226, 0.9)' : 
                                                     styles.iconBg.includes('yellow') ? 'rgba(254, 243, 199, 0.9)' : 
                                                     'rgba(219, 234, 254, 0.9)'} 0%, rgba(255, 255, 255, 0.3) 100%)`,
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)'
            }}>
              <IconComponent 
                className={cn('h-6 w-6', styles.icon)} 
                aria-hidden="true" 
              />
            </div>

            {/* Content with improved typography */}
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 
                className="text-lg leading-6 font-semibold text-gray-900 mb-2 tracking-tight"
                id="modal-title"
              >
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced actions with glassmorphism */}
          <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                'w-full sm:w-auto text-white border-transparent backdrop-blur-md shadow-lg transition-all duration-200 hover:shadow-xl',
                styles.confirmButton
              )}
              style={{
                background: variant === 'danger' ? 
                  'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' :
                  variant === 'warning' ?
                  'linear-gradient(135deg, #d97706 0%, #b45309 100%)' :
                  'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="font-medium">Loading...</span>
                </>
              ) : (
                <span className="font-medium">{confirmText}</span>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto mt-3 sm:mt-0 bg-white/80 backdrop-blur-md border-gray-300/60 text-gray-700 hover:bg-white/95 hover:border-gray-400/70 transition-all duration-200 shadow-md"
              style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              <span className="font-medium">{cancelText}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
