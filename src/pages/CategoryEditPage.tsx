import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Cog6ToothIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import { categoryApiService } from '../services/category/categoryApiService';
import { PageHeader, Button, Input, Alert, ConfirmDialog, Loading, PropertyCheckbox, InputTextField, DropdownSearch, IconPicker } from '../components/ui';
import { getIconComponent } from '../components/ui/IconPicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { generateRandomColor } from '../utils/colorUtils';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';
import { CategoryWidget } from '../components/category/CategoryWidget';
import type { EnhancedCategory, CategoryFormData } from '../types/category';
import { useTenantStore } from '../tenants/tenantStore';
import { CategoryUtils } from '../utils/categoryUtils';
import { useDeleteConfirmDialog, useDiscardChangesDialog } from '../hooks/useConfirmDialog';
import { useError } from '../hooks/useError';

// Category templates for quick setup
const CATEGORY_TEMPLATES = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    color: '#3B82F6',
    icon: 'computer-desktop',
    tags: ['electronics', 'technology', 'gadgets']
  },
  {
    id: 'clothing',
    name: 'Clothing',
    description: 'Apparel and fashion items',
    color: '#10B981',
    icon: 'swatch',
    tags: ['clothing', 'fashion', 'apparel']
  },
  {
    id: 'food',
    name: 'Food & Beverages',
    description: 'Food items and drinks',
    color: '#F59E0B',
    icon: 'cake',
    tags: ['food', 'beverages', 'drinks']
  },
  {
    id: 'books',
    name: 'Books',
    description: 'Books and educational materials',
    color: '#8B5CF6',
    icon: 'book-open',
    tags: ['books', 'education', 'reading']
  },
  {
    id: 'health',
    name: 'Health & Beauty',
    description: 'Health and beauty products',
    color: '#EF4444',
    icon: 'heart',
    tags: ['health', 'beauty', 'wellness']
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
    color: '#06B6D4',
    icon: 'bolt',
    tags: ['sports', 'outdoors', 'fitness']
  }
];

const CategoryEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  const { showError, showSuccess, showValidationError } = useError();
  
  const isEditing = Boolean(id);
  const [originalCategory, setOriginalCategory] = useState<EnhancedCategory | null>(null);
  const [categories, setCategories] = useState<EnhancedCategory[]>([]);
  
  // Generate a random color only for new categories
  const defaultColor = useMemo(() => generateRandomColor(), []);

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
      color: defaultColor, // Use generated random color for new categories
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
  
  const [showTemplates, setShowTemplates] = useState(!isEditing);
  const [tagInput, setTagInput] = useState('');

  // Dialog hooks
  const deleteDialog = useDeleteConfirmDialog();
  const discardDialog = useDiscardChangesDialog();

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
              color: categoryData.color || '#3B82F6',
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
        description: formData.description || '',
        parent_category_id: formData.parent_category_id || undefined,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
        display_on_main_screen: formData.display_on_main_screen,
        icon_url: formData.icon_url || undefined,
        image_url: formData.image_url || undefined,
        tags: formData.tags,
        properties: formData.properties
      };

      // Apply the same transformations to original data as were applied when setting form data
      const originalData = {
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
          color: originalCategory.color || '#3B82F6',
          tax_rate: originalCategory.properties?.tax_rate || 0,
          commission_rate: originalCategory.properties?.commission_rate || 0,
          featured: originalCategory.properties?.featured || false,
          seasonal: originalCategory.properties?.seasonal || false,
          ...originalCategory.properties
        }
      };

      setHasChanges(JSON.stringify(currentData) !== JSON.stringify(originalData));
    } else if (!isEditing) {
      // For new categories, check if any fields are filled
      const hasData = formData.name.trim() !== '' || 
                     formData.description.trim() !== '' ||
                     formData.tags.length > 0 ||
                     formData.parent_category_id !== undefined;
      setHasChanges(hasData);
    } else {
      // If we're editing but don't have originalCategory yet, no changes
      setHasChanges(false);
    }
  }, [formData, originalCategory, isEditing]);

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePropertyChange = (field: string, value: any) => {
    if (field === 'color') {
      // Handle color at parent level
      setFormData(prev => ({ ...prev, color: value }));
    } else {
      // Handle other properties in properties object
      setFormData(prev => ({
        ...prev,
        properties: { ...prev.properties, [field]: value }
      }));
    }
  };

  const handleIconSelect = (iconId: string) => {
    setFormData(prev => ({ ...prev, icon_url: iconId }));
  };

  const handleColorRefresh = (newColor: string) => {
    handlePropertyChange('color', newColor);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const applyTemplate = (template: any) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      tags: template.tags,
      icon_url: template.icon,
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
    
    if (formData.name.length > 100) {
      newErrors.name = 'Category name must be less than 100 characters';
    }
    
    setErrors(newErrors);
    
    // If there are errors, show global error feedback using error framework
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors);
      showValidationError(
        `Please fix the following errors before saving the category: ${errorMessages.join(', ')}`,
        'form_validation',
        null,
        'required'
      );
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSaving(true);
      setErrors({});

      const categoryData = {
        ...formData,
      };

      if (isEditing && id) {
        await categoryApiService.updateCategory(id, categoryData, {
          tenant_id: currentTenant?.id,
          store_id: currentStore?.store_id
        });
        
        // Use error framework for success message
        showSuccess('Category updated successfully!');
        setSuccessMessage('Category updated successfully!');
      } else {
        await categoryApiService.createCategory(categoryData, {
          tenant_id: currentTenant?.id,
          store_id: currentStore?.store_id
        }); 
        
        // Use error framework for success message
        showSuccess('Category created successfully!');
        setSuccessMessage('Category created successfully!');
        setTimeout(() => navigate('/categories'), 1500);
      }
      
      setHasChanges(false);
    } catch (error: any) {
      console.error('Failed to save category:', error);
      
      // Use error framework for API error display
      showError(error?.message || 'Failed to save category. Please try again.');
      
      // Also set local error for backward compatibility
      setErrors({ submit: error.message || 'Failed to save category. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    deleteDialog.openDeleteDialog(
      originalCategory?.name || 'this category',
      async () => {
        await categoryApiService.deleteCategory(id, {
          tenant_id: currentTenant?.id,
          store_id: currentStore?.store_id
        });
        navigate('/categories');
      }
    );
  };

  const discardChanges = () => {
    discardDialog.openDiscardDialog(() => {
      if (originalCategory) {
        // Reset form data to match exactly how it was initially loaded
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
            color: originalCategory.color || '#3B82F6', // Use the same logic as initial load
            tax_rate: originalCategory.properties?.tax_rate || 0,
            commission_rate: originalCategory.properties?.commission_rate || 0,
            featured: originalCategory.properties?.featured || false,
            seasonal: originalCategory.properties?.seasonal || false,
            ...originalCategory.properties
          }
        });
      } else {
        // Reset to empty form with new random color
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
            color: defaultColor, // Use the same default random color
            tax_rate: 0,
            commission_rate: 0,
            featured: false,
            seasonal: false
          }
        });
      }
      
      setErrors({});
      // Force hasChanges to false after resetting
      setTimeout(() => setHasChanges(false), 0);
    });
  };

  const saveAllChanges = () => {
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  const getParentCategories = () => {
    let availableCategories = categories;

    // When editing, exclude self and all descendants to prevent circular references
    if (isEditing && id) {
      const descendants = CategoryUtils.getCategoryDescendants(id, categories);
      const excludeIds = [id, ...descendants.map(d => d.category_id)];
      availableCategories = categories.filter(cat => !excludeIds.includes(cat.category_id));
    }

    // Sort by name for better usability
    return availableCategories.sort((a, b) => a.name.localeCompare(b.name));
  };

  // Helper function to get category display name with hierarchy path
  const getCategoryDisplayName = (category: EnhancedCategory) => {
    const ancestors = CategoryUtils.getCategoryAncestors(category.category_id, categories);
    if (ancestors.length > 0) {
      const path = ancestors.map(a => a.name).join(' > ');
      return `${path} > ${category.name}`;
    }
    return category.name;
  };

  // Convert categories to DropdownSearchOption format
  const getParentDropdownOptions = (): DropdownSearchOption[] => {
    const availableCategories = getParentCategories();
    return availableCategories.map(category => {
      const level = CategoryUtils.getCategoryAncestors(category.category_id, categories).length;
      return {
        id: category.category_id,
        label: category.name,
        description: category.description || undefined,
        level: level,
        data: category
      };
    });
  };

  // Handle parent category selection
  const handleParentCategorySelect = (option: DropdownSearchOption | null) => {
    handleInputChange('parent_category_id', option?.id);
  };

  // Get display value for parent category dropdown
  const getParentCategoryDisplayValue = (option: DropdownSearchOption | null) => {
    if (!option && !formData.parent_category_id) {
      return 'No Parent (Root Category)';
    }
    
    if (formData.parent_category_id) {
      const category = categories.find(c => c.category_id === formData.parent_category_id);
      return category ? getCategoryDisplayName(category) : 'No Parent (Root Category)';
    }
    
    return option ? getCategoryDisplayName(option.data) : 'No Parent (Root Category)';
  };

  // Loading state
  if (isLoading) {
    return (
      <Loading
        title="Loading Category"
        description="Please wait while we fetch the category data..."
        variant="primary"
      />
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
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <PageHeader
        title={isEditing ? 'Edit Category' : 'Create Category'}
        description={isEditing ? 'Modify category details and settings' : 'Create a new category for your products'}
      >
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <div className="hidden sm:flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
              Unsaved changes
            </div>
          )}
          
          {hasChanges ? (
            <>
              <Button
                onClick={discardChanges}
                variant="outline"
                className="flex items-center space-x-2 border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Discard Changes</span>
              </Button>
              
              <Button
                onClick={saveAllChanges}
                disabled={isSaving}
                variant="primary"
                className="flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-4 w-4" />
                    <span>{isEditing ? 'Update Category' : 'Create Category'}</span>
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate('/categories')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Categories</span>
            </Button>
          )}
          
          {isEditing && (
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          )}
        </div>
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
        <CategoryWidget
          title="Category Templates"
          description="Choose a template to get started quickly, or skip to create from scratch"
          icon={SparklesIcon}
          headerActions={
            <Button
              onClick={() => setShowTemplates(false)}
              variant="outline"
              size="sm"
            >
              Skip Templates
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORY_TEMPLATES.map((template) => (
              <div
                key={template.id}
                onClick={() => applyTemplate(template)}
                className="group relative p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white"
              >
                <div className="flex items-start space-x-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: template.color }}
                  >
                    {(() => {
                      const iconDefinition = getIconComponent(template.icon);
                      return iconDefinition ? (
                        <FontAwesomeIcon icon={iconDefinition} className="h-6 w-6" />
                      ) : (
                        <span className="font-semibold text-lg">{template.name.charAt(0)}</span>
                      );
                    })()}
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
        </CategoryWidget>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {/* Basic Information Widget */}
          <CategoryWidget
            title="Basic Information"
            description="Essential category details and identification"
            icon={InformationCircleIcon}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField
                label="Category Name"
                required
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                placeholder="Enter category name"
                error={errors.name}
                colSpan="md:col-span-2"
              />

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
            <div className="mt-6">
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
          </CategoryWidget>

          {/* Organization Widget */}
          <CategoryWidget
            title="Organization"
            description="Category hierarchy and ordering"
            icon={FolderIcon}
            className="overflow-visible"
          >
            <div className="space-y-6 relative">
              <DropdownSearch
                label="Parent Category"
                value={formData.parent_category_id}
                placeholder="No Parent (Root Category)"
                searchPlaceholder="Search categories..."
                options={getParentDropdownOptions()}
                onSelect={handleParentCategorySelect}
                displayValue={getParentCategoryDisplayValue}
                clearLabel="No Parent (Root Category)"
                noOptionsMessage="No categories available"
                clearSearchText="Clear search"
                allowClear={true}
                closeOnSelect={true}
                autoFocus={true}
              />

              <InputTextField
                label="Sort Order"
                type="number"
                value={formData.sort_order}
                onChange={(value) => handleInputChange('sort_order', parseInt(value) || 0)}
                placeholder="0"
                helperText="Lower numbers appear first in the category list"
                min={0}
              />
            </div>
          </CategoryWidget>

          {/* Appearance Widget */}
          <CategoryWidget
            title="Appearance"
            description="Visual styling and media"
            icon={SwatchIcon}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.color || '#3B82F6'}
                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                    className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.color || '#3B82F6'}
                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                    className="flex-1"
                    placeholder="#3B82F6"
                  />
                  <button
                    type="button"
                    onClick={() => handleColorRefresh(generateRandomColor())}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-300 transition-colors"
                    title="Generate random color"
                  >
                    <FontAwesomeIcon icon={faRotateRight} className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Icon and Image Upload */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Icon
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <IconPicker
                      selectedIconId={formData.icon_url || undefined}
                      onIconSelect={handleIconSelect}
                      color={formData.color || '#3B82F6'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Image
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                    <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload image</p>
                    <p className="text-xs text-gray-400 mt-1">Coming soon...</p>
                  </div>
                </div>
              </div>
            </div>
          </CategoryWidget>

          {/* Settings Widget */}
          <CategoryWidget
            title="Settings"
            description="Category behavior and display options"
            icon={Cog6ToothIcon}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <PropertyCheckbox
                title="Active Status"
                description="Whether this category is active and visible to customers"
                checked={formData.is_active}
                onChange={(checked) => handleInputChange('is_active', checked)}
              />

              <PropertyCheckbox
                title="Display on Main Screen"
                description="Show this category prominently on the main screen"
                checked={formData.display_on_main_screen}
                onChange={(checked) => handleInputChange('display_on_main_screen', checked)}
              />

              <PropertyCheckbox
                title="Featured Category"
                description="Mark this category as featured for special promotion"
                checked={formData.properties?.featured || false}
                onChange={(checked) => handlePropertyChange('featured', checked)}
              />

              <PropertyCheckbox
                title="Seasonal Category"
                description="This category contains seasonal or time-limited products"
                checked={formData.properties?.seasonal || false}
                onChange={(checked) => handlePropertyChange('seasonal', checked)}
              />

            </div>
          </CategoryWidget>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <Alert variant="error">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <div>
              <h4 className="font-medium">Error</h4>
              <p className="text-sm">{errors.submit}</p>
            </div>
          </Alert>
        )}

        {/* Validation Summary */}
        {Object.keys(errors).length > 0 && !errors.submit && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-amber-800 font-medium mb-2">
                  Please fix the following errors before saving the category
                </h3>
                <div className="text-sm text-amber-700 space-y-1">
                  {Object.entries(errors).map(([field, message], index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span><strong>{field === 'name' ? 'Category Name' : field}:</strong> {message}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-amber-600">
                  Please review the form fields above and correct any highlighted errors.
                </p>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={deleteDialog.dialogState.isOpen}
        onClose={deleteDialog.closeDialog}
        onConfirm={deleteDialog.handleConfirm}
        title={deleteDialog.dialogState.title}
        message={deleteDialog.dialogState.message}
        confirmText={deleteDialog.dialogState.confirmText}
        cancelText={deleteDialog.dialogState.cancelText}
        variant={deleteDialog.dialogState.variant}
        isLoading={deleteDialog.dialogState.isLoading}
      />

      <ConfirmDialog
        isOpen={discardDialog.dialogState.isOpen}
        onClose={discardDialog.closeDialog}
        onConfirm={discardDialog.handleConfirm}
        title={discardDialog.dialogState.title}
        message={discardDialog.dialogState.message}
        confirmText={discardDialog.dialogState.confirmText}
        cancelText={discardDialog.dialogState.cancelText}
        variant={discardDialog.dialogState.variant}
        isLoading={discardDialog.dialogState.isLoading}
      />
    </div>
  );
};

export default CategoryEditPage;
