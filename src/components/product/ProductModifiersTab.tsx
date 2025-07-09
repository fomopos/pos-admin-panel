import React from 'react';
import { CubeIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Widget, Button } from '../ui';
import ProductModifierManager from './ProductModifierManager';
import type { Product } from '../../services/types/product.types';
import type { GlobalModifierTemplate } from '../../services/modifier/globalModifier.service';

interface ProductModifiersTabProps {
  formData: Partial<Product>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>;
  isLoading: boolean;
  globalTemplates: GlobalModifierTemplate[];
  showTemplatesBrowser: boolean;
  setShowTemplatesBrowser: React.Dispatch<React.SetStateAction<boolean>>;
  applyGlobalTemplate: (template: GlobalModifierTemplate) => void;
}

export const ProductModifiersTab: React.FC<ProductModifiersTabProps> = ({
  formData,
  setFormData,
  isLoading,
  globalTemplates,
  showTemplatesBrowser,
  setShowTemplatesBrowser,
  applyGlobalTemplate
}) => {
  return (
    <div className="space-y-6">
      {/* Modifiers Header Widget */}
      <Widget
        title="Product Modifiers"
        description="Configure modifiers and options for this product"
        icon={CubeIcon}
        variant="default"
        headerActions={
          <Button
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
            }}
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

      {/* Template Browser Modal would go here */}
      {showTemplatesBrowser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Global Modifier Templates</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplatesBrowser(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {globalTemplates.map((template) => (
                  <div key={template.group_id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="text-xs text-gray-500 mb-3">
                      {template.modifiers?.length || 0} options
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => applyGlobalTemplate(template)}
                      className="w-full"
                    >
                      Apply Template
                    </Button>
                  </div>
                ))}
              </div>
              {globalTemplates.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No global modifier templates available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
