import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { DropdownSearch } from './DropdownSearch';
import { InputTextField } from './InputTextField';
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
      {/* Main Search and Filter Bar — card style matching AdvancedSearchFilter */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input — uses InputTextField for consistent h-12 height */}
          <div className="flex-1 min-w-[200px] relative">
            <InputTextField
              label=""
              type="text"
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder || t('common.searchPlaceholder')}
              prefixIcon={MagnifyingGlassIcon}
              inputClassName={cn("h-12", searchClassName)}
              className="mb-0"
            />
            {searchValue && showClearButton && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
                type="button"
                aria-label={t('common.clearSearch')}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex items-end gap-3">
            {/* Primary Filter Dropdown — uses default DropdownSearch h-12 height */}
            {filterOptions.length > 0 && (
              <div className={cn("min-w-[200px]", filterClassName)}>
                <DropdownSearch
                  label={filterLabel || ''}
                  value={filterValue}
                  placeholder={filterPlaceholder || t('common.all')}
                  options={filterOptions}
                  onSelect={(option) => onFilterChange?.(option?.id || '')}
                  allowClear={true}
                  clearLabel={filterPlaceholder || t('common.all')}
                />
              </div>
            )}

            {/* Additional Filters */}
            {additionalFilters}

            {/* View Mode Toggle */}
            {showViewToggle && onViewModeChange && (
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white h-12">
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={cn(
                    'h-full px-3.5 flex items-center justify-center transition-colors',
                    viewMode === 'grid'
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  )}
                  title={t('common.gridView')}
                  type="button"
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onViewModeChange('list')}
                  className={cn(
                    'h-full px-3.5 flex items-center justify-center transition-colors border-l border-slate-300',
                    viewMode === 'list'
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  )}
                  title={t('common.listView')}
                  type="button"
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Actions — rendered at same height alignment */}
            {actions}
          </div>
        </div>

        {/* Active Filters Summary — inside the card */}
        {hasActiveFilters && showClearButton && (
          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <span className="font-medium">Active filters:</span>
              <div className="flex items-center space-x-2">
                {searchValue && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Search: &ldquo;{searchValue}&rdquo;
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
              className="text-sm text-slate-600 hover:text-slate-800 font-medium"
              type="button"
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilter;
