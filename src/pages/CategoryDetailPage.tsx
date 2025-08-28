import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  SwatchIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { categoryCacheService } from '../services/category/categoryCache';
import { PageHeader, Button, Loading, ConfirmDialog } from '../components/ui';
import { getIconComponent } from '../components/ui/IconPicker';
import { CategoryWidget } from '../components/category/CategoryWidget';
import type { EnhancedCategory } from '../types/category';
import { useTenantStore } from '../tenants/tenantStore';
import { CategoryUtils } from '../utils/categoryUtils';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';
import { useError } from '../hooks/useError';
import { useCategories } from '../hooks/useCategories';

const CategoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  const { showError } = useError();
  
  // Use cached categories
  const { categories, isLoading } = useCategories({
    tenantId: currentTenant?.id,
    storeId: currentStore?.store_id,
    autoLoad: true
  });
  
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

  // Get the specific category from the cached categories
  const category = categories.find(cat => cat.category_id === id) || null;

  // Check for errors when categories are loaded but category is not found
  useEffect(() => {
    if (!isLoading && categories.length > 0 && !category && id) {
      setFetchError('Category not found');
      showError('Category not found. It may have been deleted.');
    } else if (!isLoading && category) {
      setFetchError(null);
    }
  }, [isLoading, categories, category, id, showError]);

  const handleEdit = () => {
    if (category) {
      navigate(`/categories/edit/${category.category_id}`);
    }
  };

  const handleDelete = async () => {
    if (!category || !currentTenant || !currentStore) return;
    
    deleteDialog.openDeleteDialog(
      category.name,
      async () => {
        // Import the API service dynamically to avoid circular dependency issues
        const { categoryApiService } = await import('../services/category/categoryApiService');
        
        await categoryApiService.deleteCategory(category.category_id, {
          tenant_id: currentTenant.id,
          store_id: currentStore.store_id
        });
        
        // Remove from cache
        categoryCacheService.removeCategory(currentTenant.id, currentStore.store_id, category.category_id);
        
        navigate('/categories');
      }
    );
  };

  const getParentCategory = (): EnhancedCategory | null => {
    if (!category?.parent_category_id) return null;
    return categories.find(c => c.category_id === category.parent_category_id) || null;
  };

  const getChildCategories = (): EnhancedCategory[] => {
    if (!category) return [];
    return categories.filter(c => c.parent_category_id === category.category_id);
  };

  const getCategoryPath = (): EnhancedCategory[] => {
    if (!category) return [];
    return CategoryUtils.getCategoryAncestors(category.category_id, categories).concat([category]);
  };

  // Loading state
  if (isLoading) {
    return (
      <Loading
        title="Loading Category"
        description="Please wait while we fetch the category details..."
        variant="primary"
      />
    );
  }

  // Error state
  if (fetchError || !category) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Category</h3>
          <p className="text-gray-500 mb-4">{fetchError || 'Category not found'}</p>
          <div className="space-x-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => navigate('/categories')} 
              variant="outline"
            >
              Back to Categories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const parentCategory = getParentCategory();
  const childCategories = getChildCategories();
  const categoryPath = getCategoryPath();

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <PageHeader
        title={category.name}
        description={category.description || 'Category details and information'}
      >
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/categories')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Categories</span>
          </Button>
          
          <Button
            onClick={handleEdit}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit Category</span>
          </Button>
          
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="flex items-center space-x-2"
          >
            <TrashIcon className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </PageHeader>

      {/* Category Path Breadcrumb */}
      {categoryPath.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium">Path:</span>
            {categoryPath.map((pathCategory, index) => (
              <React.Fragment key={pathCategory.category_id}>
                {index > 0 && <span className="text-gray-400">{'>'}</span>}
                <button
                  onClick={() => {
                    if (pathCategory.category_id !== category.category_id) {
                      navigate(`/categories/${pathCategory.category_id}`);
                    }
                  }}
                  className={`hover:text-blue-600 transition-colors ${
                    pathCategory.category_id === category.category_id 
                      ? 'font-medium text-gray-900' 
                      : 'text-blue-500'
                  }`}
                >
                  {pathCategory.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <CategoryWidget
          title="Basic Information"
          description="Category details and identification"
          icon={InformationCircleIcon}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <p className="text-sm text-gray-900 font-medium">{category.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
              <p className="text-sm text-gray-600 font-mono">{category.category_id}</p>
            </div>

            {category.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            )}

            {category.tags && category.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {category.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CategoryWidget>

        {/* Hierarchy & Organization */}
        <CategoryWidget
          title="Organization"
          description="Category hierarchy and ordering"
          icon={FolderIcon}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
              <p className="text-sm text-gray-600">
                {parentCategory ? (
                  <button
                    onClick={() => navigate(`/categories/${parentCategory.category_id}`)}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {parentCategory.name}
                  </button>
                ) : (
                  'Root Category (No Parent)'
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <p className="text-sm text-gray-600">{category.sort_order || 0}</p>
            </div>

            {childCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child Categories ({childCategories.length})
                </label>
                <div className="space-y-2">
                  {childCategories.slice(0, 5).map(child => (
                    <div key={child.category_id} className="flex items-center justify-between py-1">
                      <button
                        onClick={() => navigate(`/categories/${child.category_id}`)}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        {child.name}
                      </button>
                      <span className="text-xs text-gray-500">
                        Sort: {child.sort_order || 0}
                      </span>
                    </div>
                  ))}
                  {childCategories.length > 5 && (
                    <p className="text-xs text-gray-500">
                      And {childCategories.length - 5} more child categories...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CategoryWidget>

        {/* Appearance */}
        <CategoryWidget
          title="Appearance"
          description="Visual styling and media"
          icon={SwatchIcon}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Color</label>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg border-2 border-white shadow-sm ring-1 ring-gray-200"
                  style={{ backgroundColor: category.color || '#6B7280' }}
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {category.color || '#6B7280'}
                  </span>
                  <p className="text-xs text-gray-500">Hex Color Code</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Icon</label>
              <div className="flex items-center space-x-3">
                {category.icon_url ? (
                  <>
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-sm border border-gray-100"
                      style={{ 
                        backgroundColor: category.color || '#6B7280',
                        color: 'white'
                      }}
                    >
                      {(() => {
                        const iconDefinition = getIconComponent(category.icon_url);
                        return iconDefinition ? (
                          <FontAwesomeIcon icon={iconDefinition} className="h-6 w-6" />
                        ) : (
                          <FolderIcon className="w-6 h-6" />
                        );
                      })()}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{category.icon_url}</span>
                      <p className="text-xs text-gray-500">Icon Identifier</p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-3 text-gray-500">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm border border-gray-200"
                      style={{ backgroundColor: '#F3F4F6' }}
                    >
                      <FolderIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">No icon set</span>
                      <p className="text-xs text-gray-500">Default folder icon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {category.image_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                  <img 
                    src={category.image_url} 
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </CategoryWidget>

        {/* Settings & Properties */}
        <CategoryWidget
          title="Settings & Properties"
          description="Category behavior and configuration"
          icon={Cog6ToothIcon}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  category.is_active !== false
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Screen</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  category.display_on_main_screen
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {category.display_on_main_screen ? 'Displayed' : 'Hidden'}
                </span>
              </div>
            </div>

            {category.properties && Object.keys(category.properties).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Properties</label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <dl className="space-y-2">
                    {Object.entries(category.properties).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <dt className="font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </dt>
                        <dd className="text-gray-600">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}
          </div>
        </CategoryWidget>

        {/* Metadata */}
        <div className="lg:col-span-2">
          <CategoryWidget
            title="Metadata"
            description="Category creation and update information"
            icon={CalendarDaysIcon}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <p className="text-sm text-gray-600">
                    {new Date(category.created_at).toLocaleDateString()} at{' '}
                    {new Date(category.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                  <p className="text-sm text-gray-600 flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" />
                    {category.create_user_id}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-600">
                    {new Date(category.updated_at).toLocaleDateString()} at{' '}
                    {new Date(category.updated_at).toLocaleTimeString()}
                  </p>
                </div>
                {category.update_user_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
                    <p className="text-sm text-gray-600 flex items-center">
                      <UserIcon className="w-4 h-4 mr-1" />
                      {category.update_user_id}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CategoryWidget>
        </div>
      </div>

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

export default CategoryDetailPage;
