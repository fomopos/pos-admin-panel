import React from 'react';
import { cn } from '../../utils/cn';

interface TabItem {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  hasError?: boolean; // Add error indicator support
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

interface TabsContentProps {
  value: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

// Main Tabs component - simplified API for common use cases
export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, className }) => {
  return (
    <div className={cn('w-full', className)}>
      <TabsList>
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              isActive={activeTab === tab.id}
              disabled={tab.disabled}
              onClick={() => onTabChange(tab.id)}
            >
              {IconComponent && <IconComponent className="h-5 w-5 mr-2" />}
              {tab.name}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
};

// Composable Tabs components for more complex use cases
export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <div className={cn(
      'flex space-x-8 overflow-x-auto px-6 border-b border-slate-200',
      className
    )}>
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  children, 
  className, 
  disabled,
  isActive = false,
  onClick 
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors',
        'hover:text-slate-700 hover:border-slate-300',
        'focus:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isActive
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-slate-500',
        className
      )}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({ 
  value, 
  activeTab, 
  children, 
  className 
}) => {
  if (value !== activeTab) return null;
  
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
};

// Enhanced Tabs component with built-in content management
interface EnhancedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  children: React.ReactNode;
  allowOverflow?: boolean; // Add option to control overflow behavior
}

export const EnhancedTabs: React.FC<EnhancedTabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className,
  children,
  allowOverflow = false // Default to false to maintain existing behavior
}) => {
  return (
    <div className={cn(
      'w-full', 
      allowOverflow ? 'overflow-visible' : 'overflow-hidden', 
      className
    )}>
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <nav className="flex overflow-x-auto px-4">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            const hasError = tab.hasError;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => !tab.disabled && onTabChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  'relative whitespace-nowrap py-3 px-4 font-medium text-sm flex items-center space-x-2',
                  'transition-all duration-200 ease-in-out',
                  'focus:outline-none',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'hover:text-primary-600',
                  isActive
                    ? 'text-primary-600 border-b-2 border-primary-500'
                    : hasError
                    ? 'text-red-600 border-b-2 border-red-400 hover:border-red-500'
                    : 'text-slate-600 border-b-2 border-transparent hover:border-slate-300'
                )}
              >
                {IconComponent && (
                  <IconComponent 
                    className={cn(
                      'h-4 w-4 transition-colors duration-200',
                      isActive 
                        ? 'text-primary-500' 
                        : hasError 
                        ? 'text-red-500' 
                        : 'text-slate-400'
                    )} 
                  />
                )}
                <span className="relative flex items-center space-x-1">
                  <span>{tab.name}</span>
                  {hasError && !isActive && (
                    <span className="inline-flex items-center justify-center w-2 h-2 bg-red-500 rounded-full">
                      <span className="sr-only">Has validation errors</span>
                    </span>
                  )}
                </span>
                {isActive && (
                  <div className={cn(
                    "absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full",
                    hasError ? "bg-red-500" : "bg-primary-500"
                  )} />
                )}
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="bg-transparent pt-6">
        {children}
      </div>
    </div>
  );
};

export default Tabs;
