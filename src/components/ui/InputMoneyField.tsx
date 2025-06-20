import React from 'react';
import { CurrencyDollarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Input from './Input';

interface InputMoneyFieldProps {
  /** The label text for the input field */
  label: string;
  /** Whether the field is required (shows red asterisk) */
  required?: boolean;
  /** The current value of the input */
  value: string | number | undefined;
  /** Callback when the input value changes */
  onChange: (value: string) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Error message to display */
  error?: string;
  /** Helper text to display below the input */
  helperText?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the wrapper div */
  className?: string;
  /** Additional CSS classes for the input element */
  inputClassName?: string;
  /** Grid column span classes (e.g., 'md:col-span-2') */
  colSpan?: string;
  /** Auto-complete attribute */
  autoComplete?: string;
  /** Minimum value for the money input */
  min?: number;
  /** Maximum value for the money input */
  max?: number;
  /** Step value for the money input (defaults to 0.01) */
  step?: number;
  /** Auto-focus the input when rendered */
  autoFocus?: boolean;
  /** Currency symbol to display (defaults to '$') */
  currencySymbol?: string;
  /** Currency position - before or after the input */
  currencyPosition?: 'before' | 'after';
  /** Custom currency icon component */
  currencyIcon?: React.ComponentType<{ className?: string }>;
  /** Whether to show error icon alongside error text */
  showErrorIcon?: boolean;
}

/**
 * InputMoneyField - A specialized input field component for monetary values
 * 
 * Features:
 * - Currency symbol or icon display
 * - Consistent styling with InputTextField component
 * - Built on top of the existing Input component
 * - Error handling with conditional border colors and error messages
 * - Helper text support
 * - Flexible grid column spanning
 * - Number input validation
 * - Full TypeScript support
 * 
 * Usage:
 * ```tsx
 * <InputMoneyField
 *   label="List Price"
 *   required
 *   value={formData.listPrice}
 *   onChange={(value) => handleInputChange('listPrice', value)}
 *   placeholder="0.00"
 *   error={errors.listPrice}
 *   currencySymbol="$"
 *   min={0}
 *   step={0.01}
 * />
 * ```
 */
export const InputMoneyField: React.FC<InputMoneyFieldProps> = ({
  label,
  required = false,
  value,
  onChange,
  placeholder = '0.00',
  error,
  helperText,
  disabled = false,
  className = '',
  inputClassName = '',
  colSpan = '',
  autoComplete,
  min = 0,
  max,
  step = 0.01,
  autoFocus = false,
  currencySymbol = '$',
  currencyPosition = 'before',
  currencyIcon,
  showErrorIcon = true,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const wrapperClasses = [
    colSpan,
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'w-full',
    error ? 'border-red-300' : 'border-gray-300',
    currencyPosition === 'before' ? 'pl-10' : 'pr-10',
    inputClassName
  ].filter(Boolean).join(' ');

  const CurrencyIconComponent = currencyIcon || CurrencyDollarIcon;

  return (
    <div className={wrapperClasses}>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <Input
          type="number"
          value={value ?? ''}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          autoComplete={autoComplete}
          min={min}
          max={max}
          step={step}
          autoFocus={autoFocus}
        />
        
        {/* Currency Symbol/Icon - Positioned to align with input field center */}
        {currencyPosition === 'before' && (
          <div className="absolute left-4 top-[0.90rem] flex items-center justify-center z-10 pointer-events-none">
            {currencyIcon ? (
              <CurrencyIconComponent className="h-4 w-4 text-slate-400" />
            ) : (
              <span className="text-slate-400 font-medium text-sm">{currencySymbol}</span>
            )}
          </div>
        )}
        
        {currencyPosition === 'after' && (
          <div className="absolute right-4 top-[0.75rem] flex items-center justify-center z-10 pointer-events-none">
            {currencyIcon ? (
              <CurrencyIconComponent className="h-4 w-4 text-slate-400" />
            ) : (
              <span className="text-slate-400 font-medium text-sm">{currencySymbol}</span>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          {showErrorIcon && <ExclamationTriangleIcon className="h-4 w-4 mr-1" />}
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default InputMoneyField;
