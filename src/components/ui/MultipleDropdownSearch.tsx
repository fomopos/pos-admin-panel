import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, MagnifyingGlassIcon, FolderIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

export interface MultipleDropdownSearchOption {
  id: string;
  label: string;
  description?: string;
  level?: number;
  icon?: ReactNode;
  data?: any; // For storing additional data
}

export interface MultipleDropdownSearchProps {
  // Core props
  label: string;
  values?: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  
  // Options and filtering
  options: MultipleDropdownSearchOption[];
  onSearch?: (query: string) => void;
  onSelect: (selectedValues: string[]) => void;
  
  // Display customization
  displayValue?: (selectedOptions: MultipleDropdownSearchOption[]) => string | ReactNode;
  renderOption?: (option: MultipleDropdownSearchOption, isSelected: boolean) => ReactNode;
  noOptionsMessage?: string;
  clearSearchText?: string;
  allowSelectAll?: boolean;
  selectAllLabel?: string;
  clearAllLabel?: string;
  
  // Styling
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  
  // Behavior
  autoFocus?: boolean;
  maxHeight?: string;
  maxSelectedDisplay?: number;
}

/**
 * MultipleDropdownSearch - A reusable multi-select searchable dropdown component
 * 
 * Features:
 * - Multi-select functionality with checkboxes
 * - Searchable options with filtering
 * - Select All / Clear All functionality
 * - Custom option rendering
 * - Keyboard navigation support
 * - Flexible styling options
 * - Selected items display with badges
 */
export const MultipleDropdownSearch: React.FC<MultipleDropdownSearchProps> = ({
  label,
  values = [],
  placeholder,
  searchPlaceholder,
  required = false,
  error,
  disabled = false,
  options,
  onSearch,
  onSelect,
  displayValue,
  renderOption,
  noOptionsMessage,
  clearSearchText,
  allowSelectAll = true,
  selectAllLabel,
  clearAllLabel,
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  autoFocus = true,
  maxHeight = "min(400px, 60vh)",
  maxSelectedDisplay = 3
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOptions = options.filter(opt => values.includes(opt.id));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Filter options based on search query
  const filteredOptions = searchQuery.trim() 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (option.description && option.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options;

  const handleToggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery(''); // Reset search when opening
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleToggleOption = (optionId: string) => {
    const newValues = values.includes(optionId)
      ? values.filter(id => id !== optionId)
      : [...values, optionId];
    onSelect(newValues);
  };

  const handleSelectAll = () => {
    const allOptionIds = filteredOptions.map(opt => opt.id);
    const newValues = [...new Set([...values, ...allOptionIds])];
    onSelect(newValues);
  };

  const handleClearAll = () => {
    onSelect([]);
  };

  const removeSelectedOption = (optionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    handleToggleOption(optionId);
  };

  const getDisplayValue = () => {
    if (displayValue) {
      return displayValue(selectedOptions);
    }
    
    if (selectedOptions.length === 0) {
      return placeholder || t('common.selectOption');
    }
    
    if (selectedOptions.length <= maxSelectedDisplay) {
      return selectedOptions.map(opt => opt.label).join(', ');
    }
    
    return `${selectedOptions.slice(0, maxSelectedDisplay).map(opt => opt.label).join(', ')} (+${selectedOptions.length - maxSelectedDisplay} more)`;
  };

  const renderDisplayValue = () => {
    const displayContent = getDisplayValue();
    
    // If displayValue returns a React component/element, render it directly
    if (React.isValidElement(displayContent)) {
      return (
        <div className="flex items-center gap-2 truncate text-sm text-gray-900">
          {displayContent}
        </div>
      );
    }
    
    // Show selected items as badges
    if (selectedOptions.length > 0 && selectedOptions.length <= maxSelectedDisplay) {
      return (
        <div className="flex items-center gap-1 flex-wrap min-h-[20px]">
          {selectedOptions.map(option => (
            <span
              key={option.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
            >
              {option.label}
              <button
                type="button"
                onClick={(e) => removeSelectedOption(option.id, e)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      );
    }
    
    // If displayValue returns a string or no options selected, render as text
    return (
      <span className={`truncate text-sm ${selectedOptions.length > 0 ? 'text-gray-900' : 'text-slate-400'}`}>
        {displayContent}
      </span>
    );
  };

  const renderDefaultOption = (option: MultipleDropdownSearchOption, isSelected: boolean) => (
    <div className="flex items-center w-full">
      {/* Checkbox */}
      <div className="flex items-center mr-3">
        <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
          isSelected 
            ? 'bg-blue-500 border-blue-500' 
            : 'border-gray-300 hover:border-blue-400'
        }`}>
          {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
        </div>
      </div>
      
      {/* Option content */}
      {option.icon ? (
        <div className="mr-2 flex-shrink-0">
          {option.icon}
        </div>
      ) : (
        <FolderIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{option.label}</div>
        {option.description && (
          <div className="text-xs text-gray-500 truncate mt-0.5">{option.description}</div>
        )}
      </div>
      {option.level !== undefined && option.level > 0 && (
        <div className="text-xs text-gray-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Level {option.level + 1}
        </div>
      )}
    </div>
  );

  const allFilteredSelected = filteredOptions.length > 0 && filteredOptions.every(opt => values.includes(opt.id));

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Dropdown Container */}
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={handleToggleDropdown}
          disabled={disabled}
          className={`w-full flex items-center justify-between px-4 py-3 min-h-[48px] border border-slate-200 bg-slate-50 rounded-lg hover:border-blue-300 transition-all duration-200 ${
            isOpen ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-500'
          } ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          } ${
            error ? 'border-red-500 focus-visible:ring-red-500' : ''
          } ${buttonClassName}`}
        >
          <div className="flex-1 min-w-0">
            {renderDisplayValue()}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {selectedOptions.length > 0 && (
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                {selectedOptions.length}
              </span>
            )}
            <ChevronDownIcon 
              className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </button>

        {/* Error Message */}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        {/* Dropdown Menu */}
        {isOpen && (
          <div 
            className={`absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg ${dropdownClassName}`}
            style={{ 
              maxHeight: maxHeight,
              minWidth: '100%'
            }}
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder || t('common.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  autoFocus={autoFocus}
                />
              </div>
              
              {/* Select All / Clear All Actions */}
              {allowSelectAll && filteredOptions.length > 0 && (
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    disabled={allFilteredSelected}
                    className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {selectAllLabel || t('common.selectAll')}
                  </button>
                  {selectedOptions.length > 0 && (
                    <>
                      <span className="text-xs text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        {clearAllLabel || t('common.clearAll')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Options List */}
            <div className="overflow-y-auto" style={{ maxHeight: 'min(280px, 45vh)' }}>
              {/* Filtered Options */}
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = values.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleToggleOption(option.id)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center group ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                      style={{ 
                        paddingLeft: option.level !== undefined ? `${16 + option.level * 20}px` : '16px' 
                      }}
                    >
                      {renderOption ? renderOption(option, isSelected) : renderDefaultOption(option, isSelected)}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  {searchQuery.trim() ? (
                    <>
                      <MagnifyingGlassIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p>No options found matching "{searchQuery}"</p>
                      <button
                        type="button"
                        onClick={() => handleSearchChange('')}
                        className="text-blue-500 hover:text-blue-600 text-sm mt-1"
                      >
                        {clearSearchText || t('common.clearSearch')}
                      </button>
                    </>
                  ) : (
                    <>
                      <FolderIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p>{noOptionsMessage || t('common.noOptionsAvailable')}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultipleDropdownSearch;
