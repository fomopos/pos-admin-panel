import React from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { Widget, InputTextField } from '../ui';
import type { Product } from '../../services/types/product.types';

interface ProductMediaTabProps {
  formData: Partial<Product>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const ProductMediaTab: React.FC<ProductMediaTabProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <Widget
      title="Product Media"
      description="Add images and media content for this product"
      icon={PhotoIcon}
      variant="default"
    >
      <div className="space-y-6">
        {/* Image URL */}
        <InputTextField
          label="Image URL"
          value={formData.media?.image_url}
          onChange={(value) => onInputChange({ target: { name: 'media.image_url', value, type: 'text' } } as any)}
          placeholder="Enter image URL"
        />

        {/* Image Preview */}
        {formData.media?.image_url && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Preview
            </label>
            <div className="border border-gray-300 rounded-md p-4">
              <img
                src={formData.media.image_url}
                alt="Product preview"
                className="max-w-full h-auto max-h-48 rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Media Upload Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Media Guidelines</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Recommended image size: 800x800 pixels</li>
            <li>• Supported formats: JPG, PNG, WebP</li>
            <li>• Maximum file size: 5MB</li>
            <li>• Use high-quality images for better customer experience</li>
          </ul>
        </div>
      </div>
    </Widget>
  );
};
