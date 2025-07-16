import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { DropdownSearch } from './DropdownSearch';
import Button from './Button';
import type { DropdownSearchOption } from './DropdownSearch';

export interface FilterOption extends DropdownSearchOption {
  // Extends DropdownSearchOption for consistency
  // Uses id as the value for filtering
}

export interface SearchAndFilterProps {
  // Search props
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Filter props
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  filterPlaceholder?: string;
  
  // View mode props
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  showViewToggle?: boolean;
  
  // Additional filters
  additionalFilters?: React.ReactNode;
  
  // Styling
  className?: string;
  searchClassName?: string;
  filterClassName?: string;
  
  // Actions
  actions?: React.ReactNode;
  
  // Clear functionality
  showClearButton?: boolean;
  onClear?: () => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filterValue = "",
  onFilterChange,
  filterOptions = [],
  filterLabel,
  filterPlaceholder,
  viewMode = 'grid',
  onViewModeChange,
  showViewToggle = true,
  additionalFilters,
  className,
  searchClassName,
  filterClassName,
  actions,
  showClearButton = true,
  onClear
}) => {
  const { t } = useTranslation();
  const hasActiveFilters = searchValue.trim() !== '' || filterValue !== '';

  const handleClear = () => {
    onSearchChange('');
    onFilterChange?.('');
    onClear?.();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Search and Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder || t('common.searchPlaceholder')}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                "w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm",
                "focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                "transition-all duration-200 ease-in-out",
                "placeholder-gray-400 text-gray-900 text-sm",
                "bg-white hover:border-gray-400",
                "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
                searchClassName
              )}
            />
            {searchValue && showClearButton && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                type="button"
                aria-label={t('common.clearSearch')}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Primary Filter Dropdown */}
          {filterOptions.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-gray-600">
                <FunnelIcon className="w-5 h-5 mr-2" />
                {filterLabel && (
                  <span className="text-sm font-medium mr-2">{filterLabel}:</span>
                )}
              </div>
              <div className="min-w-[140px]">
                <DropdownSearch
                  label=""
                  value={filterValue}
                  placeholder={filterPlaceholder || t('common.all')}
                  options={filterOptions}
                  onSelect={(option) => onFilterChange?.(option?.id || '')}
                  className={cn("", filterClassName)}
                  buttonClassName="py-3 min-w-[140px] text-sm"
                  allowClear={true}
                  clearLabel={filterPlaceholder || t('common.all')}
                />
              </div>
            </div>
          )}

          {/* Additional Filters */}
          {additionalFilters}

          {/* View Mode Toggle */}
          {showViewToggle && onViewModeChange && (
            <div className="flex border border-gray-300 rounded-lg shadow-sm overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  "rounded-none border-0 shadow-none",
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-600 hover:bg-primary-200 border-r border-primary-200'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-r border-gray-300'
                )}
                title={t('common.gridView')}
                type="button"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className={cn(
                  "rounded-none border-0 shadow-none",
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                )}
                title={t('common.listView')}
                type="button"
              >
                <ListBulletIcon className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Actions */}
          {actions}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && showClearButton && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="font-medium">Active filters:</span>
            <div className="flex items-center space-x-2">
              {searchValue && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Search: "{searchValue}"
                </span>
              )}
              {filterValue && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                  {filterLabel}: {filterOptions.find(f => f.id === filterValue)?.label || filterValue}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium h-auto p-2"
            type="button"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
