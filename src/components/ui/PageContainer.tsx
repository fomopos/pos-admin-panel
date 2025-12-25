import React from 'react';
import { cn } from '../../utils/cn';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'minimal' | 'gradient' | 'solid';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

/**
 * PageContainer Component
 * 
 * Provides consistent background styling and spacing across all pages in the application.
 * 
 * @example
 * // Default gradient background with medium spacing
 * <PageContainer>
 *   <PageHeader title="My Page" />
 *   <div>Content here</div>
 * </PageContainer>
 * 
 * @example
 * // Minimal white background
 * <PageContainer variant="minimal" spacing="sm">
 *   <Content />
 * </PageContainer>
 * 
 * @example
 * // Custom styling
 * <PageContainer className="max-w-4xl mx-auto">
 *   <Content />
 * </PageContainer>
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  variant = 'default',
  spacing = 'md',
  fullHeight = true,
}) => {
  // Background variants
  const backgroundVariants = {
    // Default gradient background (blue tones)
    default: 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40',
    
    // Minimal white background
    minimal: 'bg-white',
    
    // Gray gradient background
    gradient: 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100',
    
    // Solid gray background
    solid: 'bg-gray-50',
  };

  // Spacing variants
  const spacingVariants = {
    none: '',
    sm: 'p-2 space-y-4',
    md: 'p-4 space-y-6',
    lg: 'p-6 space-y-8',
  };

  // Height class
  const heightClass = fullHeight ? 'min-h-screen' : '';

  return (
    <div
      className={cn(
        heightClass,
        backgroundVariants[variant],
        spacingVariants[spacing],
        className
      )}
    >
      {children}
    </div>
  );
};

PageContainer.displayName = 'PageContainer';

export default PageContainer;
