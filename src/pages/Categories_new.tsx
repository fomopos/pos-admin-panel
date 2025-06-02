import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import CategoryGrid from '../components/category/CategoryGrid';
import CreateCategory from '../components/category/CreateCategory';
import { categoryApiService } from '../services/category/categoryApiService';
import type { EnhancedCategory } from '../types/category';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const Categories: React.FC = () => {
  const { t } = useTranslation();
  const { currentTenant, currentStore } = useTenantStore();
  const [categories, setCategories] = useState<EnhancedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EnhancedCategory | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    if (currentTenant && currentStore) {
      loadCategories();
    }
  }, [currentTenant, currentStore]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await categoryApiService.getCategories();
      setCategories(result);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(t('categories.errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowCreateCategory(true);
  };

  const handleEditCategory = (category: EnhancedCategory) => {
    setEditingCategory(category);
    setShowCreateCategory(true);
  };

  const handleDeleteCategory = async (category: EnhancedCategory) => {
    if (!window.confirm(t('categories.delete.confirm', { name: category.name }))) {
      return;
    }

    try {
      await categoryApiService.deleteCategory(category.category_id);
      await loadCategories(); // Refresh the list
      // Show success message
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError(t('categories.errors.deleteFailed'));
    }
  };

  const handleCategorySuccess = async (_category: EnhancedCategory) => {
    await loadCategories(); // Refresh the list
    setShowCreateCategory(false);
    setEditingCategory(null);
    // Show success message
  };

  const handleCloseCreateCategory = () => {
    setShowCreateCategory(false);
    setEditingCategory(null);
  };

  // Show error if no tenant/store selected
  if (!currentTenant || !currentStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="p-6 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('categories.errors.noTenantStore')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('categories.errors.noTenantStoreDescription')}
            </p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              {t('common.goToDashboard')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <CategoryGrid
          categories={categories}
          loading={isLoading}
          onCreateCategory={handleCreateCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onViewCategory={(category) => {
            console.log('View category:', category);
            // Navigate to category details page
          }}
          onRefresh={loadCategories}
          showHierarchy={true}
        />

        {/* Create/Edit Category Modal */}
        <CreateCategory
          isOpen={showCreateCategory}
          onClose={handleCloseCreateCategory}
          onSuccess={handleCategorySuccess}
          // Pass editing category data if editing
          initialTemplate={editingCategory ? undefined : undefined}
        />
      </div>
    </div>
  );
};

export default Categories;
