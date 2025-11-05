import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Input from './Input';

interface InputTextFieldProps {
  /** The label text for the input field */
  label: string;
  /** Whether the field is required (shows red asterisk) */
  required?: boolean;
  /** The input field type */
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
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
  /** Whether to show error icon alongside error text */
  showErrorIcon?: boolean;
  /** Auto-complete attribute */
  autoComplete?: string;
  /** Maximum length for text inputs */
  maxLength?: number;
  /** Minimum value for number inputs */
  min?: number;
  /** Maximum value for number inputs */
  max?: number;
  /** Step value for number inputs */
  step?: number;
  /** Auto-focus the input when rendered */
  autoFocus?: boolean;
  /** Prefix icon component to display on the left side */
  prefixIcon?: React.ComponentType<{ className?: string }>;
  /** Custom prefix text to display on the left side */
  prefixText?: string;
  /** Suffix icon component to display on the right side */
  suffixIcon?: React.ComponentType<{ className?: string }>;
  /** Custom suffix text to display on the right side */
  suffixText?: string;
}

/**
 * InputTextField - A unified input field component with consistent styling
 * 
 * Features:
 * - Consistent label styling with optional required indicator
 * - Error handling with conditional border colors and error messages
 * - Helper text support
 * - Flexible grid column spanning
 * - Built on top of the existing Input component
 * - Icon support for error messages
 * - Full TypeScript support
 * 
 * Usage:
 * ```tsx
 * <InputTextField
 *   label="Category Name"
 *   required
 *   value={formData.name}
 *   onChange={(value) => handleInputChange('name', value)}
 *   placeholder="Enter category name"
 *   error={errors.name}
 *   colSpan="md:col-span-2"
 * />
 * ```
 */
export const InputTextField: React.FC<InputTextFieldProps> = ({
  label,
  required = false,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  disabled = false,
  className = '',
  inputClassName = '',
  colSpan = '',
  showErrorIcon = true,
  autoComplete,
  maxLength,
  min,
  max,
  step,
  autoFocus = false,
  prefixIcon,
  prefixText,
  suffixIcon,
  suffixText,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const wrapperClasses = [
    colSpan,
    className
  ].filter(Boolean).join(' ');

  const hasPrefix = prefixIcon || prefixText;
  const hasSuffix = suffixIcon || suffixText;

  const inputClasses = [
    'w-full',
    error ? 'border-red-300' : 'border-gray-300',
    hasPrefix ? 'pl-10' : '',
    hasSuffix ? 'pr-10' : '',
    inputClassName
  ].filter(Boolean).join(' ');

  const PrefixIconComponent = prefixIcon;
  const SuffixIconComponent = suffixIcon;

  return (
    <div className={wrapperClasses}>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <Input
          type={type}
          value={value ?? ''}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          autoComplete={autoComplete}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          autoFocus={autoFocus}
        />
        
        {/* Prefix Icon/Text - Positioned to align with input field center */}
        {hasPrefix && (
          <div className="absolute left-3 top-[0.90rem] flex items-center justify-center z-10 pointer-events-none">
            {PrefixIconComponent ? (
              <PrefixIconComponent className="h-5 w-5 text-slate-400" />
            ) : (
              <span className="text-slate-400 font-medium text-sm">{prefixText}</span>
            )}
          </div>
        )}
        
        {/* Suffix Icon/Text - Positioned to align with input field center */}
        {hasSuffix && (
          <div className="absolute right-3 top-[0.90rem] flex items-center justify-center z-10 pointer-events-none">
            {SuffixIconComponent ? (
              <SuffixIconComponent className="h-5 w-5 text-slate-400" />
            ) : (
              <span className="text-slate-400 font-medium text-sm">{suffixText}</span>
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

export default InputTextField;
