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

export const ProductAttributesTab: React.FC<ProductAttributesTabProps> = ({
  formData,
  handleArrayInputChange,
  handleObjectInputChange,
  setFormData
}) => {
  return (
    <div className="space-y-6">
      {/* Tags Widget */}
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
          <input
            type="text"
            value={formData.attributes?.tags?.join(', ') || ''}
            onChange={(e) => handleArrayInputChange('attributes.tags', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter tags separated by commas"
          />
          <p className="mt-1 text-xs text-gray-500">Separate multiple tags with commas</p>
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
