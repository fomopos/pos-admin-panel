import React from 'react';
import { TagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Widget } from '../ui';
import type { Product } from '../../services/types/product.types';

interface ProductAttributesTabProps {
  formData: Partial<Product>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleArrayInputChange: (field: string, value: string) => void;
  handleObjectInputChange: (parent: string, key: string, value: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>;
}

export const ProductAttributesTabAlternative: React.FC<ProductAttributesTabProps> = ({
  formData,
  handleArrayInputChange,
  handleObjectInputChange,
  setFormData
}) => {
  return (
    <div className="space-y-6">
      {/* Tags Widget - Enhanced Version */}
      <Widget
        title="Tags & Labels"
        description="Add searchable tags and labels for this product"
        icon={TagIcon}
        variant="default"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          
          {/* Tags Display */}
          {formData.attributes?.tags && formData.attributes.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.attributes.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = formData.attributes?.tags?.filter((_, i) => i !== index) || [];
                      handleArrayInputChange('attributes.tags', newTags.join(', '));
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* Enhanced Tags Input */}
          <textarea
            value={formData.attributes?.tags?.join(', ') || ''}
            onChange={(e) => {
              // Explicitly handle the input to ensure commas and spaces work
              const value = e.target.value;
              handleArrayInputChange('attributes.tags', value);
            }}
            onKeyDown={(e) => {
              // Prevent any event blocking for comma and space
              if (e.key === ',' || e.key === ' ') {
                e.stopPropagation();
              }
              // Allow Enter to add tags too
              if (e.key === 'Enter') {
                e.preventDefault();
                const value = e.currentTarget.value;
                if (value.trim()) {
                  handleArrayInputChange('attributes.tags', value);
                }
              }
            }}
            onBlur={(e) => {
              // Clean up tags when user loses focus
              const value = e.target.value;
              if (value.trim()) {
                handleArrayInputChange('attributes.tags', value);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y"
            placeholder="Enter tags separated by commas (e.g., electronics, premium, wireless)"
            rows={3}
            style={{ minHeight: '60px' }}
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple tags with commas. You can also use spaces within tag names. Press Enter to add tags.
          </p>
          
          {/* Example tags for guidance */}
          <div className="mt-2">
            <p className="text-xs text-gray-400 mb-1">Examples:</p>
            <div className="flex flex-wrap gap-1">
              {['electronics', 'premium', 'wireless', 'bluetooth', 'portable'].map(example => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    const currentTags = formData.attributes?.tags || [];
                    if (!currentTags.includes(example)) {
                      const newTagsString = [...currentTags, example].join(', ');
                      handleArrayInputChange('attributes.tags', newTagsString);
                    }
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  + {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Widget>

      {/* Custom Attributes Widget */}
      <Widget
        title="Custom Attributes"
        description="Add custom key-value pairs for additional product information"
        icon={TagIcon}
        variant="default"
      >
        <div className="space-y-3">
          {Object.entries(formData.attributes?.custom_attributes || {}).map(([key, value], index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  const newCustomAttributes = { ...formData.attributes?.custom_attributes };
                  delete newCustomAttributes[key];
                  newCustomAttributes[e.target.value] = value as string;
                  setFormData(prev => ({ 
                    ...prev, 
                    attributes: { 
                      ...prev.attributes,
                      custom_attributes: newCustomAttributes || {}
                    }
                  }));
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Attribute name"
              />
              <input
                type="text"
                value={value as string}
                onChange={(e) => handleObjectInputChange('attributes.custom_attributes', key, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Attribute value"
              />
              <button
                type="button"
                onClick={() => {
                  const newCustomAttributes = { ...formData.attributes?.custom_attributes };
                  delete newCustomAttributes[key];
                  setFormData(prev => ({ 
                    ...prev, 
                    attributes: { 
                      ...prev.attributes,
                      custom_attributes: newCustomAttributes || {}
                    }
                  }));
                }}
                className="p-2 text-red-600 hover:text-red-800"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newKey = `attribute_${Date.now()}`;
              setFormData(prev => ({ 
                ...prev, 
                attributes: { 
                  ...prev.attributes,
                  custom_attributes: {
                    ...prev.attributes?.custom_attributes,
                    [newKey]: ''
                  }
                }
              }));
            }}
            className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700"
          >
            + Add Custom Attribute
          </button>
        </div>
      </Widget>

      {/* Properties Widget */}
      <Widget
        title="Properties"
        description="Define specific properties and characteristics"
        icon={TagIcon}
        variant="default"
      >
        <div className="space-y-3">
          {Object.entries(formData.attributes?.properties || {}).map(([key, value], index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  const newProperties = { ...formData.attributes?.properties };
                  delete newProperties[key];
                  newProperties[e.target.value] = value as string;
                  setFormData(prev => ({ 
                    ...prev, 
                    attributes: { 
                      ...prev.attributes,
                      properties: newProperties || {}
                    }
                  }));
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Property name"
              />
              <input
                type="text"
                value={value as string}
                onChange={(e) => handleObjectInputChange('attributes.properties', key, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Property value"
              />
              <button
                type="button"
                onClick={() => {
                  const newProperties = { ...formData.attributes?.properties };
                  delete newProperties[key];
                  setFormData(prev => ({ 
                    ...prev, 
                    attributes: { 
                      ...prev.attributes,
                      properties: newProperties || {}
                    }
                  }));
                }}
                className="p-2 text-red-600 hover:text-red-800"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newKey = `property_${Date.now()}`;
              setFormData(prev => ({ 
                ...prev, 
                attributes: { 
                  ...prev.attributes,
                  properties: {
                    ...prev.attributes?.properties,
                    [newKey]: ''
                  }
                }
              }));
            }}
            className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700"
          >
            + Add Property
          </button>
        </div>
      </Widget>
    </div>
  );
};
