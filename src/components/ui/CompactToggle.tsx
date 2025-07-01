import React from 'react';

interface CompactToggleProps {
  /** The label text displayed above the toggle */
  label: string;
  /** The inline label text next to the toggle switch */
  inlineLabel?: string;
  /** Helper text displayed below the toggle */
  helperText?: string;
  /** Whether the toggle is checked */
  checked: boolean;
  /** Callback when the toggle value changes */
  onChange: (checked: boolean) => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Whether the field is required */
  required?: boolean;
}

/**
 * CompactToggle - A compact toggle switch component that matches InputTextField height
 * 
 * Features:
 * - Matches InputTextField height (40px) for grid layout consistency
 * - Toggle switch with smooth animations
 * - Optional inline label next to the switch
 * - Helper text below for additional context
 * - Proper focus states and accessibility
 * - Disabled state support
 * - Consistent styling with form inputs
 */
export const CompactToggle: React.FC<CompactToggleProps> = ({
  label,
  inlineLabel,
  helperText,
  checked,
  onChange,
  disabled = false,
  className = '',
  required = false
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {/* Main label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Toggle container with InputTextField-like styling */}
      <div className="flex items-center h-12 px-3 border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <label className="relative inline-flex items-center cursor-pointer flex-1">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
          />
          
          {/* Toggle switch */}
          <div className={`w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
          
          {/* Inline label */}
          {inlineLabel && (
            <span className="ml-3 text-sm text-gray-700">
              {inlineLabel}
            </span>
          )}
        </label>
      </div>
      
      {/* Helper text */}
      {helperText && (
        <p className="text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default CompactToggle;
