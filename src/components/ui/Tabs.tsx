import React from 'react';
import { cn } from '../../utils/cn';

interface TabItem {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
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
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
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
              value={tab.id}
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
  value, 
  children, 
  className, 
  disabled,
  onClick 
}) => {
  // This would typically get activeTab from context, but for simplicity we'll use props
  const isActive = false; // This should come from context in a real implementation
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors',
        'hover:text-slate-700 hover:border-slate-300',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
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
}

export const EnhancedTabs: React.FC<EnhancedTabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className,
  children 
}) => {
  return (
    <div className={cn('w-full bg-white border border-slate-200 rounded-2xl shadow-sm', className)}>
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8 overflow-x-auto px-6">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && onTabChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                )}
              >
                {IconComponent && <IconComponent className="h-5 w-5" />}
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Tabs;
