import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  TrashIcon,
  PlusIcon,
  TagIcon,
  PhotoIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  InformationCircleIcon,
  FolderIcon,
  PencilIcon,
  Cog6ToothIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import { categoryApiService } from '../services/category/categoryApiService';
import { PageHeader, Button, Input, Card, EnhancedTabs, Alert } from '../components/ui';
import type { EnhancedCategory, CategoryFormData } from '../types/category';
import { useTenantStore } from '../tenants/tenantStore';

// Category templates for quick setup
const CATEGORY_TEMPLATES = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    color: '#3B82F6',
    tags: ['electronics', 'technology', 'gadgets']
  },
  {
    id: 'clothing',
    name: 'Clothing',
    description: 'Apparel and fashion items',
    color: '#10B981',
    tags: ['clothing', 'fashion', 'apparel']
  },
  {
    id: 'food',
    name: 'Food & Beverages',
    description: 'Food items and drinks',
    color: '#F59E0B',
    tags: ['food', 'beverages', 'drinks']
  },
  {
    id: 'books',
    name: 'Books',
    description: 'Books and educational materials',
    color: '#8B5CF6',
    tags: ['books', 'education', 'reading']
  },
  {
    id: 'health',
    name: 'Health & Beauty',
    description: 'Health and beauty products',
    color: '#EF4444',
    tags: ['health', 'beauty', 'wellness']
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
    color: '#06B6D4',
    tags: ['sports', 'outdoors', 'fitness']
  }
];

const CategoryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentTenant, currentStore } = useTenantStore();
  
  const isEditing = Boolean(id);
  const [category, setCategory] = useState<EnhancedCategory | null>(null);
  const [originalCategory, setOriginalCategory] = useState<EnhancedCategory | null>(null);
  const [categories, setCategories] = useState<EnhancedCategory[]>([]);
  
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
      featured: false,
      seasonal: false
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState('basic');
  const [showTemplates, setShowTemplates] = useState(!isEditing);
  const [tagInput, setTagInput] = useState('');
  const [showParentDropdown, setShowParentDropdown] = useState(false);

  const tabs = [
    { id: 'basic', name: 'Basic Information', icon: InformationCircleIcon },
    { id: 'organization', name: 'Organization', icon: FolderIcon },
    { id: 'appearance', name: 'Appearance', icon: SwatchIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon }
  ];

  // Load categories and current category data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        // Load all categories for parent selection
        const allCategories = await categoryApiService.getCategories({
          tenant_id: currentTenant?.id,
          store_id: currentStore?.store_id
        });
        setCategories(allCategories);

        // If editing, load the specific category
        if (isEditing && id) {
          const categoryData = await categoryApiService.getCategoryById(id, {
            tenant_id: currentTenant?.id,
            store_id: currentStore?.store_id
          });
          
          setCategory(categoryData);
          setOriginalCategory(JSON.parse(JSON.stringify(categoryData))); // Deep clone
          
          // Map to form data
          setFormData({
            name: categoryData.name,
            description: categoryData.description || '',
            parent_category_id: categoryData.parent_category_id || undefined,
            sort_order: categoryData.sort_order || 0,
            is_active: categoryData.is_active ?? true,
            display_on_main_screen: categoryData.display_on_main_screen ?? false,
            icon_url: categoryData.icon_url || undefined,
            image_url: categoryData.image_url || undefined,
            tags: categoryData.tags || [],
            properties: {
              color: categoryData.properties?.color || '#3B82F6',
              tax_rate: categoryData.properties?.tax_rate || 0,
              commission_rate: categoryData.properties?.commission_rate || 0,
              featured: categoryData.properties?.featured || false,
              seasonal: categoryData.properties?.seasonal || false,
              ...categoryData.properties
            }
          });
        }
      } catch (error) {
        console.error('Failed to load category data:', error);
        setFetchError('Failed to load category data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isEditing, id, currentTenant, currentStore]);

  // Check for changes
  useEffect(() => {
    if (isEditing && originalCategory) {
      // Compare current form data with original category
      const currentData = {
        name: formData.name,
        description: formData.description || null,
        parent_category_id: formData.parent_category_id || null,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
        display_on_main_screen: formData.display_on_main_screen,
        icon_url: formData.icon_url || null,
        image_url: formData.image_url || null,
        tags: formData.tags,
        properties: formData.properties
      };

      const originalData = {
        name: originalCategory.name,
        description: originalCategory.description,
        parent_category_id: originalCategory.parent_category_id,
        sort_order: originalCategory.sort_order,
        is_active: originalCategory.is_active,
        display_on_main_screen: originalCategory.display_on_main_screen,
        icon_url: originalCategory.icon_url,
        image_url: originalCategory.image_url,
        tags: originalCategory.tags,
        properties: originalCategory.properties
      };

      setHasChanges(JSON.stringify(currentData) !== JSON.stringify(originalData));
    } else if (!isEditing) {
      // For new categories, check if any fields are filled
      const hasData = formData.name.trim() !== '' || 
                     formData.description.trim() !== '' ||
                     formData.tags.length > 0 ||
                     formData.parent_category_id !== undefined;
      setHasChanges(hasData);
    }
  }, [formData, originalCategory, isEditing]);

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors for this field
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

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const applyTemplate = (template: any) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      tags: template.tags || [],
      properties: {
        ...prev.properties,
        color: template.color
      }
    }));
    setShowTemplates(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveAllChanges = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setErrors({});

    try {
      if (isEditing && id) {
        await categoryApiService.updateCategory(id, formData, {
          tenant_id: currentTenant?.id,
          store_id: currentStore?.store_id
        });
        setSuccessMessage('Category updated successfully!');
      } else {
        await categoryApiService.createCategory(formData, {
          tenant_id: currentTenant?.id,
          store_id: currentStore?.store_id
        });
        setSuccessMessage('Category created successfully!');
      }

      // Reset change tracking
      setHasChanges(false);
      
      // Navigate back after a delay
      setTimeout(() => {
        navigate('/categories');
      }, 1500);

    } catch (error) {
      console.error('Failed to save category:', error);
      setErrors({ submit: 'Failed to save category. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    if (isEditing && originalCategory) {
      // Reset to original data
      setFormData({
        name: originalCategory.name,
        description: originalCategory.description || '',
        parent_category_id: originalCategory.parent_category_id || undefined,
        sort_order: originalCategory.sort_order || 0,
        is_active: originalCategory.is_active ?? true,
        display_on_main_screen: originalCategory.display_on_main_screen ?? false,
        icon_url: originalCategory.icon_url || undefined,
        image_url: originalCategory.image_url || undefined,
        tags: originalCategory.tags || [],
        properties: {
          color: originalCategory.properties?.color || '#3B82F6',
          tax_rate: originalCategory.properties?.tax_rate || 0,
          commission_rate: originalCategory.properties?.commission_rate || 0,
          featured: originalCategory.properties?.featured || false,
          seasonal: originalCategory.properties?.seasonal || false,
          ...originalCategory.properties
        }
      });
    } else {
      // Reset to empty form
      setFormData({
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
          featured: false,
          seasonal: false
        }
      });
    }
    
    setErrors({});
    setHasChanges(false);
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoryApiService.deleteCategory(id, {
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id
      });
      navigate('/categories');
    } catch (error) {
      console.error('Failed to delete category:', error);
      setErrors({ submit: 'Failed to delete category. Please try again.' });
    }
  };

  const getParentCategories = () => {
    if (isEditing && id) {
      return categories.filter(cat => cat.category_id !== id);
    }
    return categories.filter(cat => !cat.parent_category_id); // Only show root categories as potential parents
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Category</h3>
          <p className="text-gray-500 mb-4">{fetchError}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <PageHeader
        title={isEditing ? 'Edit Category' : 'Create Category'}
        description={isEditing ? 'Modify category details and settings' : 'Create a new category for your products'}
      >
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/categories')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Categories</span>
          </Button>
          
          {isEditing && (
            <Button
              onClick={handleDelete}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>

        {/* Save/Discard Actions */}
        {hasChanges && (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-900">You have unsaved changes</h3>
                <p className="text-xs text-amber-700 mt-1">Don't forget to save your modifications before leaving this page.</p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3">
              <Button
                onClick={discardChanges}
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-100 bg-white"
              >
                <span>Discard Changes</span>
              </Button>
              <Button
                onClick={saveAllChanges}
                disabled={isSaving}
                size="sm"
                className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white disabled:bg-gray-400 shadow-sm"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </PageHeader>

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" className="mb-4">
          <CheckCircleIcon className="h-5 w-5" />
          {successMessage}
        </Alert>
      )}

      {/* Template Selection for New Categories */}
      {showTemplates && !isEditing && (
        <Card className="border-0 shadow-xl bg-white">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Category Templates</h3>
                <p className="text-blue-100 mt-1">
                  Choose a template to get started quickly, or skip to create from scratch
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
            <div className="pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={() => setShowTemplates(false)}
                variant="outline"
                className="text-gray-600 hover:text-gray-800"
              >
                Skip Templates
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tab Navigation */}
      <EnhancedTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Enter category name"
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Enter category description"
                />
              </div>
            </div>

            {/* Tags Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex items-center space-x-2 mb-3">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1"
                  placeholder="Add a tag"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  className="px-4 py-2"
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

        {/* Organization Tab */}
        {activeTab === 'organization' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Parent Category
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowParentDropdown(!showParentDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-blue-300 transition-colors"
                  >
                    <span className="text-gray-700">
                      {formData.parent_category_id
                        ? categories.find(c => c.category_id === formData.parent_category_id)?.name || 'Select Parent'
                        : 'No Parent (Root Category)'
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
                        No Parent (Root Category)
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
                  Sort Order
                </label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                  className="w-full"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.properties?.color || '#3B82F6'}
                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                    className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.properties?.color || '#3B82F6'}
                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                    className="flex-1"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>

            {/* Icon and Image Upload placeholders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Icon
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload icon</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Image
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload image</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Toggle Settings */}
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Active Status</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Whether this category is active and visible to customers
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
                  <h4 className="font-semibold text-gray-900">Display on Main Screen</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Show this category prominently on the main screen
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

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Featured Category</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Mark this category as featured for special promotion
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.properties?.featured || false}
                    onChange={(e) => handlePropertyChange('featured', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Seasonal Category</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    This category contains seasonal or time-limited products
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.properties?.seasonal || false}
                    onChange={(e) => handlePropertyChange('seasonal', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </EnhancedTabs>

      {/* Error Display */}
      {errors.submit && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Error</h4>
            <p className="text-sm">{errors.submit}</p>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default CategoryEdit;
