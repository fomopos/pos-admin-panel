import React, { useState, useEffect } from 'react';
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
import { categoryApiService } from '../services/category/categoryApiService';
import { PageHeader, Button, ConfirmDialog, SearchAndFilter } from '../components/ui';
import { getIconComponent } from '../components/ui/IconPicker';
import type { EnhancedCategory } from '../types/category';
import useTenantStore from '../tenants/tenantStore';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [categories, setCategories] = useState<EnhancedCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const { currentTenant, currentStore } = useTenantStore();

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await categoryApiService.getCategories({
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      });
      setCategories(result);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const parentCategories = categories.filter(cat => !cat.parent_category_id);

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
    if (!category) return;

    deleteDialog.openDeleteDialog(
      category.name,
      async () => {
        await categoryApiService.deleteCategory(categoryId, {
          tenant_id: currentTenant?.id,
          store_id: currentStore?.store_id,
        });
        await loadCategories(); // Reload the list
      }
    );
  };

  return (
    <div className="p-6">
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

        {/* Search and Filter Bar */}
        <SearchAndFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={t('categories.search.placeholder')}
          filterValue={selectedParent}
          onFilterChange={setSelectedParent}
          filterOptions={parentCategories.map(category => ({
            id: category.category_id,
            label: category.name
          }))}
          filterLabel="Parent"
          filterPlaceholder={t('categories.filters.allCategories')}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={true}
          className="mb-6"
        />

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      ) : (
        <>
          {/* Categories Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map(category => (
                <CategoryCard
                  key={category.category_id}
                  category={category}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('categories.table.category')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('categories.table.parent')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('categories.table.status')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('categories.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map(category => (
                    <CategoryListItem
                      key={category.category_id}
                      category={category}
                      categories={categories}
                      onEdit={handleEdit}
                      onView={handleView}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
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
        </>
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
    </div>
  );
};

// Category Card Component for Grid View
const CategoryCard: React.FC<{
  category: EnhancedCategory;
  onEdit: (category: EnhancedCategory) => void;
  onView: (category: EnhancedCategory) => void;
  onDelete: (id: string) => void;
}> = ({ category, onEdit, onView, onDelete }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {category.icon_url ? (
              <div 
                className="w-10 h-10 rounded flex items-center justify-center text-white"
                style={{ backgroundColor: category.color || '#3B82F6' }}
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
                className="w-10 h-10 rounded flex items-center justify-center text-white"
                style={{ backgroundColor: category.color || '#6B7280' }}
              >
                <FolderIcon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
              {category.parent_category_id && (
                <p className="text-sm text-gray-500">
                  {t('categories.parentCategory')}
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
  );
};

// Category List Item Component for Table View
const CategoryListItem: React.FC<{
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
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {category.icon_url ? (
            <div 
              className="w-8 h-8 rounded flex items-center justify-center text-white mr-3"
              style={{ backgroundColor: category.color || '#3B82F6' }}
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
              className="w-8 h-8 rounded flex items-center justify-center text-white mr-3"
              style={{ backgroundColor: category.color || '#6B7280' }}
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
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {parentCategory ? parentCategory.name : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          category.is_active !== false
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {category.is_active !== false ? t('common.active') : t('common.inactive')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onView(category)}
            className="text-gray-600 hover:text-gray-900"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(category)}
            className="text-blue-600 hover:text-blue-900"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(category.category_id)}
            className="text-red-600 hover:text-red-900"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default Categories;