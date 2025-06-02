import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  XMarkIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  TagIcon,
  FolderIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { categoryApiService } from '../../services/category/categoryApiService';
import { CategoryValidationRules, type CategoryFormData } from '../../utils/categoryValidation';
import { CategoryUtils } from '../../utils/categoryUtils';
import type { 
  EnhancedCategory, 
  CategoryTemplate
} from '../../types/category';
import { 
  CATEGORY_TEMPLATES,
  CATEGORY_ICONS
} from '../../types/category';
import useTenantStore from '../../tenants/tenantStore';

interface CreateCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (category: EnhancedCategory) => void;
  parentCategoryId?: string;
  initialTemplate?: CategoryTemplate;
}

export const CreateCategory: React.FC<CreateCategoryProps> = ({
  isOpen,
  onClose,
  onSuccess,
  parentCategoryId,
  initialTemplate
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<EnhancedCategory[]>([]);
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<CategoryTemplate | null>(initialTemplate || null);
  
  // File upload refs
  const iconInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Tenant and store selection
  const { currentTenant, currentStore } = useTenantStore();

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parent_category_id: parentCategoryId || '',
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
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Preview and file states
  const [iconPreview, setIconPreview] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [showParentDropdown, setShowParentDropdown] = useState(false);

  // Load categories on mount
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (initialTemplate) {
        applyTemplate(initialTemplate);
      }
    }
  }, [isOpen, initialTemplate]);

  const loadCategories = async () => {
    try {
      const result = await categoryApiService.getCategories();
      setCategories(result);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const applyTemplate = (template: CategoryTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      tags: [...template.defaultTags],
      properties: { ...template.defaultProperties }
    }));
    setShowTemplates(false);
    setActiveTab('basic');
  };

  const validateField = (fieldName: string, value: any): string => {
    const result = CategoryValidationRules.validateField(fieldName, value, formData);
    return result.isValid ? '' : (result.error || 'Invalid value');
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(fieldName));
    
    // Validate field
    const error = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const handleFileUpload = async (type: 'icon' | 'image', file: File) => {
    try {      const response = type === 'icon' 
        ? await categoryApiService.uploadCategoryIcon('temp-id', file)
        : await categoryApiService.uploadCategoryImage('temp-id', file);

      // Type guard to handle union response types
      const url = type === 'icon' 
        ? ('icon_url' in response ? response.icon_url : '')
        : ('image_url' in response ? response.image_url : '');
      
      if (type === 'icon') {
        setFormData(prev => ({ ...prev, icon_url: url }));
        setIconPreview(URL.createObjectURL(file));
      } else {
        setFormData(prev => ({ ...prev, image_url: url }));
        setImagePreview(URL.createObjectURL(file));
      }
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, type: 'icon' | 'image') => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(type, file);
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      handleFieldChange('tags', [...formData.tags, tag.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleFieldChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    // Validate all fields
    const allErrors: Record<string, string> = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, (formData as any)[field]);
      if (error) allErrors[field] = error;
    });

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setTouchedFields(new Set(Object.keys(formData)));
      return;
    }

    setIsSubmitting(true);
    try {
      const newCategory = await categoryApiService.createCategory(formData, {
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id
      });
      if (onSuccess) {
        onSuccess(newCategory);
      }
      onClose();
    } catch (error) {
      console.error('Failed to create category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parent_category_id: parentCategoryId || '',
      sort_order: 0,
      is_active: true,
      icon_url: '',
      image_url: '',
      display_on_main_screen: false,
      tags: [],
      properties: {}
    });
    setErrors({});
    setTouchedFields(new Set());
    setIconPreview('');
    setImagePreview('');
    setSelectedTemplate(null);
    setShowTemplates(true);
    setActiveTab('basic');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: t('categories.create.tabs.basic'), icon: FolderIcon },
    { id: 'media', label: t('categories.create.tabs.media'), icon: PhotoIcon },
    { id: 'settings', label: t('categories.create.tabs.settings'), icon: TagIcon },
    { id: 'preview', label: t('categories.create.tabs.preview'), icon: EyeIcon },
  ];

  const parentCategories = CategoryUtils.buildCategoryTree(categories.filter(c => c.category_id !== formData.parent_category_id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {t('categories.create.title')}
                </h3>
                <p className="text-blue-100">
                  {t('categories.create.subtitle')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white hover:bg-white/10"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Templates Section */}
          {showTemplates && (
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">
                  {t('categories.create.templates.title')}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(false)}
                  className="text-gray-500"
                >
                  {t('categories.create.templates.skip')}
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORY_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className={`p-3 rounded-lg border-2 text-left transition-all hover:border-blue-300 hover:shadow-md ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{template.icon}</span>
                      <span className="font-medium text-sm text-gray-900">
                        {template.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                      activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('categories.create.fields.name')} *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder={t('categories.create.placeholders.name')}
                      error={touchedFields.has('name') ? errors.name : undefined}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('categories.create.fields.sortOrder')}
                    </label>
                    <Input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => handleFieldChange('sort_order', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('categories.create.fields.description')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder={t('categories.create.placeholders.description')}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('categories.create.fields.parentCategory')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowParentDropdown(!showParentDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <span className="text-gray-900">
                      {formData.parent_category_id 
                        ? categories.find(c => c.category_id === formData.parent_category_id)?.name || t('categories.create.selectParent')
                        : t('categories.create.noParent')
                      }
                    </span>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  </button>
                  
                  {showParentDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                      <button
                        type="button"
                        onClick={() => {
                          handleFieldChange('parent_category_id', '');
                          setShowParentDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t('categories.create.noParent')}
                      </button>
                      {parentCategories.map((category: EnhancedCategory) => (
                        <button
                          key={category.category_id}
                          type="button"
                          onClick={() => {
                            handleFieldChange('parent_category_id', category.category_id);
                            setShowParentDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {CategoryUtils.getCategoryPath(category, categories)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                {/* Icon Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('categories.create.fields.icon')}
                  </label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'icon')}
                    onClick={() => iconInputRef.current?.click()}
                  >
                    {iconPreview ? (
                      <div className="flex flex-col items-center">
                        <img src={iconPreview} alt="Icon preview" className="w-16 h-16 object-cover rounded-lg mb-2" />
                        <p className="text-sm text-gray-600">{t('categories.create.media.changeIcon')}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-1">{t('categories.create.media.dragIcon')}</p>
                        <p className="text-xs text-gray-500">{t('categories.create.media.iconFormat')}</p>
                      </div>
                    )}
                    <input
                      ref={iconInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('icon', file);
                      }}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('categories.create.fields.image')}
                  </label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'image')}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="flex flex-col items-center">
                        <img src={imagePreview} alt="Image preview" className="w-24 h-16 object-cover rounded-lg mb-2" />
                        <p className="text-sm text-gray-600">{t('categories.create.media.changeImage')}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-1">{t('categories.create.media.dragImage')}</p>
                        <p className="text-xs text-gray-500">{t('categories.create.media.imageFormat')}</p>
                      </div>
                    )}
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('image', file);
                      }}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Quick Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('categories.create.fields.quickIcons')}
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {CATEGORY_ICONS.map((icon, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleFieldChange('icon_url', icon)}
                        className={`p-2 text-lg border rounded-lg hover:border-blue-300 transition-colors ${
                          formData.icon_url === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('categories.create.fields.tags')}
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder={t('categories.create.placeholders.addTag')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag(tagInput);
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTag(tagInput)}
                        disabled={!tagInput.trim()}
                      >
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
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Display Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('categories.create.fields.isActive')}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('categories.create.descriptions.isActive')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('is_active', !formData.is_active)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.is_active ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('categories.create.fields.displayOnMain')}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('categories.create.descriptions.displayOnMain')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('display_on_main_screen', !formData.display_on_main_screen)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.display_on_main_screen ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.display_on_main_screen ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    {t('categories.create.preview.title')}
                  </h4>
                  
                  {/* Category Card Preview */}
                  <Card className="max-w-sm">
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {formData.icon_url ? (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                            {formData.icon_url.startsWith('http') ? (
                              <img src={formData.icon_url} alt="Category icon" className="w-8 h-8 rounded" />
                            ) : (
                              formData.icon_url
                            )}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <FolderIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            {formData.name || t('categories.create.preview.sampleName')}
                          </h5>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {formData.is_active ? (
                              <CheckCircleIcon className="w-3 h-3 text-green-500" />
                            ) : (
                              <ExclamationTriangleIcon className="w-3 h-3 text-yellow-500" />
                            )}
                            {formData.is_active ? t('categories.status.active') : t('categories.status.inactive')}
                          </div>
                        </div>
                      </div>
                      
                      {formData.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {formData.description}
                        </p>
                      )}

                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {formData.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {formData.tags.length > 3 && (
                            <span className="inline-block px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                              +{formData.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {formData.display_on_main_screen && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <EyeIcon className="w-3 h-3" />
                          {t('categories.create.preview.mainScreen')}
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Category Details */}
                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">{t('categories.create.fields.name')}:</span>
                      <span className="ml-2 text-gray-900">{formData.name || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">{t('categories.create.fields.sortOrder')}:</span>
                      <span className="ml-2 text-gray-900">{formData.sort_order}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">{t('categories.create.fields.parentCategory')}:</span>
                      <span className="ml-2 text-gray-900">
                        {formData.parent_category_id 
                          ? categories.find(c => c.category_id === formData.parent_category_id)?.name || '—'
                          : t('categories.create.noParent')
                        }
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">{t('categories.create.fields.tags')}:</span>
                      <span className="ml-2 text-gray-900">{formData.tags.length} {t('categories.create.preview.tags')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            
            <div className="flex items-center gap-3">
              {activeTab !== 'preview' && (
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('preview')}
                >
                  {t('categories.create.preview.button')}
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name.trim()}
                isLoading={isSubmitting}
              >
                {isSubmitting ? t('categories.create.creating') : t('categories.create.create')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;
