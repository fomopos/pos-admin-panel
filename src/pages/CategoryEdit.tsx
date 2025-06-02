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
  CogIcon
} from '@heroicons/react/24/outline';
import { Card } from '../components/ui/Card';
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
  
  // File upload refs
  const iconInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parent_category_id: '',
    sort_order: 0,
    is_active: true,
    icon_url: '',
    image_url: '',
    display_on_main_screen: false,
    tags: [],
    properties: {}
  });

  // Form validation and errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preview and file states
  const [iconPreview, setIconPreview] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [showParentDropdown, setShowParentDropdown] = useState(false);

  // Load categories and existing category data on mount
  useEffect(() => {
    loadCategories();
    if (isEditing && id) {
      loadCategoryData(id);
    } else if (templateFromState) {
      // Apply template if provided from navigation
      applyTemplate(templateFromState);
    }
  }, [isEditing, id, templateFromState]);

  const loadCategories = async () => {
    try {
      const result = await categoryApiService.getCategories();
      setCategories(result);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadCategoryData = async (categoryId: string) => {
    try {
      const category = await categoryApiService.getCategoryById(categoryId);
      if (category) {
        setFormData({
          name: category.name,
          description: category.description || '',
          parent_category_id: category.parent_category_id || '',
          sort_order: category.sort_order || 0,
          is_active: category.is_active,
          icon_url: category.icon_url || '',
          image_url: category.image_url || '',
          display_on_main_screen: category.display_on_main_screen || false,
          tags: category.tags || [],
          properties: category.properties || {}
        });
        
        if (category.icon_url) setIconPreview(category.icon_url);
        if (category.image_url) setImagePreview(category.image_url);
      }
    } catch (error) {
      console.error('Failed to load category:', error);
    }
  };

  const applyTemplate = (template: CategoryTemplate) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      tags: template.tags || [],
      properties: template.properties || {},
      icon_url: template.icon || ''
    }));
    
    if (template.icon) {
      setIconPreview(template.icon);
    }
    
    setShowTemplates(false);
  };

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.trim().length === 0) {
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
    // For now, create a local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'icon') {
        setIconPreview(result);
        handleInputChange('icon_url', result);
      } else {
        setImagePreview(result);
        handleInputChange('image_url', result);
      }
    };
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t('common.backTo', { page: t('categories.title') })}
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEditing ? t('categories.edit.title') : t('categories.create.title')}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                {t('common.delete')}
              </button>
            )}
            <button
              type="submit"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? t('common.saving') : (isEditing ? t('common.save') : t('common.create'))}
            </button>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="bg-white">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="px-6 py-8">
            {/* Template Selection (only for new categories) */}
            {!isEditing && showTemplates && (
              <Card className="mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {t('categories.templates.title')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CATEGORY_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => applyTemplate(template)}
                        className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          {template.icon && (
                            <img src={template.icon} alt="" className="w-8 h-8" />
                          )}
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowTemplates(false)}
                      className="w-full"
                    >
                      {t('categories.templates.createCustom')}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'basic' && (
                <Card>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('categories.form.name')} *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder={t('categories.form.namePlaceholder')}
                        error={errors.name}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('categories.form.description')}
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder={t('categories.form.descriptionPlaceholder')}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('categories.form.parentCategory')}
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowParentDropdown(!showParentDropdown)}
                          className="w-full text-left border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
                        >
                          <span className="text-gray-900">
                            {formData.parent_category_id 
                              ? categories.find(c => c.category_id === formData.parent_category_id)?.name || t('categories.form.selectParent')
                              : t('categories.form.noParent')
                            }
                          </span>
                          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                        </button>
                        
                        {showParentDropdown && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                            <div className="py-1">
                              <button
                                type="button"
                                onClick={() => {
                                  handleInputChange('parent_category_id', '');
                                  setShowParentDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-gray-900"
                              >
                                {t('categories.form.noParent')}
                              </button>
                              {parentCategories.map((category) => (
                                <button
                                  key={category.category_id}
                                  type="button"
                                  onClick={() => {
                                    handleInputChange('parent_category_id', category.category_id);
                                    setShowParentDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-gray-900"
                                >
                                  {category.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('categories.form.tags')}
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder={t('categories.form.addTag')}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            className="flex-1"
                          />
                          <Button onClick={addTag} size="sm">
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {formData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
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
                </Card>
              )}

              {activeTab === 'media' && (
                <Card>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('categories.form.icon')}
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          {iconPreview ? (
                            <img src={iconPreview} alt="Icon preview" className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <PhotoIcon className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            ref={iconInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'icon');
                            }}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => iconInputRef.current?.click()}
                            className="flex items-center space-x-2"
                          >
                            <CloudArrowUpIcon className="h-4 w-4" />
                            <span>{t('categories.form.uploadIcon')}</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('categories.form.image')}
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          {imagePreview ? (
                            <img src={imagePreview} alt="Image preview" className="w-full h-full object-cover rounded" />
                          ) : (
                            <PhotoIcon className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'image');
                            }}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => imageInputRef.current?.click()}
                            className="flex items-center space-x-2"
                          >
                            <CloudArrowUpIcon className="h-4 w-4" />
                            <span>{t('categories.form.uploadImage')}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'settings' && (
                <Card>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('categories.form.sortOrder')}
                      </label>
                      <Input
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                        min={0}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {t('categories.form.isActive')}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {t('categories.form.isActiveDescription')}
                          </p>
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

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {t('categories.form.displayOnMainScreen')}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {t('categories.form.displayOnMainScreenDescription')}
                          </p>
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
                </Card>
              )}
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEdit;
