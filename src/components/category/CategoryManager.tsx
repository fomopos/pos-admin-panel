import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import CategoryGrid from './CategoryGrid';
import { categoryApiService } from '../../services/category/categoryApiService';
import type { EnhancedCategory, CategoryTemplate } from '../../types/category';
import { CATEGORY_TEMPLATES } from '../../types/category';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import { ConfirmDialog } from '../ui';
import { useDeleteConfirmDialog } from '../../hooks/useConfirmDialog';

interface CategoryManagerProps {
  onCategorySelect?: (category: EnhancedCategory) => void;
  showHierarchy?: boolean;
  showBulkActions?: boolean;
  showAnalytics?: boolean;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  onCategorySelect,
  showHierarchy = true,
  showBulkActions = false,
  showAnalytics = false
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<EnhancedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withProducts: 0
  });

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

  // Load categories and stats
  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await categoryApiService.getCategories();
      setCategories(result);
      
      // Calculate stats
      const stats = {
        total: result.length,
        active: result.filter(c => c.is_active).length,
        inactive: result.filter(c => !c.is_active).length,
        withProducts: result.filter(c => c.properties?.productCount > 0).length
      };
      setStats(stats);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(t('categories.errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreateCategory = (template?: CategoryTemplate) => {
    // Navigate to category creation page
    // If template is provided, we could pass it as state
    if (template) {
      navigate('/categories/new', { state: { template } });
    } else {
      navigate('/categories/new');
    }
  };

  const handleEditCategory = (category: EnhancedCategory) => {
    navigate(`/categories/edit/${category.category_id}`);
  };

  const handleDeleteCategory = async (category: EnhancedCategory) => {
    deleteDialog.openDeleteDialog(
      category.name,
      async () => {
        await categoryApiService.deleteCategory(category.category_id);
        await loadCategories();
      }
    );
  };

  const handleViewCategory = (category: EnhancedCategory) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const handleBulkImport = async (file: File) => {
    try {
      // Parse CSV/JSON file and create categories in batch
      const formData = new FormData();
      formData.append('file', file);
      
      // This would need to be implemented in the API service
      // await categoryApiService.importCategories(formData);
      
      await loadCategories();
      setShowBulkImport(false);
    } catch (err) {
      console.error('Failed to import categories:', err);
      setError(t('categories.errors.importFailed'));
    }
  };

  const exportCategories = async () => {
    try {
      const categoriesData = await categoryApiService.getCategories();
      const dataStr = JSON.stringify(categoriesData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `categories-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      console.error('Failed to export categories:', err);
      setError(t('categories.errors.exportFailed'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('categories.title')}
            </h1>
            <p className="text-gray-600">
              {t('categories.subtitle')}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {showBulkActions && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkImport(true)}
                  className="flex items-center gap-2"
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  {t('categories.actions.import')}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportCategories}
                  className="flex items-center gap-2"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  {t('categories.actions.export')}
                </Button>
              </>
            )}
            
            <Button
              onClick={() => handleCreateCategory()}
              className="flex items-center gap-2"
            >
              <span>+</span>
              {t('categories.create.button')}
            </Button>
          </div>
        </div>

        {/* Quick Template Actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">
            {t('categories.quickCreate')}:
          </span>
          {CATEGORY_TEMPLATES.slice(0, 5).map((template) => (
            <button
              key={template.id}
              onClick={() => handleCreateCategory(template)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <span>{template.icon}</span>
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Cards */}
      {showAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{t('categories.stats.total')}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{t('categories.stats.active')}</p>
                <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{t('categories.stats.inactive')}</p>
                <p className="text-2xl font-semibold text-yellow-600">{stats.inactive}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{t('categories.stats.withProducts')}</p>
                <p className="text-2xl font-semibold text-purple-600">{stats.withProducts}</p>
              </div>
              <Cog6ToothIcon className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
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
        onCreateCategory={() => handleCreateCategory()}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        onViewCategory={handleViewCategory}
        onRefresh={loadCategories}
        showHierarchy={showHierarchy}
      />

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowBulkImport(false)} />
            <Card className="relative w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('categories.bulkImport.title')}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('categories.bulkImport.description')}
                </p>
                
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBulkImport(file);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowBulkImport(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            </Card>
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
    </div>
  );
};

// Enhanced Category Manager with Floating Action Button
export const CategoryManagerWithFAB: React.FC<CategoryManagerProps> = (props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCreateCategory = (template?: CategoryTemplate) => {
    // Navigate to category creation page
    // If template is provided, we could pass it as state
    if (template) {
      navigate('/categories/new', { state: { template } });
    } else {
      navigate('/categories/new');
    }
  };

  return (
    <div className="relative">
      <CategoryManager {...props} />
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative group">
          {/* Quick Template Options - Appear on hover */}
          <div className="absolute bottom-16 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 pointer-events-none group-hover:pointer-events-auto">
            <div className="flex flex-col items-end gap-2 mb-3">
              {CATEGORY_TEMPLATES.slice(0, 3).map((template, index) => (
                <div
                  key={template.id}
                  className="flex items-center gap-3 bg-white rounded-lg shadow-lg p-3 border border-gray-200 hover:shadow-xl transition-all duration-200 cursor-pointer"
                  onClick={() => handleCreateCategory(template)}
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    animation: `slideInRight 0.3s ease-out ${index * 100}ms both`
                  }}
                >
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-500">{template.description}</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-xl border border-gray-200">
                    {template.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main FAB Button */}
          <button
            onClick={() => handleCreateCategory()}
            className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-white group-hover:scale-110"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-16 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {t('categories.create.button')}
          </div>
        </div>
      </div>

    </div>
  );
};

export default CategoryManager;
