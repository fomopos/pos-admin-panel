import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, MagnifyingGlassIcon, FolderIcon } from '@heroicons/react/24/outline';

export interface DropdownSearchOption {
  id: string;
  label: string;
  description?: string;
  level?: number;
  icon?: ReactNode;
  data?: any; // For storing additional data
}

export interface DropdownSearchProps {
  // Core props
  label: string;
  value?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  
  // Options and filtering
  options: DropdownSearchOption[];
  onSearch?: (query: string) => void;
  onSelect: (option: DropdownSearchOption | null) => void;
  
  // Display customization
  displayValue?: (option: DropdownSearchOption | null) => string | ReactNode;
  renderOption?: (option: DropdownSearchOption) => ReactNode;
  noOptionsMessage?: string;
  clearSearchText?: string;
  allowClear?: boolean;
  clearLabel?: string;
  
  // Styling
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  
  // Behavior
  closeOnSelect?: boolean;
  autoFocus?: boolean;
  maxHeight?: string;
}

/**
 * DropdownSearch - A reusable searchable dropdown component
 * 
 * Features:
 * - Searchable options with filtering
 * - Hierarchical display support (with levels)
 * - Custom option rendering
 * - Keyboard navigation support
 * - Flexible styling options
 * - Clear/reset functionality
 */
export const DropdownSearch: React.FC<DropdownSearchProps> = ({
  label,
  value,
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
  allowClear = true,
  clearLabel,
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  closeOnSelect = true,
  autoFocus = true,
  maxHeight = "min(400px, 60vh)"
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  
  const selectedOption = options.find(opt => opt.id === value) || null;

  // Calculate dropdown position based on trigger button
  const updateMenuPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8, // 8px gap (mt-2 equivalent)
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
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

  // Update position on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [isOpen, updateMenuPosition]);

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

  const handleSelectOption = (option: DropdownSearchOption | null) => {
    onSelect(option);
    if (closeOnSelect) {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const getDisplayValue = () => {
    if (displayValue) {
      return displayValue(selectedOption);
    }
    return selectedOption?.label || placeholder || t('common.selectOption');
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
    
    // If displayValue returns a string or selectedOption is null, render as text
    return (
      <span className={`truncate text-sm ${selectedOption ? 'text-gray-900' : 'text-slate-400'}`}>
        {displayContent}
      </span>
    );
  };

  const renderDefaultOption = (option: DropdownSearchOption) => (
    <div className="flex items-center w-full">
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
          ref={triggerRef}
          type="button"
          onClick={handleToggleDropdown}
          disabled={disabled}
          className={`${buttonClassName || 'w-full'} flex items-center justify-between px-4 py-3 h-12 border border-slate-200 bg-slate-50 rounded-lg hover:border-blue-300 transition-all duration-200 ${
            isOpen ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-500'
          } ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          } ${
            error ? 'border-red-500 focus-visible:ring-red-500' : ''
          }`}
        >
          {renderDisplayValue()}
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Error Message */}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        {/* Dropdown Menu — rendered via portal to escape overflow:hidden containers */}
        {isOpen && createPortal(
          <div 
            ref={menuRef}
            className={`fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg ${dropdownClassName}`}
            style={{ 
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              maxHeight: maxHeight,
              minWidth: menuPosition.width,
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
            </div>

            {/* Options List */}
            <div className="overflow-y-auto" style={{ maxHeight: 'min(280px, 45vh)' }}>
              {/* Clear/None Option */}
              {allowClear && (
                <button
                  type="button"
                  onClick={() => handleSelectOption(null)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 flex items-center"
                >
                  <FolderIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-700 font-medium">{clearLabel || t('common.none')}</span>
                </button>
              )}
              
              {/* Filtered Options */}
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center group"
                    style={{ 
                      paddingLeft: option.level !== undefined ? `${16 + option.level * 20}px` : '16px' 
                    }}
                  >
                    {renderOption ? renderOption(option) : renderDefaultOption(option)}
                  </button>
                ))
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
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default DropdownSearch;
