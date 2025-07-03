import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CubeIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { PageHeader, Button, ConfirmDialog, Loading } from '../components/ui';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';
import { useTenantStore } from '../tenants/tenantStore';
import { globalModifierService, type GlobalModifierTemplate } from '../services/modifier/globalModifier.service';

interface GlobalModifierFilters {
  search: string;
  selectionType: 'all' | 'single' | 'multiple' | 'exact' | 'limited';
  required: 'all' | 'required' | 'optional';
  status: 'all' | 'active' | 'inactive';
}

const GlobalModifiers: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  
  // State management
  const [modifierTemplates, setModifierTemplates] = useState<GlobalModifierTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<GlobalModifierFilters>({
    search: '',
    selectionType: 'all',
    required: 'all',
    status: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Dialog hook for delete confirmations
  const deleteDialog = useDeleteConfirmDialog();

  // Load global modifier templates
  useEffect(() => {
    const loadModifierTemplates = async () => {
      if (!currentTenant || !currentStore) return;

      setIsLoading(true);
      try {
        // Single API call to get all groups with embedded modifiers
        const response = await globalModifierService.getGlobalModifierGroups(
          currentTenant.id,
          currentStore.store_id,
          {
            active: filters.status === 'all' ? undefined : filters.status === 'active',
            search: filters.search || undefined,
            limit: 100,
            includeModifiers: true // Include modifiers in the response to avoid N+1 API calls
          }
        );

        // Map the response directly since modifiers are already included
        // This eliminates the need for additional API calls per group
        const templates = response.items.map(group => 
          globalModifierService.mapApiGlobalModifierGroupToInternal(group)
        );

        setModifierTemplates(templates);
      } catch (error) {
        console.error('Error loading modifier templates:', error);
        setModifierTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadModifierTemplates();
  }, [currentTenant, currentStore]);

  // Filter modifier templates based on current filters
  const filteredTemplates = useMemo(() => {
    return modifierTemplates.filter(template => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = template.name.toLowerCase().includes(searchLower);
        const matchesDescription = template.description?.toLowerCase().includes(searchLower);
        const matchesModifiers = template.modifiers.some(mod => 
          mod.name.toLowerCase().includes(searchLower)
        );
        
        if (!matchesName && !matchesDescription && !matchesModifiers) {
          return false;
        }
      }

      // Selection type filter
      if (filters.selectionType !== 'all' && template.selection_type !== filters.selectionType) {
        return false;
      }

      // Required filter
      if (filters.required !== 'all') {
        const isRequired = template.required;
        if (filters.required === 'required' && !isRequired) return false;
        if (filters.required === 'optional' && isRequired) return false;
      }

      // Status filter (apply locally)
      if (filters.status !== 'all') {
        // Use the active property from the template
        const isActive = template.active !== false; // Default to active if not specified
        if (filters.status === 'active' && !isActive) return false;
        if (filters.status === 'inactive' && isActive) return false;
      }

      return true;
    });
  }, [modifierTemplates, filters]);

  const handleCreateNew = () => {
    navigate('/global-modifiers/new');
  };

  const handleEdit = (templateId: string) => {
    navigate(`/global-modifiers/edit/${templateId}`);
  };

  const handleView = (templateId: string) => {
    navigate(`/global-modifiers/${templateId}`);
  };

  const handleDuplicate = async (template: GlobalModifierTemplate) => {
    if (!currentTenant || !currentStore) return;

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

      // Create the new global modifier group with all modifiers included in a single API call
      // This avoids the need for separate modifier creation calls
      const newGroup = await globalModifierService.createGlobalModifierGroup(
        currentTenant.id,
        currentStore.store_id,
        globalModifierService.mapInternalToCreateGlobalGroupRequest(
          duplicatedTemplate,
          currentStore.store_id
        )
      );

      // Add the new template to local state instead of full page reload
      const newTemplate = globalModifierService.mapApiGlobalModifierGroupToInternal(newGroup);
      setModifierTemplates(prev => [...prev, newTemplate]);
    } catch (error) {
      console.error('Error duplicating template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (template: GlobalModifierTemplate) => {
    if (!currentTenant || !currentStore) return;

    deleteDialog.openDeleteDialog(
      template.name,
      async () => {
        try {
          await globalModifierService.deleteGlobalModifierGroup(
            currentTenant.id,
            currentStore.store_id,
            template.group_id!
          );
          
          // Remove from local state
          setModifierTemplates(prev => 
            prev.filter(t => t.group_id !== template.group_id)
          );
        } catch (error) {
          console.error('Error deleting template:', error);
        }
      }
    );
  };

  const getSelectionTypeDisplay = (selectionType: string, template: GlobalModifierTemplate) => {
    switch (selectionType) {
      case 'single':
        return 'Single Choice';
      case 'multiple':
        return 'Multiple Choice';
      case 'exact':
        return `Exact ${template.exact_selections || 1}`;
      case 'limited':
        return `${template.min_selections || 0}-${template.max_selections || '∞'}`;
      default:
        return selectionType;
    }
  };

  if (isLoading) {
    return (
      <Loading
        title="Loading Global Modifiers"
        description="Please wait while we fetch your modifier templates..."
        fullScreen={false}
        size="lg"
      />
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <PageHeader
        title="Global Modifiers"
        description="Manage reusable modifier templates that can be applied to multiple products"
      >
        <Button
          onClick={handleCreateNew}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Modifier Template</span>
        </Button>
      </PageHeader>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search modifier templates..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <FunnelIcon className="w-4 h-4" />
            <span>Filters</span>
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Selection Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selection Type
              </label>
              <select
                value={filters.selectionType}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  selectionType: e.target.value as GlobalModifierFilters['selectionType']
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="single">Single Choice</option>
                <option value="multiple">Multiple Choice</option>
                <option value="exact">Exact Selection</option>
                <option value="limited">Limited Selection</option>
              </select>
            </div>

            {/* Required Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required
              </label>
              <select
                value={filters.required}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  required: e.target.value as GlobalModifierFilters['required']
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="required">Required</option>
                <option value="optional">Optional</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  status: e.target.value as GlobalModifierFilters['status']
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredTemplates.length} of {modifierTemplates.length} modifier templates
        </p>
      </div>

      {/* Modifier Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {modifierTemplates.length === 0 ? 'No modifier templates found' : 'No templates match your filters'}
          </h3>
          <p className="text-gray-500 mb-4">
            {modifierTemplates.length === 0 
              ? 'Create your first modifier template to get started.' 
              : 'Try adjusting your search criteria or filters.'}
          </p>
          {modifierTemplates.length === 0 && (
            <Button onClick={handleCreateNew}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.group_id}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300"
            >
              {/* Template Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        {template.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Tags and Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <TagIcon className="w-3 h-3 mr-1" />
                    {getSelectionTypeDisplay(template.selection_type, template)}
                  </span>
                  {template.required && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                      Required
                    </span>
                  )}
                  {template.price_delta && template.price_delta !== 0 && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      template.price_delta > 0 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {template.price_delta > 0 ? '+' : ''}${template.price_delta}
                    </span>
                  )}
                </div>
              </div>

              {/* Modifiers List */}
              <div className="px-6 pb-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <CubeIcon className="w-4 h-4 mr-2 text-gray-500" />
                    Modifiers ({template.modifiers.length})
                  </h4>
                  {template.modifiers.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {template.modifiers.slice(0, 4).map((modifier, index) => (
                        <div key={index} className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-700 font-medium">{modifier.name}</span>
                          {modifier.price_delta !== 0 && (
                            <span className={`text-sm font-semibold ${
                              modifier.price_delta > 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {modifier.price_delta > 0 ? '+' : ''}${modifier.price_delta}
                            </span>
                          )}
                        </div>
                      ))}
                      {template.modifiers.length > 4 && (
                        <div className="text-sm text-gray-500 italic text-center pt-2 border-t border-gray-200">
                          +{template.modifiers.length - 4} more modifiers...
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center py-3">No modifiers defined</p>
                  )}
                </div>
              </div>

              {/* Elegant Action Buttons */}
              <div className="px-6 pb-6">
                <div className="flex flex-col space-y-3">
                  {/* Primary Actions */}
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleView(template.group_id!)}
                      variant="primary"
                      size="md"
                      className="flex-1"
                    >
                      <EyeIcon className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleEdit(template.group_id!)}
                      variant="secondary"
                      size="md"
                      className="flex-1"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  
                  {/* Secondary Actions */}
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleDuplicate(template)}
                      variant="outline"
                      size="md"
                      className="flex-1"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button
                      onClick={() => handleDelete(template)}
                      variant="destructiveReverse"
                      size="md"
                      className="flex-1"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default GlobalModifiers;
