import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  PlusIcon, 
  FolderIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PageHeader, Button, ConfirmDialog, AdvancedSearchFilter, DataTable, Loading, PageContainer } from '../components/ui';
import type { FilterConfig, ViewMode, Column } from '../components/ui';
import { getIconComponent } from '../components/ui/IconPicker';
import type { EnhancedCategory } from '../types/category';
import useTenantStore from '../tenants/tenantStore';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';
import { useCategories } from '../hooks/useCategories';
import { categoryCacheService } from '../services/category/categoryCache';

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentTenant, currentStore } = useTenantStore();
  
  // Use cached categories
  const { categories, isLoading: loading } = useCategories({
    tenantId: currentTenant?.id,
    storeId: currentStore?.store_id,
    autoLoad: true
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

  // Categories are loaded automatically by the useCategories hook

  const parentCategories = categories.filter(cat => !cat.parent_category_id);

  // Filter configuration for AdvancedSearchFilter
  const filterConfigs: FilterConfig[] = [
    {
      key: 'parent',
      label: t('categories.filters.parent'),
      type: 'dropdown',
      options: [
        { id: '', label: t('categories.filters.allCategories') },
        ...parentCategories.map(cat => ({ id: cat.category_id, label: cat.name }))
      ],
      value: selectedParent
    }
  ];

  // Handle filter changes from AdvancedSearchFilter
  const handleFilterChange = (key: string, value: any) => {
    if (key === 'parent') {
      setSelectedParent(value as string);
    }
  };

  // Active filters for badge display
  const activeFilters: Array<{ key: string; label: string; value: string; onRemove: () => void }> = [];
  
  if (searchTerm) {
    activeFilters.push({
      key: 'search',
      label: t('common.search'),
      value: searchTerm,
      onRemove: () => setSearchTerm('')
    });
  }
  
  if (selectedParent) {
    const parentLabel = parentCategories.find(c => c.category_id === selectedParent)?.name || selectedParent;
    activeFilters.push({
      key: 'parent',
      label: t('categories.filters.parent'),
      value: parentLabel,
      onRemove: () => setSelectedParent('')
    });
  }

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesParent = !selectedParent || category.parent_category_id === selectedParent;
    return matchesSearch && matchesParent;
  });

  const handleEdit = (category: EnhancedCategory) => {
    navigate(`/categories/edit/${category.category_id}`);
  };

  const handleView = (category: EnhancedCategory) => {
    navigate(`/categories/${category.category_id}`);
  };

  const handleDelete = async (categoryId: string) => {
    const category = categories.find(c => c.category_id === categoryId);
    if (!category || !currentTenant || !currentStore) return;

    deleteDialog.openDeleteDialog(
      category.name,
      async () => {
        // Import the API service dynamically to avoid circular dependency issues
        const { categoryApiService } = await import('../services/category/categoryApiService');
        
        await categoryApiService.deleteCategory(categoryId, {
          tenant_id: currentTenant.id,
          store_id: currentStore.store_id,
        });
        
        // Remove from cache and refresh the categories
        categoryCacheService.removeCategory(currentTenant.id, currentStore.store_id, categoryId);
      }
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedParent('');
  };

  // Define DataTable columns for list view
  const tableColumns: Column<EnhancedCategory>[] = [
    {
      key: 'name',
      title: t('categories.table.category'),
      sortable: true,
      render: (_, category) => (
        <div className="flex items-center">
          {category.icon_url ? (
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm border border-gray-100"
              style={{ 
                backgroundColor: category.color || '#3B82F6',
                color: 'white'
              }}
            >
              {(() => {
                const iconDefinition = getIconComponent(category.icon_url);
                return iconDefinition ? (
                  <FontAwesomeIcon icon={iconDefinition} className="h-4 w-4" />
                ) : (
                  <FolderIcon className="w-4 h-4" />
                );
              })()}
            </div>
          ) : (
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm border border-gray-100"
              style={{ 
                backgroundColor: category.color || '#6B7280',
                color: 'white'
              }}
            >
              <FolderIcon className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{category.name}</div>
            {category.description && (
              <div className="text-sm text-gray-500 line-clamp-1">{category.description}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'parent_category_id',
      title: t('categories.table.parent'),
      sortable: true,
      render: (_, category) => {
        const parentCategory = category.parent_category_id 
          ? categories.find(c => c.category_id === category.parent_category_id)
          : null;
        return (
          <span className="text-sm text-gray-900">
            {parentCategory ? parentCategory.name : '-'}
          </span>
        );
      }
    },
    {
      key: 'is_active',
      title: t('categories.table.status'),
      sortable: true,
      render: (_, category) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          category.is_active !== false
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {category.is_active !== false ? t('common.active') : t('common.inactive')}
        </span>
      )
    },
    {
      key: 'category_id',
      title: t('categories.table.actions'),
      sortable: false,
      render: (_, category) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(category);
            }}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title={t('common.view')}
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(category);
            }}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title={t('common.edit')}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(category.category_id);
            }}
            className="text-red-600 hover:text-red-900 transition-colors"
            title={t('common.delete')}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  // Show loading spinner
  if (loading) {
    return (
      <PageContainer variant="default" spacing="md">
        <Loading
          title={t('categories.loading.title')}
          description={t('categories.loading.description')}
          fullScreen={false}
          size="lg"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="default" spacing="md">
      {/* Header */}
      <PageHeader
        title={t('categories.title')}
        description={t('categories.subtitle')}
      >
        <Button
          onClick={() => navigate('/categories/new')}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Category</span>
        </Button>
      </PageHeader>

      {/* Search and Filter */}
      <AdvancedSearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchLabel={t('categories.search.label')}
        searchPlaceholder={t('categories.search.placeholder')}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        enabledViews={['grid', 'list']}
        filters={filterConfigs}
        onFilterChange={handleFilterChange}
        activeFilters={activeFilters}
        totalResults={categories.length}
        filteredResults={filteredCategories.length}
        showResultsCount={true}
        onClearAll={handleClearFilters}
        className="mb-6"
      />

      {/* Categories Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(category => (
            <CategoryCard
              key={category.category_id}
              category={category}
              categories={categories}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <DataTable
          data={filteredCategories}
          columns={tableColumns}
          loading={false}
          searchable={false}
          pagination={true}
          pageSize={25}
          pageSizeOptions={[10, 25, 50, 100]}
          onRowClick={(category) => handleEdit(category)}
          searchFields={['name', 'description']}
          defaultSort={{ key: 'name', direction: 'asc' }}
          emptyState={
            <div className="text-slate-500">
              <div className="text-lg font-medium mb-1">{t('categories.empty.title')}</div>
              <div className="text-sm">{t('categories.empty.description')}</div>
            </div>
          }
        />
      )}

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t('categories.empty.title')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('categories.empty.description')}
          </p>
          <div className="mt-6">
            <Button
              onClick={() => navigate('/categories/new')}
              className="inline-flex items-center"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              {t('categories.create.button')}
            </Button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.dialogState.isOpen}
        onClose={deleteDialog.closeDialog}
        onConfirm={deleteDialog.handleConfirm}
        title={deleteDialog.dialogState.title}
        message={deleteDialog.dialogState.message}
        confirmText={deleteDialog.dialogState.confirmText}
        cancelText={deleteDialog.dialogState.cancelText}
        variant={deleteDialog.dialogState.variant}
        isLoading={deleteDialog.dialogState.isLoading}
      />
    </PageContainer>
  );
};

// Category Card Component for Grid View
const CategoryCard: React.FC<{
  category: EnhancedCategory;
  categories: EnhancedCategory[];
  onEdit: (category: EnhancedCategory) => void;
  onView: (category: EnhancedCategory) => void;
  onDelete: (id: string) => void;
}> = ({ category, categories, onEdit, onView, onDelete }) => {
  const { t } = useTranslation();
  
  const parentCategory = category.parent_category_id 
    ? categories.find(c => c.category_id === category.parent_category_id)
    : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {category.icon_url ? (
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm border border-gray-100"
                style={{ 
                  backgroundColor: category.color || '#3B82F6',
                  color: 'white'
                }}
              >
                {(() => {
                  const iconDefinition = getIconComponent(category.icon_url);
                  return iconDefinition ? (
                    <FontAwesomeIcon icon={iconDefinition} className="h-5 w-5" />
                  ) : (
                    <FolderIcon className="w-5 h-5" />
                  );
                })()}
              </div>
            ) : (
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm border border-gray-100"
                style={{ 
                  backgroundColor: category.color || '#6B7280',
                  color: 'white'
                }}
              >
                <FolderIcon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              {category.parent_category_id && parentCategory && (
                <p className="text-sm text-gray-500">
                  Parent: {parentCategory.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onView(category)}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(category)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(category.category_id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {category.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
        )}
        
        <div className="flex justify-between items-center">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {category.sort_order || 0} {t('categories.fields.sortOrder')}
          </span>
          <div className="flex items-center space-x-2">
            {/* Color indicator */}
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: category.color || '#6B7280' }}
              title={`Color: ${category.color || '#6B7280'}`}
            />
            <span className={`px-2 py-1 text-xs rounded-full ${
              category.is_active !== false
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {category.is_active !== false ? t('common.active') : t('common.inactive')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;