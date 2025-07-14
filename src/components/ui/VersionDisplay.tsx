import React from 'react';
import { getVersion } from '../../utils/version';

interface VersionDisplayProps {
  className?: string;
  showPrefix?: boolean;
  style?: 'badge' | 'text' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
}

const VersionDisplay: React.FC<VersionDisplayProps> = ({ 
  className = '',
  showPrefix = true,
  style = 'subtle',
  size = 'sm'
}) => {
  const version = getVersion();
  
  const getStyleClasses = () => {
    const baseClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    };

    const styleClasses = {
      badge: 'inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium',
      text: 'font-mono text-gray-600',
      subtle: 'text-gray-400 font-mono'
    };

    return `${baseClasses[size]} ${styleClasses[style]}`;
  };

  return (
    <span className={`${getStyleClasses()} ${className}`}>
      {showPrefix && 'v'}{version}
    </span>
  );
};

export default VersionDisplay;
