import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  PlusIcon,
  SparklesIcon,
  FolderPlusIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';

interface CreateCategoryCardProps {
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}

export const CreateCategoryCard: React.FC<CreateCategoryCardProps> = ({
  onClick,
  className = '',
  variant = 'default'
}) => {
  const { t } = useTranslation();

  if (variant === 'compact') {
    return (
      <Card 
        className={`group bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 hover:border-blue-300 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 cursor-pointer ${className}`}
        onClick={onClick}
      >
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <PlusIcon className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">
              {t('categories.create.newCategory')}
            </h3>
            <p className="text-xs text-gray-600">
              {t('categories.create.newCategoryDescription')}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card 
        className={`group bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 cursor-pointer transform hover:scale-105 shadow-lg hover:shadow-xl ${className}`}
        onClick={onClick}
      >
        <div className="p-6 text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-200">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
              <PlusIcon className="w-3 h-3 text-yellow-900" />
            </div>
          </div>
          
          <h3 className="text-lg font-bold mb-2">
            {t('categories.create.newCategory')}
          </h3>
          
          <p className="text-blue-100 text-sm mb-4">
            {t('categories.create.newCategoryDescription')}
          </p>
          
          <div className="flex items-center justify-center gap-2 text-blue-100">
            <FolderPlusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{t('categories.create.button')}</span>
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card 
      className={`group bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 hover:border-blue-300 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="p-6 flex flex-col items-center justify-center h-full min-h-[200px] text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
          <PlusIcon className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('categories.create.newCategory')}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          {t('categories.create.newCategoryDescription')}
        </p>
        
        <div className="flex flex-wrap gap-1 justify-center mb-4">
          <span className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
            📱 {t('categories.create.features.mobile')}
          </span>
          <span className="inline-block px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
            🏷️ {t('categories.create.features.tags')}
          </span>
          <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
            📂 {t('categories.create.features.hierarchy')}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-blue-600 group-hover:text-blue-700 transition-colors">
          <PlusIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{t('categories.create.button')}</span>
        </div>
      </div>
    </Card>
  );
};

export default CreateCategoryCard;
