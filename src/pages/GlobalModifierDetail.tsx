import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  TagIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { PageHeader, Button, ConfirmDialog, Loading } from '../components/ui';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';
import { globalModifierService, type GlobalModifierTemplate } from '../services/modifier/globalModifier.service';

const GlobalModifierDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentStore, currentTenant } = useTenantStore();
  
  const [template, setTemplate] = useState<GlobalModifierTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<{
    usage_count: number;
    products: Array<{ item_id: string; name: string }>;
  } | null>(null);

  // Dialog hook for delete confirmations
  const deleteDialog = useDeleteConfirmDialog();

  // Load template data
  useEffect(() => {
    const loadTemplate = async () => {
      if (!id || !currentTenant || !currentStore) return;

      setIsLoading(true);
      setError(null);
      
      try {
        const apiGroup = await globalModifierService.getGlobalModifierGroup(
          currentTenant.id,
          currentStore.store_id,
          id
        );

        const templateData = globalModifierService.mapApiGlobalModifierGroupToInternal(
          apiGroup
        );
        
        setTemplate(templateData);

        // Load usage statistics
        try {
          const stats = await globalModifierService.getTemplateUsageStats(
            currentTenant.id,
            currentStore.store_id,
            id
          );
          setUsageStats(stats);
        } catch (error) {
          console.warn('Could not load usage stats:', error);
        }
      } catch (error) {
        console.error('Error loading template:', error);
        setError(error instanceof Error ? error.message : 'Failed to load global modifier template');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [id, currentTenant, currentStore]);

  const handleEdit = () => {
    navigate(`/global-modifiers/edit/${id}`);
  };

  const handleDuplicate = async () => {
    if (!template || !currentTenant || !currentStore) return;

    try {
      setIsLoading(true);
      
      // Create a copy of the template
      const duplicatedTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        template_id: undefined,
        group_id: undefined,
        modifiers: template.modifiers.map(mod => ({
          ...mod,
          modifier_id: undefined
        }))
      };

      // Create the new global modifier group with modifiers included
      const newGroup = await globalModifierService.createGlobalModifierGroup(
        currentTenant.id,
        currentStore.store_id,
        globalModifierService.mapInternalToCreateGlobalGroupRequest(
          duplicatedTemplate,
          currentStore.store_id
        )
      );

      // Navigate to the new template
      navigate(`/global-modifiers/edit/${newGroup.group_id}`);
    } catch (error) {
      console.error('Error duplicating template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!template || !currentTenant || !currentStore || !id) return;

    deleteDialog.openDeleteDialog(
      template.name,
      async () => {
        try {
          await globalModifierService.deleteGlobalModifierGroup(
            currentTenant.id,
            currentStore.store_id,
            id
          );
          console.log('Template deleted successfully');
          navigate('/global-modifiers');
        } catch (error) {
          console.error('Error deleting template:', error);
        }
      }
    );
  };

  const handleBack = () => {
    navigate('/global-modifiers');
  };

  const getSelectionTypeDisplay = (selectionType: string, template: GlobalModifierTemplate) => {
    switch (selectionType) {
      case 'single':
        return 'Single Choice';
      case 'multiple':
        return 'Multiple Choice';
      case 'exact':
        return `Exact ${template.exact_selections || 1} Selection${(template.exact_selections || 1) !== 1 ? 's' : ''}`;
      case 'limited':
        return `${template.min_selections || 0}-${template.max_selections || '∞'} Selections`;
      default:
        return selectionType;
    }
  };

  if (isLoading) {
    return (
      <Loading
        title="Loading Template"
        description="Please wait while we fetch the template details..."
        fullScreen={false}
        size="lg"
      />
    );
  }

  if (error || !template) {
    return (
      <div className="p-3 sm:p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error ? 'Error Loading Template' : 'Template Not Found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {error || 'The requested modifier template could not be found.'}
          </p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <PageHeader
        title={template.name}
        description={template.description || 'Global modifier template details'}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Templates</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDuplicate}
            className="flex items-center space-x-2"
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
            <span>Duplicate</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex items-center space-x-2"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDelete}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Overview</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selection Type
                </label>
                <div className="flex items-center space-x-2">
                  <TagIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {getSelectionTypeDisplay(template.selection_type, template)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required
                </label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  template.required 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {template.required ? 'Required' : 'Optional'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <span className="text-sm text-gray-900">{template.sort_order}</span>
              </div>

              {template.price_delta && template.price_delta !== 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Price Delta
                  </label>
                  <span className={`text-sm font-medium ${
                    template.price_delta > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {template.price_delta > 0 ? '+' : ''}${template.price_delta}
                  </span>
                </div>
              )}
            </div>

            {template.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            )}
          </div>

          {/* Modifiers List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Modifiers ({template.modifiers.length})
            </h3>
            
            {template.modifiers.length > 0 ? (
              <div className="space-y-3">
                {template.modifiers
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((modifier, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{modifier.name}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>Sort Order: {modifier.sort_order}</span>
                          {modifier.default_selected && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              Default Selected
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {modifier.price_delta !== 0 && (
                        <div className={`text-sm font-medium ${
                          modifier.price_delta > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {modifier.price_delta > 0 ? '+' : ''}${modifier.price_delta}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CubeIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm">No modifiers defined for this template</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Usage Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Usage Statistics
            </h3>
            
            {usageStats ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{usageStats.usage_count}</div>
                  <div className="text-sm text-blue-800">Products Using This Template</div>
                </div>
                
                {usageStats.products.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Used By:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {usageStats.products.map((product, index) => (
                        <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                          {product.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-sm">Usage statistics not available</p>
              </div>
            )}
          </div>

          {/* Template Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Info</h3>
            
            <div className="space-y-3 text-sm">
              {template.created_at && (
                <div>
                  <span className="text-gray-500">Created:</span>
                  <div className="text-gray-900">
                    {new Date(template.created_at).toLocaleDateString()}
                  </div>
                </div>
              )}
              
              {template.updated_at && (
                <div>
                  <span className="text-gray-500">Last Modified:</span>
                  <div className="text-gray-900">
                    {new Date(template.updated_at).toLocaleDateString()}
                  </div>
                </div>
              )}
              
              <div>
                <span className="text-gray-500">Template ID:</span>
                <div className="text-gray-900 font-mono text-xs">{template.group_id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
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

export default GlobalModifierDetail;
