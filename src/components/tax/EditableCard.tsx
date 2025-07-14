import React from 'react';
import { PencilIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

interface EditableCardProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
  className?: string;
  showDeleteButton?: boolean;
}

/**
 * EditableCard - A reusable card component for Tax Settings
 * 
 * Features:
 * - Edit/view mode toggle
 * - Hover effects with shadow and color changes
 * - Optional delete functionality
 * - Consistent styling across tax components
 */
const EditableCard: React.FC<EditableCardProps> = ({
  isEditing,
  onToggleEdit,
  onDelete,
  children,
  className = '',
  showDeleteButton = true
}) => {
  return (
    <div 
      className={`
        p-6 bg-white border border-gray-200 rounded-xl 
        transition-all duration-200 ease-in-out
        hover:shadow-lg hover:border-blue-200 hover:bg-blue-50/30
        ${className}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {children}
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2 ml-4">
          {/* Edit/Done Button */}
          <button
            onClick={onToggleEdit}
            className={`
              p-2 rounded-lg transition-all duration-200 ease-in-out
              ${isEditing 
                ? 'bg-green-100 text-green-600 hover:bg-green-200 hover:shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 hover:shadow-md'
              }
            `}
            title={isEditing ? 'Save changes' : 'Edit item'}
          >
            {isEditing ? (
              <CheckCircleIcon className="h-4 w-4" />
            ) : (
              <PencilIcon className="h-4 w-4" />
            )}
          </button>
          
          {/* Delete Button */}
          {showDeleteButton && onDelete && (
            <button
              onClick={onDelete}
              className="
                p-2 bg-red-100 text-red-600 rounded-lg 
                transition-all duration-200 ease-in-out
                hover:bg-red-200 hover:shadow-md hover:scale-105
              "
              title="Delete item"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditableCard;
