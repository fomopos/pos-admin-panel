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
  CheckCircleIcon
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
import useTenantStore from '../tenants/tenantStore';

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

    // Tenant and store selection
    const { currentTenant, currentStore } = useTenantStore();

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parent_category_id: undefined,
    sort_order: 0,
    is_active: true,
    display_on_main_screen: false,
    icon_url: undefined,
    image_url: undefined,
    tags: [],
    properties: {
      color: '#3B82F6',
      tax_rate: 0,
      commission_rate: 0,
      min_stock_level: 0,
      max_stock_level: 100
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [iconPreview, setIconPreview] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');

  // Load categories for parent selection
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryApiService.getCategories();
        setCategories(response);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Load category data when editing
  useEffect(() => {
    if (isEditing && id) {
      const loadCategory = async () => {
        try {
          const category = await categoryApiService.getCategoryById(id);
          setFormData({
            name: category.name,
            description: category.description || '',
            parent_category_id: category.parent_category_id,
            sort_order: category.sort_order || 0,
            is_active: category.is_active ?? true,
            display_on_main_screen: category.display_on_main_screen ?? false,
            icon_url: category.icon_url,
            image_url: category.image_url,
            tags: category.tags || [],
            properties: {
              color: category.properties?.color || '#3B82F6',
              tax_rate: category.properties?.tax_rate || 0,
              commission_rate: category.properties?.commission_rate || 0,
              min_stock_level: category.properties?.min_stock_level || 0,
              max_stock_level: category.properties?.max_stock_level || 100,
              ...category.properties
            }
          });
          
          if (category.icon_url) setIconPreview(category.icon_url);
          if (category.image_url) setImagePreview(category.image_url);
        } catch (error) {
          console.error('Failed to load category:', error);
        }
      };
      loadCategory();
    }
  }, [isEditing, id]);

  // Apply template when selected
  useEffect(() => {
    if (templateFromState && !isEditing) {
      applyTemplate(templateFromState);
    }
  }, [templateFromState, isEditing]);

  const applyTemplate = (template: CategoryTemplate) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      tags: template.tags || [],
      properties: {
        ...prev.properties,
        color: template.color,
        ...template.defaultProperties
      }
    }));
    setShowTemplates(false);
  };

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePropertyChange = (property: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        [property]: value
      }
    }));
    if (errors[property]) {
      setErrors(prev => ({ ...prev, [property]: '' }));
    }
  };

  const handleFileUpload = (file: File, type: 'icon' | 'image') => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('categories.create.form.nameRequired');
    }
    
    if (formData.properties?.tax_rate && (formData.properties.tax_rate < 0 || formData.properties.tax_rate > 100)) {
      newErrors.tax_rate = t('categories.create.form.invalidTaxRate');
    }
    
    if (formData.properties?.commission_rate && (formData.properties.commission_rate < 0 || formData.properties.commission_rate > 100)) {
      newErrors.commission_rate = t('categories.create.form.invalidCommissionRate');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await categoryApiService.updateCategory(id, formData);
      } else {
        await categoryApiService.createCategory(formData, {
            tenant_id: currentTenant?.id,
            store_id: currentStore?.store_id
        });
      }
      navigate('/categories');
    } catch (error) {
      console.error('Failed to save category:', error);
      setErrors({ submit: t('categories.create.errors.saveFailed') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm(t('categories.form.deleteConfirm'))) return;
    
    try {
      await categoryApiService.deleteCategory(id);
      navigate('/categories');
    } catch (error) {
      console.error('Failed to delete category:', error);
      setErrors({ submit: t('categories.form.deleteError') });
    }
  };

  const tabs = [
    { id: 'basic', label: t('categories.create.form.basicInfo'), icon: ClipboardDocumentListIcon },
    { id: 'media', label: t('categories.create.form.media'), icon: PhotoIcon },
    { id: 'settings', label: t('categories.create.form.settings'), icon: CogIcon }
  ];

  const getParentCategories = () => {
    if (isEditing && id) {
      return categories.filter(cat => cat.category_id !== id);
    }
    return categories;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => navigate('/categories')}
                  variant="ghost"
                  className="text-blue-100 hover:text-white hover:bg-blue-500/20 p-2"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
                <div>
                  <nav className="flex items-center space-x-2 text-blue-200 text-sm mb-2">
                    <span>{t('common.categories')}</span>
                    <span>/</span>
                    <span className="text-white font-medium">
                      {isEditing ? t('categories.edit') : t('categories.new')}
                    </span>
                  </nav>
                  <h1 className="text-3xl font-bold text-white">
                    {isEditing ? t('categories.editCategory') : t('categories.newCategory')}
                  </h1>
                  <p className="text-blue-100 mt-1">
                    {isEditing ? t('categories.editDescription') : t('categories.newDescription')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {isEditing && (
                  <Button
                    onClick={handleDelete}
                    variant="outline"
                    className="text-red-100 border-red-300/50 hover:bg-red-500/20 hover:border-red-300"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    {t('common.delete')}
                  </Button>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6"
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      {t('common.saving')}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      {isEditing ? t('common.save') : t('common.create')}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Template Selection */}
          {showTemplates && !isEditing && (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <SparklesIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{t('categories.templates.title')}</CardTitle>
                    <CardDescription className="text-blue-100 mt-1">
                      {t('categories.templates.description')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CATEGORY_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className="group relative p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white"
                    >
                      <div className="flex items-start space-x-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg shadow-md"
                          style={{ backgroundColor: template.color }}
                        >
                          {template.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center">
                              <TagIcon className="h-3 w-3 mr-1" />
                              {template.tags?.length || 0} tags
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <PlusIcon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    onClick={() => setShowTemplates(false)}
                    variant="outline"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    {t('categories.create.templates.skip')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Form */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Tab Navigation */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm sticky top-6">
                <CardContent className="p-0">
                  <div className="space-y-1 p-2">
                    {tabs.map((tab) => {
                      const IconComponent = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`
                            w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                            ${activeTab === tab.id 
                              ? 'bg-blue-500 text-white shadow-md transform scale-[1.02]' 
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                            }
                          `}
                        >
                          <IconComponent className="h-5 w-5" />
                          <span className="font-medium">{tab.label}</span>
                          {activeTab === tab.id && (
                            <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form Content */}
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8">
                  {/* Basic Information Tab */}
                  {activeTab === 'basic' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('categories.create.form.name')} <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`
                              w-full border-2 rounded-lg px-4 py-3 transition-all duration-200 focus:ring-4 focus:ring-blue-100
                              ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
                            `}
                            placeholder={t('categories.create.form.name')}
                          />
                          {errors.name && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('categories.create.form.description')}
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none"
                            placeholder={t('categories.create.form.description')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('categories.create.form.parentCategory')}
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowParentDropdown(!showParentDropdown)}
                              className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors"
                            >
                              <span className="text-gray-700">
                                {formData.parent_category_id 
                                  ? categories.find(c => c.category_id === formData.parent_category_id)?.name || t('categories.form.selectParent')
                                  : t('categories.create.form.noParent')
                                }
                              </span>
                              <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${showParentDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showParentDropdown && (
                              <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleInputChange('parent_category_id', undefined);
                                    setShowParentDropdown(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                                >
                                  {t('categories.create.form.noParent')}
                                </button>
                                {getParentCategories().map((category) => (
                                  <button
                                    key={category.category_id}
                                    type="button"
                                    onClick={() => {
                                      handleInputChange('parent_category_id', category.category_id);
                                      setShowParentDropdown(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                  >
                                    {category.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('categories.create.form.color')}
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="color"
                              value={formData.properties?.color || '#3B82F6'}
                              onChange={(e) => handleInputChange('properties', { ...formData.properties, color: e.target.value })}
                              className="w-12 h-12 border-2 border-gray-200 rounded-lg cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={formData.properties?.color || '#3B82F6'}
                              onChange={(e) => handleInputChange('properties', { ...formData.properties, color: e.target.value })}
                              className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3"
                              placeholder="#3B82F6"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Tags Section */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('categories.create.form.tags')}
                        </label>
                        <div className="flex items-center space-x-2 mb-3">
                          <Input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2"
                            placeholder={t('categories.create.form.addTag')}
                          />
                          <Button
                            type="button"
                            onClick={addTag}
                            variant="outline"
                            className="px-4 py-2 border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Media Tab */}
                  {activeTab === 'media' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-4">
                            {t('categories.form.icon')}
                          </label>
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                            {iconPreview ? (
                              <div className="space-y-4">
                                <img src={iconPreview} alt="Icon preview" className="w-16 h-16 object-cover rounded-lg mx-auto shadow-md" />
                                <Button
                                  type="button"
                                  onClick={() => iconInputRef.current?.click()}
                                  variant="outline"
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                >
                                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                                  {t('categories.form.changeIcon')}
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto" />
                                <Button
                                  type="button"
                                  onClick={() => iconInputRef.current?.click()}
                                  variant="outline"
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                >
                                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                                  {t('categories.form.uploadIcon')}
                                </Button>
                              </div>
                            )}
                            <input
                              ref={iconInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'icon');
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-4">
                            {t('categories.form.image')}
                          </label>
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors aspect-video">
                            {imagePreview ? (
                              <div className="h-full flex flex-col items-center justify-center space-y-4">
                                <img src={imagePreview} alt="Image preview" className="max-w-full max-h-32 object-cover rounded-lg shadow-md" />
                                <Button
                                  type="button"
                                  onClick={() => imageInputRef.current?.click()}
                                  variant="outline"
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                >
                                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                                  {t('categories.form.changeImage')}
                                </Button>
                              </div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center space-y-4">
                                <PhotoIcon className="h-12 w-12 text-gray-400" />
                                <Button
                                  type="button"
                                  onClick={() => imageInputRef.current?.click()}
                                  variant="outline"
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                >
                                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                                  {t('categories.form.uploadImage')}
                                </Button>
                              </div>
                            )}
                            <input
                              ref={imageInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'image');
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === 'settings' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('categories.form.sortOrder')}
                          </label>
                          <Input
                            type="number"
                            value={formData.sort_order}
                            onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('categories.form.taxRate')} (%)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={formData.properties?.tax_rate || 0}
                            onChange={(e) => handlePropertyChange('tax_rate', parseFloat(e.target.value) || 0)}
                            className={`
                              w-full border-2 rounded-lg px-4 py-3 focus:ring-4 focus:ring-blue-100
                              ${errors.tax_rate ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
                            `}
                          />
                          {errors.tax_rate && (
                            <p className="mt-1 text-sm text-red-600">{errors.tax_rate}</p>
                          )}
                        </div>
                      </div>

                      {/* Toggle Settings */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {t('categories.form.isActive')}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
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
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {t('categories.form.displayOnMainScreen')}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
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
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
};

export default CategoryEdit;
