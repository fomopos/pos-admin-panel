import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { DropdownSearch, type DropdownSearchOption } from './DropdownSearch';
import { MultipleDropdownSearch } from './MultipleDropdownSearch';
import { InputTextField } from './InputTextField';
import { Button } from './';
import { Body2, Caption } from './Typography';

export type ViewMode = 'grid' | 'list' | 'table';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'dropdown' | 'multiselect' | 'daterange' | 'custom';
  options?: DropdownSearchOption[];
  value?: any;
  placeholder?: string;
  renderCustom?: () => ReactNode;
}

export interface AdvancedSearchFilterProps {
  // Search functionality
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  searchFields?: string[]; // Fields to search in (for display purposes)
  
  // View mode toggle
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  enabledViews?: ViewMode[];
  
  // Filters
  filters?: FilterConfig[];
  onFilterChange?: (key: string, value: any) => void;
  showAdvancedFilters?: boolean;
  onToggleAdvancedFilters?: () => void;
  
  // Active filters display
  activeFilters?: Array<{
    key: string;
    label: string;
    value: string;
    onRemove: () => void;
  }>;
  
  // Results info
  totalResults?: number;
  filteredResults?: number;
  showResultsCount?: boolean;
  
  // Actions
  onClearAll?: () => void;
  additionalActions?: ReactNode;
  
  // Styling
  className?: string;
  compact?: boolean;
}

/**
 * AdvancedSearchFilter - A comprehensive search and filter component
 * 
 * Features:
 * - Search bar with customizable placeholder
 * - View mode toggle (grid/list/table)
 * - Basic filters dropdown
 * - Advanced filters panel (collapsible)
 * - Active filters display with remove option
 * - Results count display
 * - Clear all functionality
 * 
 * Usage:
 * ```tsx
 * <AdvancedSearchFilter
 *   searchValue={search}
 *   onSearchChange={setSearch}
 *   viewMode={viewMode}
 *   onViewModeChange={setViewMode}
 *   filters={filterConfigs}
 *   onFilterChange={handleFilterChange}
 * />
 * ```
 */
export const AdvancedSearchFilter: React.FC<AdvancedSearchFilterProps> = ({
  searchValue,
  onSearchChange,
  searchLabel = '',
  searchPlaceholder = 'Search...',
  searchFields,
  viewMode = 'grid',
  onViewModeChange,
  enabledViews = ['grid', 'list'],
  filters = [],
  onFilterChange,
  showAdvancedFilters = false,
  onToggleAdvancedFilters,
  activeFilters = [],
  totalResults,
  filteredResults,
  showResultsCount = true,
  onClearAll,
  additionalActions,
  className = '',
  compact = false
}) => {
  const { t } = useTranslation();
  const [localShowAdvanced, setLocalShowAdvanced] = useState(false);

  const isAdvancedOpen = onToggleAdvancedFilters ? showAdvancedFilters : localShowAdvanced;
  const toggleAdvanced = onToggleAdvancedFilters || (() => setLocalShowAdvanced(!localShowAdvanced));

  // When no toggle handler is provided, show all filters inline
  const basicFilters = onToggleAdvancedFilters === undefined 
    ? filters 
    : filters.filter(f => f.type === 'dropdown');
  
  const advancedFilters = onToggleAdvancedFilters === undefined
    ? []
    : filters.filter(f => f.type !== 'dropdown' || filters.length > 3);

  const hasActiveFilters = activeFilters.length > 0 || searchValue.length > 0;
  // Only show advanced filters toggle if onToggleAdvancedFilters is provided (controlled mode)
  const hasAdvancedFilters = advancedFilters.length > 0 && onToggleAdvancedFilters !== undefined;

  const renderViewModeToggle = () => {
    if (!onViewModeChange || enabledViews.length <= 1) return null;

    return (
      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
        {enabledViews.includes('grid') && (
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-2 transition-colors',
              viewMode === 'grid'
                ? 'bg-primary-100 text-primary-600'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            )}
            title="Grid View"
          >
            <Squares2X2Icon className="w-5 h-5" />
          </button>
        )}
        {enabledViews.includes('list') && (
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-2 transition-colors border-l border-slate-300',
              viewMode === 'list'
                ? 'bg-primary-100 text-primary-600'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            )}
            title="List View"
          >
            <ListBulletIcon className="w-5 h-5" />
          </button>
        )}
        {enabledViews.includes('table') && (
          <button
            onClick={() => onViewModeChange('table')}
            className={cn(
              'p-2 transition-colors border-l border-slate-300',
              viewMode === 'table'
                ? 'bg-primary-100 text-primary-600'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            )}
            title="Table View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  const renderFilter = (filter: FilterConfig) => {
    if (filter.type === 'custom' && filter.renderCustom) {
      return filter.renderCustom();
    }

    if (filter.type === 'dropdown' && filter.options) {
      return (
        <DropdownSearch
          key={filter.key}
          label={filter.label}
          value={filter.value || ''}
          placeholder={filter.placeholder || `Select ${filter.label}`}
          options={filter.options}
          onSelect={(option) => onFilterChange?.(filter.key, option?.id || '')}
          allowClear
          clearLabel="All"
        />
      );
    }

    if (filter.type === 'multiselect' && filter.options) {
      return (
        <MultipleDropdownSearch
          key={filter.key}
          label={filter.label}
          values={filter.value || []}
          placeholder={filter.placeholder || `Select ${filter.label}`}
          options={filter.options}
          onSelect={(selectedIds) => onFilterChange?.(filter.key, selectedIds)}
        />
      );
    }

    return null;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Search and Filter Bar */}
      <div className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm',
        compact ? 'p-3' : 'p-4'
      )}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 min-w-[300px] max-w-[600px]">
            <div className="relative">
              <InputTextField
                label={searchLabel}
                type="text"
                value={searchValue}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
                prefixIcon={MagnifyingGlassIcon}
                inputClassName="h-12"
                className="mb-0"
              />
              {searchValue && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-[38px] transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            {searchFields && searchFields.length > 0 && (
              <Caption color="muted" className="mt-1 ml-1">
                Searching in: {searchFields.join(', ')}
              </Caption>
            )}
          </div>

          {/* Basic Filters */}
          {basicFilters.length > 0 && (
            <div className="flex items-start gap-3 flex-wrap">
              {basicFilters.map(filter => (
                <div key={filter.key} className="min-w-[200px]">
                  {renderFilter(filter)}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Advanced Filters Toggle */}
            {hasAdvancedFilters && (
              <Button
                variant={isAdvancedOpen ? 'primary' : 'outline'}
                onClick={toggleAdvanced}
                className="flex items-center gap-2"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{t('common.filters')}</span>
                {isAdvancedOpen ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </Button>
            )}

            {/* View Mode Toggle */}
            {renderViewModeToggle()}

            {/* Additional Actions */}
            {additionalActions}
          </div>
        </div>

        {/* Results Count */}
        {showResultsCount && (totalResults !== undefined || filteredResults !== undefined) && (
          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
            <Body2 color="secondary">
              {filteredResults !== undefined && totalResults !== undefined ? (
                <>
                  Showing <span className="font-semibold text-slate-900">{filteredResults}</span> of{' '}
                  <span className="font-semibold text-slate-900">{totalResults}</span> results
                  {hasActiveFilters && ' (filtered)'}
                </>
              ) : (
                <>
                  <span className="font-semibold text-slate-900">{totalResults || filteredResults || 0}</span> results
                </>
              )}
            </Body2>
            {hasActiveFilters && onClearAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-slate-600 hover:text-slate-800"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                {t('common.clearAll')}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {hasAdvancedFilters && isAdvancedOpen && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-slate-600" />
              <Body2 weight="semibold">{t('common.advancedFilters')}</Body2>
            </div>
            {onClearAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-slate-600 hover:text-slate-800"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                {t('common.clearAll')}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {advancedFilters.map(filter => (
              <div key={filter.key}>
                {renderFilter(filter)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Caption color="secondary" className="mr-2">
            Active filters:
          </Caption>
          {activeFilters.map((filter, index) => (
            <div
              key={`${filter.key}-${index}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-800 rounded-full text-sm"
            >
              <span className="font-medium">{filter.label}:</span>
              <span>{filter.value}</span>
              <button
                onClick={filter.onRemove}
                className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchFilter;
