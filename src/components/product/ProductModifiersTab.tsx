import React from 'react';
import { CubeIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Widget, Button, Modal } from '../ui';
import ProductModifierManager from './ProductModifierManager';
import type { Product, ProductFormErrors } from '../../services/types/product.types';
import type { GlobalModifierTemplate } from '../../services/modifier/globalModifier.service';

interface ProductModifiersTabProps {
  formData: Partial<Product>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>;
  errors?: ProductFormErrors;
  isLoading: boolean;
  globalTemplates: GlobalModifierTemplate[];
  showTemplatesBrowser: boolean;
  setShowTemplatesBrowser: React.Dispatch<React.SetStateAction<boolean>>;
  applyGlobalTemplate: (template: GlobalModifierTemplate) => void;
  onValidateField?: (fieldName: string, value: any) => void;
}

export const ProductModifiersTab: React.FC<ProductModifiersTabProps> = ({
  formData,
  setFormData,
  errors,
  isLoading,
  globalTemplates,
  showTemplatesBrowser,
  setShowTemplatesBrowser,
  applyGlobalTemplate,
  onValidateField
}) => {
  // Check if there are any modifier-related errors
  const hasModifierErrors = errors && Object.keys(errors).some(key => 
    key === 'modifier_groups' || key.startsWith('modifier_groups.')
  );

  // Get modifier error details for better display
  const getModifierErrorDetails = () => {
    if (!errors) return [];
    
    return Object.entries(errors)
      .filter(([field]) => field === 'modifier_groups' || field.startsWith('modifier_groups.'))
      .map(([field, error]) => {
        let displayField = field;
        
        // Parse field path for better display
        if (field.startsWith('modifier_groups.')) {
          const parts = field.split('.');
          if (parts.length >= 3) {
            const groupIndex = parseInt(parts[1]) + 1;
            const groupField = parts[2];
            
            if (parts.length >= 5) {
              // Modifier-specific field
              const modifierIndex = parseInt(parts[3]) + 1;
              const modifierField = parts[4];
              displayField = `Group ${groupIndex}, Modifier ${modifierIndex} - ${modifierField}`;
            } else {
              // Group-specific field
              displayField = `Group ${groupIndex} - ${groupField}`;
            }
          }
        }
        
        return { field: displayField, error };
      });
  };

  return (
    <div className="space-y-6">
      {/* Display modifier validation errors */}
      {hasModifierErrors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-900 mb-2">Modifier Validation Errors</h4>
          <ul className="text-sm text-red-800 space-y-1">
            {getModifierErrorDetails().map(({ field, error }, index) => (
              <li key={index}>• <strong>{field}:</strong> {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Modifiers Header Widget */}
      <Widget
        title="Product Modifiers"
        description="Configure modifiers and options for this product"
        icon={CubeIcon}
        variant="default"
        headerActions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTemplatesBrowser(true)}
            className="flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add from Templates</span>
          </Button>
        }
      >
        <div className="space-y-4">
          {/* Global Templates Section */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-purple-900 mb-2">Global Modifier Templates</h4>
            <p className="text-sm text-purple-700 mb-3">
              Apply pre-configured modifier groups from your global templates to quickly set up common options.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTemplatesBrowser(true)}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Browse Templates ({globalTemplates.length} available)</span>
            </Button>
          </div>
          
          {/* Modifier Manager */}
          <ProductModifierManager
            modifierGroups={formData.modifier_groups || []}
            onChange={(modifierGroups: any) => {
              setFormData(prev => ({
                ...prev,
                modifier_groups: modifierGroups
              }));
              // Validate the entire modifier_groups when changed
              if (onValidateField) {
                onValidateField('modifier_groups', modifierGroups);
              }
            }}
            errors={errors}
            onValidateField={onValidateField}
            disabled={isLoading}
          />
        </div>
      </Widget>

      {/* Modifiers Help Widget */}
      <Widget
        title="Modifier Guidelines"
        description="Tips for setting up effective product modifiers"
        variant="default"
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Validation Rules</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Group names are required and must be 2-100 characters</li>
              <li>• Each group must have at least one modifier</li>
              <li>• Modifier names are required and must be 2-100 characters</li>
              <li>• Price deltas must be valid numbers (can be negative)</li>
              <li>• Sort order must be positive integers</li>
              <li>• Selection constraints must be logical (min ≤ max)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Best Practices</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use clear, descriptive names for modifier groups and options</li>
              <li>• Set appropriate price adjustments for premium options</li>
              <li>• Configure minimum and maximum selection limits as needed</li>
              <li>• Test your modifiers in the POS to ensure proper functionality</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Common Examples</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Size options (Small, Medium, Large)</li>
              <li>• Add-ons (Extra cheese, Bacon, etc.)</li>
              <li>• Customizations (Color, Material, etc.)</li>
              <li>• Service options (Installation, Warranty, etc.)</li>
            </ul>
          </div>
        </div>
      </Widget>

      {/* Global Modifier Templates Modal */}
      <Modal
        isOpen={showTemplatesBrowser}
        onClose={() => setShowTemplatesBrowser(false)}
        title="Global Modifier Templates"
        size="lg"
        footer={
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTemplatesBrowser(false)}
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {globalTemplates.map((template) => (
              <div key={template.group_id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    {template.description && (
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {template.modifiers?.length || 0} options available
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {template.selection_type}
                    </span>
                  </div>
                  
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      applyGlobalTemplate(template);
                      setShowTemplatesBrowser(false);
                    }}
                    className="w-full"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Apply Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty State */}
          {globalTemplates.length === 0 && (
            <div className="text-center py-12">
              <CubeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Templates Available
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                No global modifier templates have been created yet. Create templates in the Global Modifiers section to use them here.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTemplatesBrowser(false)}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
