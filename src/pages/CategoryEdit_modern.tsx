import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeftIcon,
  TrashIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ChevronDownIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  SparklesIcon,
  TagIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { categoryApiService } from '../services/category/categoryApiService';
import type { 
  EnhancedCategory, 
  CategoryTemplate,
  CategoryFormData
} from '../types/category';
import { 
  CATEGORY_TEMPLATES
} from '../types/category';

const CategoryEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  const isEditing = Boolean(id);
  
  // Get template from navigation state if provided
  const templateFromState = location.state?.template as CategoryTemplate | undefined;
  
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<EnhancedCategory[]>([]);
  const [showTemplates, setShowTemplates] = useState(!isEditing);
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  // File upload refs
  const iconInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parent_category_id: undefined,
    sort_order: 0,
    is_active: true,
    display_on_main_screen: false,
    icon_url: '',
    image_url: '',
    tags: [],
    properties: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load categories and existing category data
  useEffect(() => {
    const loadData = async () => {
      try {
        const categoriesData = await categoryApiService.getCategories();
        setCategories(categoriesData);

        if (isEditing && id) {
          const categoryData = await categoryApiService.getCategory(id);
          setFormData(categoryData);
        } else if (templateFromState) {
          // Apply template if provided from navigation
          applyTemplate(templateFromState);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [isEditing, id, templateFromState]);

  const applyTemplate = (template: CategoryTemplate) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      tags: template.tags || [],
      properties: template.properties || {},
    }));
    setShowTemplates(false);
  };

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('categories.errors.nameRequired');
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = t('categories.errors.descriptionTooLong');
    }
    
    if ((formData.sort_order || 0) < 0) {
      newErrors.sort_order = t('categories.errors.invalidSortOrder');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await categoryApiService.updateCategory(id, formData);
      } else {
        await categoryApiService.createCategory(formData);
      }
      navigate('/categories');
    } catch (error) {
      console.error('Failed to save category:', error);
      setErrors({ submit: t('categories.errors.saveFailed') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !id) return;
    
    if (!window.confirm(t('categories.delete.confirm', { name: formData.name }))) {
      return;
    }
    
    try {
      await categoryApiService.deleteCategory(id);
      navigate('/categories');
    } catch (error) {
      console.error('Failed to delete category:', error);
      setErrors({ submit: t('categories.errors.deleteFailed') });
    }
  };

  const handleFileUpload = async (file: File, type: 'icon' | 'image') => {
    // Implement file upload logic here
    console.log('Uploading file:', file, 'for', type);
  };

  const tabs = [
    { id: 'basic', label: t('categories.tabs.basic'), icon: ClipboardDocumentListIcon },
    { id: 'media', label: t('categories.tabs.media'), icon: PhotoIcon },
    { id: 'settings', label: t('categories.tabs.settings'), icon: CogIcon },
  ];

  const parentCategories = categories.filter(cat => 
    cat.category_id !== id && !cat.parent_category_id
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate('/categories')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                {t('common.backTo', { page: t('categories.title') })}
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEditing ? t('categories.edit.title') : t('categories.create.title')}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {isEditing 
                    ? 'Update category information and settings' 
                    : t('categories.create.subtitle')
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  {t('common.delete')}
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {isEditing ? t('common.save') : t('common.create')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
          
          {/* Template Selection (only for new categories) */}
          {!isEditing && showTemplates && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <SparklesIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {t('categories.templates.title')}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Choose a template to get started quickly or create a custom category
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {CATEGORY_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        {template.icon ? (
                          <img src={template.icon} alt="" className="w-10 h-10 rounded-lg" />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                            <TagIcon className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">
                          {template.name}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplates(false)}
                    className="w-full py-3 text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t('categories.templates.createCustom')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Tabs */}
          {(!showTemplates || isEditing) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50/50">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`${
                          isActive
                            ? 'border-blue-500 text-blue-600 bg-white'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } relative whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                          isActive ? '-mb-px' : ''
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                        {isActive && (
                          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'basic' && (
                  <div className="space-y-8">
                    {/* Basic Information Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-blue-600" />
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('categories.create.fields.name')} <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder={t('categories.create.placeholders.name')}
                              className={`${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} block w-full rounded-lg shadow-sm transition-colors duration-200`}
                            />
                            {errors.name && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                {errors.name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('categories.create.fields.description')}
                            </label>
                            <textarea
                              rows={4}
                              value={formData.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              placeholder={t('categories.create.placeholders.description')}
                              className={`${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} block w-full rounded-lg shadow-sm transition-colors duration-200 resize-none`}
                            />
                            {errors.description && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                {errors.description}
                              </p>
                            )}
                            <p className="mt-2 text-sm text-gray-500">
                              {formData.description.length}/500 characters
                            </p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('categories.create.fields.parentCategory')}
                            </label>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setShowParentDropdown(!showParentDropdown)}
                                className="relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                              >
                                <span className="block truncate">
                                  {formData.parent_category_id 
                                    ? categories.find(c => c.category_id === formData.parent_category_id)?.name
                                    : t('categories.create.selectParent')
                                  }
                                </span>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                                </span>
                              </button>

                              {showParentDropdown && (
                                <div className="absolute z-20 mt-1 w-full bg-white shadow-lg border border-gray-200 rounded-lg py-1 max-h-60 overflow-auto">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleInputChange('parent_category_id', null);
                                      setShowParentDropdown(false);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-gray-900 transition-colors duration-150"
                                  >
                                    {t('categories.create.noParent')}
                                  </button>
                                  {parentCategories.map((category) => (
                                    <button
                                      key={category.category_id}
                                      type="button"
                                      onClick={() => {
                                        handleInputChange('parent_category_id', category.category_id);
                                        setShowParentDropdown(false);
                                      }}
                                      className="w-full text-left px-3 py-2 hover:bg-blue-50 text-gray-900 transition-colors duration-150"
                                    >
                                      {category.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('categories.create.fields.sortOrder')}
                            </label>
                            <Input
                              type="number"
                              value={formData.sort_order || ''}
                              onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tags Section */}
                    <div className="pt-8 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <TagIcon className="h-5 w-5 mr-2 text-blue-600" />
                        Tags & Labels
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder={t('categories.create.placeholders.addTag')}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <Button 
                            type="button" 
                            onClick={addTag} 
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                        
                        {formData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(index)}
                                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 transition-colors duration-150"
                                >
                                  <XMarkIcon className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'media' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <PhotoIcon className="h-5 w-5 mr-2 text-blue-600" />
                        Media & Visual Assets
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Category Icon */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-4">
                            {t('categories.create.fields.icon')}
                          </label>
                          <div className="relative">
                            <input
                              ref={iconInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'icon')}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => iconInputRef.current?.click()}
                              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 flex flex-col items-center justify-center text-gray-500 hover:text-blue-600"
                            >
                              {formData.icon_url ? (
                                <img 
                                  src={formData.icon_url} 
                                  alt="Category icon" 
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ) : (
                                <>
                                  <CloudArrowUpIcon className="h-8 w-8 mb-2" />
                                  <span className="text-sm font-medium">{t('categories.create.media.dragIcon')}</span>
                                  <span className="text-xs text-gray-400 mt-1">{t('categories.create.media.iconFormat')}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Category Image */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-4">
                            {t('categories.create.fields.image')}
                          </label>
                          <div className="relative">
                            <input
                              ref={imageInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => imageInputRef.current?.click()}
                              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 flex flex-col items-center justify-center text-gray-500 hover:text-blue-600"
                            >
                              {formData.image_url ? (
                                <img 
                                  src={formData.image_url} 
                                  alt="Category image" 
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <>
                                  <PhotoIcon className="h-8 w-8 mb-2" />
                                  <span className="text-sm font-medium">{t('categories.create.media.dragImage')}</span>
                                  <span className="text-xs text-gray-400 mt-1">{t('categories.create.media.imageFormat')}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <CogIcon className="h-5 w-5 mr-2 text-blue-600" />
                        Category Settings
                      </h3>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                {t('categories.create.fields.isActive')}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {t('categories.create.descriptions.isActive')}
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.is_active}
                              onChange={(e) => handleInputChange('is_active', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <EyeIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                {t('categories.create.fields.displayOnMain')}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {t('categories.create.descriptions.displayOnMain')}
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.display_on_main_screen}
                              onChange={(e) => handleInputChange('display_on_main_screen', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {errors.submit && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                      <p className="text-sm text-red-700">{errors.submit}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CategoryEdit;
