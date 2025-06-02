import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FolderIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import type { EnhancedCategory } from '../../types/category';

interface CategoryCardProps {
  category: EnhancedCategory;
  onEdit?: (category: EnhancedCategory) => void;
  onDelete?: (category: EnhancedCategory) => void;
  onViewDetails?: (category: EnhancedCategory) => void;
  className?: string;
  showActions?: boolean;
  showSubcategories?: boolean;
  subcategories?: EnhancedCategory[];
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onViewDetails,
  className = '',
  showActions = true,
  showSubcategories = false,
  subcategories = []
}) => {
  const { t } = useTranslation();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(category);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(category);
  };

  const handleViewDetails = () => {
    if (onViewDetails) onViewDetails(category);
  };

  return (
    <Card 
      className={`group hover:shadow-lg transition-all duration-200 cursor-pointer ${className}`}
      onClick={handleViewDetails}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Category Icon */}
            <div className="flex-shrink-0">
              {category.icon_url ? (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-xl border border-gray-200">
                  {category.icon_url.startsWith('http') ? (
                    <img 
                      src={category.icon_url} 
                      alt={`${category.name} icon`} 
                      className="w-8 h-8 rounded object-cover" 
                    />
                  ) : (
                    <span>{category.icon_url}</span>
                  )}
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <FolderIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Category Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {category.name}
                </h3>
                <div className="flex-shrink-0">
                  {category.is_active ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>
              
              {category.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {category.tags && category.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {category.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
            {category.tags.length > 3 && (
              <span className="inline-block px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                +{category.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Image */}
        {category.image_url && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img
              src={category.image_url}
              alt={category.name}
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>
              {t('categories.card.order')}: {category.sort_order}
            </span>
            {category.display_on_main_screen && (
              <div className="flex items-center gap-1 text-blue-600">
                <EyeIcon className="w-3 h-3" />
                <span>{t('categories.card.mainScreen')}</span>
              </div>
            )}
          </div>

          {showSubcategories && subcategories.length > 0 && (
            <div className="flex items-center gap-1 text-gray-600">
              <span>{subcategories.length} {t('categories.card.subcategories')}</span>
              <ChevronRightIcon className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Subcategories Preview */}
        {showSubcategories && subcategories.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700">
                {t('categories.card.subcategoriesLabel')}:
              </span>
              <div className="flex flex-wrap gap-1">
                {subcategories.slice(0, 2).map((sub) => (
                  <span
                    key={sub.category_id}
                    className="inline-block px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                  >
                    {sub.name}
                  </span>
                ))}
                {subcategories.length > 2 && (
                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                    +{subcategories.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CategoryCard;
