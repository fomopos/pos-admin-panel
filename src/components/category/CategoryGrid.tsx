import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Input from '../ui/Input';
import Button from '../ui/Button';
import CategoryCard from './CategoryCard';
import type { EnhancedCategory } from '../../types/category';
import { CategoryUtils } from '../../types/category';

interface CategoryGridProps {
  categories: EnhancedCategory[];
  loading?: boolean;
  onCreateCategory?: () => void;
  onEditCategory?: (category: EnhancedCategory) => void;
  onDeleteCategory?: (category: EnhancedCategory) => void;
  onViewCategory?: (category: EnhancedCategory) => void;
  onRefresh?: () => void;
  showHierarchy?: boolean;
}

type ViewMode = 'grid' | 'list';
type FilterMode = 'all' | 'active' | 'inactive' | 'main-screen' | 'with-subcategories';

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  loading = false,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onViewCategory,
  onRefresh,
  showHierarchy = false
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Build hierarchy for display
  const categoryHierarchy = useMemo(() => {
    if (showHierarchy) {
      return CategoryUtils.buildHierarchy(categories);
    }
    return categories;
  }, [categories, showHierarchy]);

  // Filter and search categories
  const filteredCategories = useMemo(() => {
    let filtered = showHierarchy ? categoryHierarchy : categories;

    // Apply search
    if (searchQuery.trim()) {
      filtered = CategoryUtils.filterCategories(filtered, {
        search: searchQuery.trim()
      });
    }

    // Apply filters
    switch (filterMode) {
      case 'active':
        filtered = filtered.filter(cat => cat.is_active);
        break;
      case 'inactive':
        filtered = filtered.filter(cat => !cat.is_active);
        break;
      case 'main-screen':
        filtered = filtered.filter(cat => cat.display_on_main_screen);
        break;
      case 'with-subcategories':
        filtered = filtered.filter(cat => {
          const subcategories = categories.filter(sub => sub.parent_category_id === cat.category_id);
          return subcategories.length > 0;
        });
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    return filtered;
  }, [categoryHierarchy, categories, searchQuery, filterMode, showHierarchy]);

  const getSubcategories = (categoryId: string): EnhancedCategory[] => {
    return categories.filter(cat => cat.parent_category_id === categoryId);
  };

  const filterOptions = [
    { value: 'all', label: t('categories.filters.all') },
    { value: 'active', label: t('categories.filters.active') },
    { value: 'inactive', label: t('categories.filters.inactive') },
    { value: 'main-screen', label: t('categories.filters.mainScreen') },
    { value: 'with-subcategories', label: t('categories.filters.withSubcategories') },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        
        {/* Loading grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-4">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-20 bg-gray-200 rounded mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('categories.title')}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('categories.subtitle', { count: categories.length })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="flex items-center gap-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                {t('common.refresh')}
              </Button>
            )}
            
            {onCreateCategory && (
              <Button
                onClick={onCreateCategory}
                className="flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                {t('categories.create.button')}
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('categories.search.placeholder')}
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 ${showFilters ? 'bg-blue-50 border-blue-300' : ''}`}
          >
            <FunnelIcon className="w-4 h-4" />
            {t('common.filters')}
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterMode(option.value as FilterMode)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filterMode === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Categories Grid/List */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Squares2X2Icon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || filterMode !== 'all' 
              ? t('categories.empty.noResults')
              : t('categories.empty.noCategories')
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterMode !== 'all'
              ? t('categories.empty.noResultsDescription')
              : t('categories.empty.noCategoriesDescription')
            }
          </p>
          {onCreateCategory && !searchQuery && filterMode === 'all' && (
            <Button onClick={onCreateCategory} className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              {t('categories.create.button')}
            </Button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {/* Create New Category Card - Only show in grid view and when not filtering */}
          {viewMode === 'grid' && onCreateCategory && !searchQuery && filterMode === 'all' && (
            <div 
              onClick={onCreateCategory}
              className="group bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 rounded-lg p-6 hover:border-blue-300 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <PlusIcon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('categories.create.newCategory')}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {t('categories.create.newCategoryDescription')}
                </p>
                
                <div className="flex flex-wrap gap-1 justify-center">
                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    📱 {t('categories.create.features.mobile')}
                  </span>
                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    🏷️ {t('categories.create.features.tags')}
                  </span>
                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    📂 {t('categories.create.features.hierarchy')}
                  </span>
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-blue-600 group-hover:text-blue-700 transition-colors">
                  <PlusIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('categories.create.button')}</span>
                </div>
              </div>
            </div>
          )}
          
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.category_id}
              category={category}
              onEdit={onEditCategory}
              onDelete={onDeleteCategory}
              onViewDetails={onViewCategory}
              showSubcategories={showHierarchy}
              subcategories={getSubcategories(category.category_id)}
              className={viewMode === 'list' ? 'w-full' : ''}
            />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {filteredCategories.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          {t('categories.results.showing', { 
            count: filteredCategories.length,
            total: categories.length
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;
