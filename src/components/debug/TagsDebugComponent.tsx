import React from 'react';
import type { Product } from '../../services/types/product.types';

interface TagsDebugProps {
  formData: Partial<Product>;
  title?: string;
}

export const TagsDebugComponent: React.FC<TagsDebugProps> = ({ 
  formData, 
  title = "Tags Debug Info" 
}) => {
  const tags = formData.attributes?.tags || [];
  const customAttributes = formData.attributes?.custom_attributes || {};
  
  return (
    <div className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300 mt-4">
      <h4 className="font-semibold text-sm text-gray-700 mb-2">{title}</h4>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>formData.attributes.tags:</strong>
          <pre className="bg-white p-2 rounded mt-1 overflow-x-auto">
            {JSON.stringify(tags, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>formData.attributes.custom_attributes:</strong>
          <pre className="bg-white p-2 rounded mt-1 overflow-x-auto">
            {JSON.stringify(customAttributes, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>API Payload (custom_attribute):</strong>
          <pre className="bg-white p-2 rounded mt-1 overflow-x-auto">
            {JSON.stringify({
              ...customAttributes,
              tags: tags
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TagsDebugComponent;
