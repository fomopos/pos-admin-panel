import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { PageHeader, Button, ConfirmDialog, Loading, InputTextField } from '../components/ui';
import { GlobalModifierManager } from '../components/modifier';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';
import { globalModifierService, type GlobalModifierTemplate } from '../services/modifier/globalModifier.service';

const GlobalModifierEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { currentStore, currentTenant } = useTenantStore();
  
  const [formData, setFormData] = useState<Partial<GlobalModifierTemplate>>({
    name: '',
    description: '',
    selection_type: 'multiple',
    required: false,
    sort_order: 1,
    price_delta: 0,
    modifiers: [] // Ensure this is always an array
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

  // Load existing template data for editing
  useEffect(() => {
    const loadTemplate = async () => {
      if (isEditing && id && currentTenant && currentStore) {
        setIsLoadingData(true);
        try {
          const apiGroup = await globalModifierService.getGlobalModifierGroup(
            currentTenant.id,
            currentStore.store_id,
            id
          );

          const template = globalModifierService.mapApiGlobalModifierGroupToInternal(apiGroup);
          
          setFormData(template);
        } catch (error) {
          console.error('Error loading template:', error);
          // Handle error - maybe show a toast or redirect
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    loadTemplate();
  }, [isEditing, id, currentTenant, currentStore]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate basic fields
    if (!formData.name?.trim()) {
      newErrors.name = 'Template name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Template name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Template name must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Validate modifier data
    if (formData.modifiers && formData.modifiers.length > 0) {
      // Basic validation for modifiers
      for (let i = 0; i < formData.modifiers.length; i++) {
        const modifier = formData.modifiers[i];
        if (!modifier.name?.trim()) {
          newErrors[`modifier_${i}_name`] = `Modifier ${i + 1} name is required`;
        }
        if (typeof modifier.price_delta !== 'number') {
          newErrors[`modifier_${i}_price`] = `Modifier ${i + 1} price must be a number`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!currentTenant || !currentStore) {
      console.error('Tenant or store not selected');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isEditing && id) {
        // Update existing template
        await globalModifierService.updateGlobalModifierGroup(
          currentTenant.id,
          currentStore.store_id,
          id,
          {
            group_id: id,
            store_id: currentStore.store_id,
            name: formData.name!,
            description: formData.description,
            selection_type: formData.selection_type!,
            exact_selections: formData.exact_selections,
            max_selections: formData.max_selections,
            min_selections: formData.min_selections,
            required: formData.required!,
            sort_order: formData.sort_order!,
            price_delta: formData.price_delta,
            active: true,
            modifiers: (formData.modifiers || []).map(modifier => ({
              modifier_id: modifier.modifier_id,
              name: modifier.name,
              price_delta: modifier.price_delta,
              default_selected: modifier.default_selected,
              sort_order: modifier.sort_order,
              active: true
            }))
          }
        );
        
        console.log('Template updated successfully');
      } else {
        // Create new template
        const createRequest = globalModifierService.mapInternalToCreateGlobalGroupRequest(
          formData as GlobalModifierTemplate,
          currentStore.store_id
        );
        
        await globalModifierService.createGlobalModifierGroup(
          currentTenant.id,
          currentStore.store_id,
          createRequest
        );
        
        console.log('Template created successfully');
      }
      
      navigate('/global-modifiers');
    } catch (error) {
      console.error('Error saving template:', error);
      // Handle error - maybe show a toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentTenant || !currentStore || !id) {
      console.error('Missing required data for deletion');
      return;
    }

    const templateName = formData.name || 'this template';
    
    deleteDialog.openDeleteDialog(templateName, async () => {
      setIsLoading(true);
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
        // Handle error - maybe show a toast notification
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleBack = () => {
    navigate('/global-modifiers');
  };

  // Show loading screen while fetching data
  if (isLoadingData) {
    return (
      <Loading
        title={isEditing ? "Loading Template" : "Initializing"}
        description={isEditing ? "Please wait while we fetch the template details..." : "Setting up the template form..."}
        fullScreen={true}
        size="lg"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-3 sm:p-6">
        {/* Header */}
        <PageHeader
          title={isEditing ? 'Edit Modifier Template' : 'Create Modifier Template'}
          description={isEditing ? `Modify template details and configurations` : 'Create a new reusable modifier template'}
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
            
            {isEditing && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isLoading}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            )}
          </div>
        </PageHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-3 sm:px-6 py-4 sm:py-8">
            {/* Basic Information */}
            <div className="space-y-4 sm:space-y-6 mb-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Template Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Template Name */}
                <InputTextField
                  label="Template Name"
                  required
                  value={formData.name || ''}
                  onChange={(value) => handleInputChange('name', value)}
                  placeholder="e.g., Pizza Toppings, Drink Sizes, Spice Levels"
                  error={errors.name}
                />

                {/* Sort Order */}
                <InputTextField
                  type="number"
                  label="Sort Order"
                  value={formData.sort_order?.toString() || '1'}
                  onChange={(value) => handleInputChange('sort_order', parseInt(value) || 1)}
                  placeholder="1"
                  min={1}
                  helperText="Display order in menus"
                />

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional description for this modifier template"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modifier Configuration */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Modifier Configuration</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configure the modifiers and options for this template.
                </p>
              </div>
              
              {/* Global Modifier Configuration */}
              <GlobalModifierManager
                template={{
                  name: formData.name || '',
                  description: formData.description,
                  selection_type: formData.selection_type || 'multiple',
                  exact_selections: formData.exact_selections,
                  max_selections: formData.max_selections,
                  min_selections: formData.min_selections,
                  required: formData.required || false,
                  sort_order: formData.sort_order || 1,
                  price_delta: formData.price_delta,
                  modifiers: formData.modifiers || []
                }}
                onChange={(template) => {
                  setFormData(prev => ({
                    ...prev,
                    // Keep the form name and description from the inputs above
                    selection_type: template.selection_type,
                    exact_selections: template.exact_selections,
                    max_selections: template.max_selections,
                    min_selections: template.min_selections,
                    required: template.required,
                    sort_order: template.sort_order,
                    price_delta: template.price_delta,
                    modifiers: template.modifiers
                  }));
                }}
                disabled={isLoading}
              />

              {/* Template Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Template Guidelines</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Template Name:</strong> Choose a descriptive name that clearly identifies the modifier purpose</li>
                  <li>• <strong>Selection Type:</strong> Define how customers can select from the modifiers</li>
                  <li>• <strong>Price Delta:</strong> Set base price adjustments for the group and individual modifiers</li>
                  <li>• <strong>Required Templates:</strong> Force customers to make a selection when applied to products</li>
                  <li>• <strong>Reusability:</strong> Templates can be applied to multiple products for consistency</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>{isEditing ? 'Update Template' : 'Create Template'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
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

export default GlobalModifierEdit;
