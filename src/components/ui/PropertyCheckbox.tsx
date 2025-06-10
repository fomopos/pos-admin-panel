import React from 'react';

interface PropertyCheckboxProps {
  /** The title/label for the checkbox */
  title: string;
  /** The description text shown below the title */
  description: string;
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Callback when the checkbox value changes */
  onChange: (checked: boolean) => void;
  /** Optional additional CSS classes */
  className?: string;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
}

/**
 * PropertyCheckbox - A reusable toggle switch component with title and description
 * 
 * Features:
 * - Modern toggle switch design with smooth animations
 * - Title and description labels
 * - Responsive layout (stacks on small screens)
 * - Accessible with proper focus states
 * - Consistent styling across the application
 */
export const PropertyCheckbox: React.FC<PropertyCheckboxProps> = ({
  title,
  description,
  checked,
  onChange,
  className = '',
  disabled = false
}) => {
  return (
    <div className={`flex items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex-1 pr-4">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">
          {description}
        </p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
      </label>
    </div>
  );
};

export default PropertyCheckbox;
