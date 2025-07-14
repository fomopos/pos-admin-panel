import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface InputTextAreaProps {
  /** The label text for the textarea field */
  label: string;
  /** Whether the field is required (shows red asterisk) */
  required?: boolean;
  /** The current value of the textarea */
  value: string | undefined;
  /** Callback when the textarea value changes */
  onChange: (value: string) => void;
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Error message to display */
  error?: string;
  /** Helper text to display below the textarea */
  helperText?: string;
  /** Whether the textarea is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the wrapper div */
  className?: string;
  /** Additional CSS classes for the textarea element */
  textareaClassName?: string;
  /** Grid column span classes (e.g., 'md:col-span-2') */
  colSpan?: string;
  /** Whether to show error icon alongside error text */
  showErrorIcon?: boolean;
  /** Auto-complete attribute */
  autoComplete?: string;
  /** Maximum length for text input */
  maxLength?: number;
  /** Number of visible text lines (rows) */
  rows?: number;
  /** Auto-focus the textarea when rendered */
  autoFocus?: boolean;
  /** Whether the textarea can be resized */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

/**
 * InputTextArea - A unified textarea component with consistent styling
 * 
 * Features:
 * - Consistent label styling with optional required indicator
 * - Error handling with conditional border colors and error messages
 * - Helper text support
 * - Flexible grid column spanning
 * - Consistent styling with InputTextField
 * - Icon support for error messages
 * - Configurable resize behavior
 * - Full TypeScript support
 * 
 * Usage:
 * ```tsx
 * <InputTextArea
 *   label="Description"
 *   required
 *   value={formData.description}
 *   onChange={(value) => handleInputChange('description', value)}
 *   placeholder="Enter detailed description"
 *   error={errors.description}
 *   rows={4}
 *   colSpan="md:col-span-2"
 * />
 * ```
 */
export const InputTextArea: React.FC<InputTextAreaProps> = ({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  disabled = false,
  className = '',
  textareaClassName = '',
  colSpan = '',
  showErrorIcon = true,
  autoComplete,
  maxLength,
  rows = 3,
  autoFocus = false,
  resize = 'vertical',
}) => {
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const wrapperClasses = [
    colSpan,
    className
  ].filter(Boolean).join(' ');

  const textareaClasses = [
    // Base styling consistent with InputTextField/Input component
    'flex w-full rounded-lg border px-4 py-3 text-sm placeholder:text-slate-400',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
    // Conditional styling based on error state
    error 
      ? 'border-red-500 bg-red-50 focus-visible:ring-red-500 focus-visible:border-red-500' 
      : 'border-slate-200 bg-slate-50 focus-visible:ring-blue-500 focus-visible:border-blue-500',
    // Resize behavior
    resize === 'none' ? 'resize-none' : 
    resize === 'vertical' ? 'resize-y' : 
    resize === 'horizontal' ? 'resize-x' : 'resize',
    textareaClassName
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        value={value ?? ''}
        onChange={handleTextareaChange}
        placeholder={placeholder}
        disabled={disabled}
        className={textareaClasses}
        autoComplete={autoComplete}
        maxLength={maxLength}
        rows={rows}
        autoFocus={autoFocus}
      />
      
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

export default InputTextArea;
