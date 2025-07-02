import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  CogIcon,
  TagIcon,
  PhotoIcon,
  CheckIcon,
  XMarkIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { PageHeader, EnhancedTabs, Button, ConfirmDialog, Loading, InputTextField, InputMoneyField, PropertyCheckbox, DropdownSearch } from '../components/ui';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';
import { ProductModifierManager } from '../components/product';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';
import { productService } from '../services/product';
import { globalModifierService, type GlobalModifierTemplate } from '../services/modifier/globalModifier.service';
import { categoryApiService } from '../services/category/categoryApiService';
import { CategoryUtils } from '../utils/categoryUtils';
import { taxServices } from '../services/tax';
import { storeServices } from '../services/store';
import { validateAllModifierGroups } from '../utils/modifierValidation';
import type { EnhancedCategory } from '../types/category';
import type { TaxGroup } from '../services/types/tax.types';
import type { 
  Product,
  ProductFormErrors
} from '../services/types/product.types';

const ProductEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { currentStore, currentTenant } = useTenantStore();
  
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    store_id: currentStore?.store_id || '',
    uom: '',
    brand: '',
    tax_group: '',
    fiscal_id: '',
    stock_status: 'in_stock',
    pricing: {
      list_price: 0,
      sale_price: 0,
      tare_value: 0,
      tare_uom: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_discount_value: 0,
      max_discount_value: 0
    },
    settings: {
      track_inventory: false,
      allow_backorder: false,
      require_serial: false,
      taxable: true,
      measure_required: false,
      non_inventoried: false,
      shippable: true,
      serialized: false,
      active: true,
      disallow_discount: false,
      online_only: false
    },
    prompts: {
      prompt_qty: false,
      prompt_price: false,
      prompt_weight: 0,
      prompt_uom: false,
      prompt_description: false,
      prompt_cost: false,
      prompt_serial: false,
      prompt_lot: false,
      prompt_expiry: false
    },
    attributes: {
      manufacturer: '',
      model_number: '',
      category_id: '',
      tags: [],
      custom_attributes: {},
      properties: {}
    },
    media: {
      image_url: ''
    },
    modifier_groups: []
  });

  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Category state
  const [categories, setCategories] = useState<EnhancedCategory[]>([]);

  // Tax groups state
  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>([]);
  const [taxGroupsLoading, setTaxGroupsLoading] = useState(false);

  // Global modifier templates state
  const [globalTemplates, setGlobalTemplates] = useState<GlobalModifierTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showTemplatesBrowser, setShowTemplatesBrowser] = useState(false);

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

  // Get currency symbol based on store currency
  const getCurrencySymbol = (): string => {
    const storeCurrency = currentStore?.currency || 'USD';
    const supportedCurrencies = storeServices.settings.getSupportedCurrencies();
    const currency = supportedCurrencies.find(c => c.code === storeCurrency);
    return currency?.symbol || '$';
  };

  // Load categories for dropdown
  useEffect(() => {
    const loadCategories = async () => {
      if (currentTenant && currentStore) {
        try {
          const result = await categoryApiService.getCategories({
            tenant_id: currentTenant.id,
            store_id: currentStore.store_id
          });
          setCategories(result);
        } catch (error) {
          console.error('Error loading categories:', error);
        }
      }
    };

    loadCategories();
  }, [currentTenant, currentStore]);

  // Load tax groups for dropdown
  useEffect(() => {
    const loadTaxGroups = async () => {
      if (currentTenant) {
        setTaxGroupsLoading(true);
        try {
          const storeId = currentStore?.store_id || "*";
          const country = currentStore?.address?.country;
          
          const taxConfig = await taxServices.configuration.getTaxConfiguration(
            currentTenant.id, 
            storeId, 
            country
          );
          if (taxConfig && taxConfig.tax_group) {
            setTaxGroups(taxConfig.tax_group);
          }
        } catch (error) {
          console.error('Error loading tax groups:', error);
          // If tax configuration fails, we'll fall back to empty array (already set in state)
        } finally {
          setTaxGroupsLoading(false);
        }
      }
    };

    loadTaxGroups();
  }, [currentTenant]);

  // Load global modifier templates
  useEffect(() => {
    const loadGlobalTemplates = async () => {
      if (currentTenant && currentStore) {
        setTemplatesLoading(true);
        try {
          const response = await globalModifierService.getGlobalModifierGroups(
            currentTenant.id,
            currentStore.store_id,
            { active: true, limit: 100 }
          );

          // Load modifiers for each template
          const templatesWithModifiers = await Promise.all(
            response.items.map(async (group) => {
              try {
                const modifiersResponse = await globalModifierService.getGlobalModifiers(
                  currentTenant.id,
                  currentStore.store_id,
                  group.group_id
                );
                return globalModifierService.mapApiGlobalModifierGroupToInternal(
                  group,
                  modifiersResponse.items
                );
              } catch (error) {
                console.warn('Failed to load modifiers for template:', group.group_id, error);
                return globalModifierService.mapApiGlobalModifierGroupToInternal(group, []);
              }
            })
          );

          setGlobalTemplates(templatesWithModifiers);
        } catch (error) {
          console.error('Error loading global modifier templates:', error);
          setGlobalTemplates([]);
        } finally {
          setTemplatesLoading(false);
        }
      }
    };

    loadGlobalTemplates();
  }, [currentTenant, currentStore]);

  // Load existing product data for editing
  useEffect(() => {
    const loadProduct = async () => {
      if (isEditing && id && currentTenant && currentStore) {
        setIsLoadingData(true);
        try {
          const apiProduct = await productService.getProduct(
            currentTenant.id,
            currentStore.store_id,
            id
          );
          const product = await productService.mapApiProductToProduct(
            apiProduct, 
            currentTenant.id, 
            currentStore.store_id
          );
          setFormData(product);
        } catch (error) {
          console.error('Error loading product:', error);
          // Handle error - maybe show a toast or redirect
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    loadProduct();
  }, [isEditing, id, currentTenant, currentStore]);

  // Convert categories to DropdownSearchOption format
  const getCategoryDropdownOptions = (): DropdownSearchOption[] => {
    return categories.map(category => {
      const level = CategoryUtils.getCategoryAncestors(category.category_id, categories).length;
      return {
        id: category.category_id,
        label: category.name,
        description: category.description || undefined,
        level: level,
        data: category
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
  };

  // Handle category selection
  const handleCategorySelect = (option: DropdownSearchOption | null) => {
    handleInputChange({
      target: { name: 'attributes.category_id', value: option?.id || '' }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // Get display value for category dropdown
  const getCategoryDisplayValue = (option: DropdownSearchOption | null) => {
    if (!option && !formData.attributes?.category_id) {
      return 'No Category Selected';
    }
    
    if (formData.attributes?.category_id) {
      const category = categories.find(c => c.category_id === formData.attributes?.category_id);
      return category ? getCategoryDisplayName(category.category_id) : 'No Category Selected';
    }
    
    return option ? getCategoryDisplayName(option.id) : 'No Category Selected';
  };

  // Apply global modifier template to product
  const applyGlobalTemplate = (template: GlobalModifierTemplate) => {
    const productModifierGroup = globalModifierService.convertTemplateToProductModifierGroup(template);
    
    setFormData(prev => ({
      ...prev,
      modifier_groups: [
        ...(prev.modifier_groups || []),
        productModifierGroup
      ]
    }));
    
    setShowTemplatesBrowser(false);
  };

  // Helper function to get category display name with hierarchy path
  const getCategoryDisplayName = (categoryId: string) => {
    const category = categories.find(c => c.category_id === categoryId);
    if (!category) return '';

    const ancestors = CategoryUtils.getCategoryAncestors(categoryId, categories);
    if (ancestors.length > 0) {
      const path = ancestors.map(a => a.name).join(' > ');
      return `${path} > ${category.name}`;
    }
    return category.name;
  };

  // Tax Group dropdown options
  const getTaxGroupDropdownOptions = (): DropdownSearchOption[] => {
    return taxGroups.map(group => ({
      id: group.tax_group_id,
      label: group.name,
      description: group.description || `${group.group_rule.length} tax rules`
    }));
  };

  // Handle tax group selection
  const handleTaxGroupSelect = (option: DropdownSearchOption | null) => {
    handleInputChange({
      target: { name: 'tax_group', value: option?.id || '' }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // Stock Status dropdown options
  const getStockStatusDropdownOptions = (): DropdownSearchOption[] => {
    return [
      { id: 'in_stock', label: 'In Stock', description: 'Product is available' },
      { id: 'out_of_stock', label: 'Out of Stock', description: 'Product is not available' },
      { id: 'backorder', label: 'Backorder', description: 'Can be ordered but not immediately available' },
      { id: 'discontinued', label: 'Discontinued', description: 'Product is no longer available' }
    ];
  };

  // Handle stock status selection
  const handleStockStatusSelect = (option: DropdownSearchOption | null) => {
    handleInputChange({
      target: { name: 'stock_status', value: option?.id || 'in_stock' }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // Discount Type dropdown options
  const getDiscountTypeDropdownOptions = (): DropdownSearchOption[] => {
    return [
      { id: 'percentage', label: 'Percentage', description: 'Discount as a percentage of price' },
      { id: 'fixed', label: 'Fixed Amount', description: 'Discount as a fixed dollar amount' }
    ];
  };

  // Handle discount type selection
  const handleDiscountTypeSelect = (option: DropdownSearchOption | null) => {
    handleInputChange({
      target: { name: 'pricing.discount_type', value: option?.id || 'percentage' }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const validateForm = (): boolean => {
    const newErrors: ProductFormErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.store_id) {
      newErrors.store_id = 'Store ID is required';
    }

    if (!formData.uom?.trim()) {
      newErrors.uom = 'Unit of measure is required';
    }

    if (!formData.pricing?.list_price || formData.pricing.list_price <= 0) {
      newErrors.list_price = 'List price must be greater than 0';
    }

    // Validate modifiers if they exist
    if (formData.modifier_groups && formData.modifier_groups.length > 0) {
      const modifierErrors = validateAllModifierGroups(formData.modifier_groups);
      
      // Convert modifier errors to general form errors
      if (Object.keys(modifierErrors).length > 0) {
        newErrors.general = 'Please fix the errors in the modifiers section';
        
        // You could also set specific errors for display
        Object.entries(modifierErrors).forEach(([key, value]) => {
          newErrors[key] = value;
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...((prev as any)?.[parent] || {}),
            [child]: type === 'number' ? parseFloat(value) || 0 : 
                     type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
          }
        }));
      } else if (parts.length === 3) {
        const [grandParent, parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [grandParent]: {
            ...((prev as any)?.[grandParent] || {}),
            [parent]: {
              ...((prev as any)?.[grandParent]?.[parent] || {}),
              [child]: type === 'number' ? parseFloat(value) || 0 : 
                       type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : 
                type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleArrayInputChange = (field: string, value: string) => {
    const values = value.split(',').map(v => v.trim()).filter(v => v);
    
    if (field.includes('.')) {
      const parts = field.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...((prev as any)?.[parent] || {}),
            [child]: values
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: values
      }));
    }
  };

  const handleObjectInputChange = (parent: string, key: string, value: string) => {
    if (parent.includes('.')) {
      const parts = parent.split('.');
      if (parts.length === 2) {
        const [grandParent, parentKey] = parts;
        setFormData(prev => ({
          ...prev,
          [grandParent]: {
            ...((prev as any)?.[grandParent] || {}),
            [parentKey]: {
              ...((prev as any)?.[grandParent]?.[parentKey] || {}),
              [key]: value
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...((prev as any)?.[parent] || {}),
          [key]: value
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!currentTenant || !currentStore) {
      console.error('Tenant or store not selected');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isEditing && id) {
        // Update existing product
        const updateRequest = productService.mapProductToCreateRequest(formData as Product);
        await productService.updateProduct(
          currentTenant.id,
          currentStore.store_id,
          id,
          updateRequest
        );
        console.log('Product updated successfully');
      } else {
        // Create new product
        const createRequest = productService.mapProductToCreateRequest(formData as Product);
        await productService.createProduct(
          currentTenant.id,
          currentStore.store_id,
          createRequest
        );
        console.log('Product created successfully');
      }
      
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      // Handle error - maybe show a toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentTenant || !currentStore || !id) {
      console.error('Missing required data for deletion');
      return;
    }

    const productName = formData.name || 'this product';
    
    deleteDialog.openDeleteDialog(productName, async () => {
      setIsLoading(true);
      try {
        await productService.deleteProduct(
          currentTenant.id,
          currentStore.store_id,
          id
        );
        console.log('Product deleted successfully');
        navigate('/products');
      } catch (error) {
        console.error('Error deleting product:', error);
        // Handle error - maybe show a toast notification
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleBack = () => {
    navigate('/products');
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: ClipboardDocumentListIcon },
    { id: 'pricing', name: 'Pricing', icon: CurrencyDollarIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
    { id: 'attributes', name: 'Attributes', icon: TagIcon },
    { id: 'media', name: 'Media', icon: PhotoIcon },
    { id: 'modifiers', name: 'Modifiers', icon: CubeIcon }
  ];

  // Show loading screen while fetching data
  if (isLoadingData) {
    return (
      <Loading
        title={isEditing ? "Loading Product" : "Initializing"}
        description={isEditing ? "Please wait while we fetch the product details..." : "Setting up the product form..."}
        fullScreen={true}
        size="lg"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-3 sm:p-6">
        {/* Header */}
        <PageHeader
          title={isEditing ? 'Edit Product' : 'Create Product'}
          description={isEditing ? `Modify product details and configurations` : 'Add a new product to your inventory'}
        >
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Products</span>
            </Button>
            
            {isEditing && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isLoading}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            )}
          </div>
        </PageHeader>

        <form onSubmit={handleSubmit} className="bg-white">
          {/* Tab Navigation */}
          <EnhancedTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            allowOverflow={true}
          >
            {/* Tab Content */}
            <div className="px-3 sm:px-6 py-4 sm:py-8">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Product Name */}
                  <InputTextField
                    label="Product Name"
                    required
                    value={formData.name}
                    onChange={(value) => handleInputChange({ target: { name: 'name', value, type: 'text' } } as any)}
                    placeholder="Enter product name"
                    error={errors.name}
                    colSpan="md:col-span-2"
                  />

                  {/* Product ID */}
                  <InputTextField
                    label="Product ID"
                    value={formData.item_id || ''}
                    onChange={(value) => handleInputChange({ target: { name: 'item_id', value, type: 'text' } } as any)}
                    placeholder={isEditing ? "Product ID (system generated)" : "Enter product ID (optional)"}
                    disabled={isEditing}
                    helperText={isEditing ? "Product ID cannot be changed after creation" : "Leave empty to auto-generate"}
                  />

                  {/* Category */}
                  <div>
                    <DropdownSearch
                      label="Category"
                      value={formData.attributes?.category_id}
                      placeholder="No Category Selected"
                      searchPlaceholder="Search categories..."
                      options={getCategoryDropdownOptions()}
                      onSelect={handleCategorySelect}
                      displayValue={getCategoryDisplayValue}
                      clearLabel="No Category"
                      noOptionsMessage="No categories available"
                      allowClear={true}
                      closeOnSelect={true}
                    />
                  </div>

                  {/* UOM */}
                  <InputTextField
                    label="Unit of Measure"
                    required
                    value={formData.uom}
                    onChange={(value) => handleInputChange({ target: { name: 'uom', value, type: 'text' } } as any)}
                    placeholder="e.g., lb, kg, each"
                    error={errors.uom}
                  />

                  {/* Brand */}
                  <InputTextField
                    label="Brand"
                    value={formData.brand}
                    onChange={(value) => handleInputChange({ target: { name: 'brand', value, type: 'text' } } as any)}
                    placeholder="Enter brand name"
                  />

                  {/* Tax Group */}
                  <div>
                    <DropdownSearch
                      label="Tax Group"
                      value={formData.tax_group}
                      placeholder={taxGroupsLoading ? "Loading tax groups..." : "Select tax group"}
                      searchPlaceholder="Search tax groups..."
                      options={getTaxGroupDropdownOptions()}
                      onSelect={handleTaxGroupSelect}
                      clearLabel="No Tax Group"
                      noOptionsMessage={
                        taxGroupsLoading 
                          ? "Loading tax groups..." 
                          : taxGroups.length === 0 
                            ? "No tax groups configured. Please set up tax configuration first."
                            : "No tax groups match your search"
                      }
                      allowClear={true}
                      closeOnSelect={true}
                    />
                  </div>

                  {/* Fiscal ID */}
                  <InputTextField
                    label="Fiscal ID"
                    value={formData.fiscal_id}
                    onChange={(value) => handleInputChange({ target: { name: 'fiscal_id', value, type: 'text' } } as any)}
                    placeholder="Enter fiscal ID"
                  />

                  {/* Stock Status */}
                  <div>
                    <DropdownSearch
                      label="Stock Status"
                      value={formData.stock_status || 'in_stock'}
                      placeholder="Select stock status"
                      searchPlaceholder="Search stock status..."
                      options={getStockStatusDropdownOptions()}
                      onSelect={handleStockStatusSelect}
                      clearLabel="Default Status"
                      noOptionsMessage="No status options available"
                      allowClear={false}
                      closeOnSelect={true}
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product description"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Pricing Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* List Price */}
                  <InputMoneyField
                    label="List Price"
                    required
                    value={formData.pricing?.list_price || ''}
                    onChange={(value) => handleInputChange({ target: { name: 'pricing.list_price', value, type: 'number' } } as any)}
                    placeholder="0.00"
                    error={errors.list_price}
                    min={0}
                    step={0.01}
                    currencySymbol={getCurrencySymbol()}
                  />

                  {/* Sale Price */}
                  <InputMoneyField
                    label="Sale Price"
                    value={formData.pricing?.sale_price || ''}
                    onChange={(value) => handleInputChange({ target: { name: 'pricing.sale_price', value, type: 'number' } } as any)}
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    currencySymbol={getCurrencySymbol()}
                  />

                  {/* Tare Value */}
                  <InputMoneyField
                    label="Tare Value"
                    value={formData.pricing?.tare_value || ''}
                    onChange={(value) => handleInputChange({ target: { name: 'pricing.tare_value', value, type: 'number' } } as any)}
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    currencySymbol={getCurrencySymbol()}
                  />

                  {/* Tare UOM */}
                  <InputTextField
                    label="Tare UOM"
                    value={formData.pricing?.tare_uom}
                    onChange={(value) => handleInputChange({ target: { name: 'pricing.tare_uom', value, type: 'text' } } as any)}
                    placeholder="e.g., oz, g"
                  />

                  {/* Discount Type */}
                  <div>
                    <DropdownSearch
                      label="Discount Type"
                      value={formData.pricing?.discount_type || 'percentage'}
                      placeholder="Select discount type"
                      searchPlaceholder="Search discount types..."
                      options={getDiscountTypeDropdownOptions()}
                      onSelect={handleDiscountTypeSelect}
                      clearLabel="Default Type"
                      noOptionsMessage="No discount types available"
                      allowClear={false}
                      closeOnSelect={true}
                    />
                  </div>

                  {/* Discount Value */}
                  <InputMoneyField
                    label="Discount Value"
                    value={formData.pricing?.discount_value}
                    onChange={(value) => handleInputChange({ target: { name: 'pricing.discount_value', value, type: 'number' } } as any)}
                    placeholder="0.00"
                    step={0.01}
                    min={0}
                    currencySymbol={formData.pricing?.discount_type === 'percentage' ? '%' : getCurrencySymbol()}
                    currencyPosition="after"
                  />

                  {/* Min Discount Value */}
                  <InputMoneyField
                    label="Min Discount Value"
                    value={formData.pricing?.min_discount_value}
                    onChange={(value) => handleInputChange({ target: { name: 'pricing.min_discount_value', value, type: 'number' } } as any)}
                    placeholder="0.00"
                    step={0.01}
                    min={0}
                    currencySymbol={formData.pricing?.discount_type === 'percentage' ? '%' : getCurrencySymbol()}
                    currencyPosition="after"
                  />

                  {/* Max Discount Value */}
                  <InputMoneyField
                    label="Max Discount Value"
                    value={formData.pricing?.max_discount_value}
                    onChange={(value) => handleInputChange({ target: { name: 'pricing.max_discount_value', value, type: 'number' } } as any)}
                    placeholder="0.00"
                    step={0.01}
                    min={0}
                    currencySymbol={formData.pricing?.discount_type === 'percentage' ? '%' : getCurrencySymbol()}
                    currencyPosition="after"
                  />
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Product Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Inventory Settings */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-800">Inventory Settings</h3>
                    
                    <div className="space-y-3">
                      <PropertyCheckbox
                        title="Track Inventory"
                        description="Monitor stock levels for this product"
                        checked={formData.settings?.track_inventory || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'settings.track_inventory', checked, type: 'checkbox' } } as any)}
                      />
                      
                      <PropertyCheckbox
                        title="Allow Backorder"
                        description="Allow orders when item is out of stock"
                        checked={formData.settings?.allow_backorder || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'settings.allow_backorder', checked, type: 'checkbox' } } as any)}
                      />
                      
                      <PropertyCheckbox
                        title="Require Serial Number"
                        description="Serial number must be provided for this product"
                        checked={formData.settings?.require_serial || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'settings.require_serial', checked, type: 'checkbox' } } as any)}
                      />
                    </div>
                  </div>

                  {/* Product Flags */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-800">Product Flags</h3>
                    
                    <div className="space-y-3">
                      <PropertyCheckbox
                        title="Taxable"
                        description="Apply taxes to this product"
                        checked={formData.settings?.taxable || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'settings.taxable', checked, type: 'checkbox' } } as any)}
                      />
                      
                      <PropertyCheckbox
                        title="Measure Required"
                        description="Require weight or measurement for this product"
                        checked={formData.settings?.measure_required || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'settings.measure_required', checked, type: 'checkbox' } } as any)}
                      />
                      
                      <PropertyCheckbox
                        title="Non-Inventoried"
                        description="This product is not tracked in inventory"
                        checked={formData.settings?.non_inventoried || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'settings.non_inventoried', checked, type: 'checkbox' } } as any)}
                      />
                      
                      <PropertyCheckbox
                        title="Shippable"
                        description="This product can be shipped to customers"
                        checked={formData.settings?.shippable || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'settings.shippable', checked, type: 'checkbox' } } as any)}
                      />
                      
                      <PropertyCheckbox
                        title="Active"
                        description="Product is active and available for sale"
                        checked={formData.settings?.active || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'settings.active', checked, type: 'checkbox' } } as any)}
                      />
                      
                      <PropertyCheckbox
                        title="Disallow Discount"
                        description="Prevent discounts from being applied to this product"
                        checked={formData.settings?.disallow_discount || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'settings.disallow_discount', checked, type: 'checkbox' } } as any)}
                      />
                      
                      <PropertyCheckbox
                        title="Online Only"
                        description="Product is only available for online orders"
                        checked={formData.settings?.online_only || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'settings.online_only', checked, type: 'checkbox' } } as any)}
                      />
                    </div>
                  </div>

                  {/* Prompt Settings */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-800">Prompt Settings</h3>
                    
                    <div className="space-y-3">
                      <PropertyCheckbox
                        title="Prompt for Price"
                        description="Ask for price confirmation during sale"
                        checked={formData.prompts?.prompt_price || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'prompts.prompt_price', checked, type: 'checkbox' } } as any)}
                      />
                      
                      <PropertyCheckbox
                        title="Prompt for Quantity"
                        description="Ask for quantity confirmation during sale"
                        checked={formData.prompts?.prompt_qty || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'prompts.prompt_qty', checked, type: 'checkbox' } } as any)}
                      />
                      
                      <PropertyCheckbox
                        title="Prompt for Description"
                        description="Ask for additional description during sale"
                        checked={formData.prompts?.prompt_description || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'prompts.prompt_description', checked, type: 'checkbox' } } as any)}
                      />
                      
                      <PropertyCheckbox
                        title="Prompt for UOM"
                        description="Ask for unit of measure during sale"
                        checked={formData.prompts?.prompt_uom || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'prompts.prompt_uom', checked, type: 'checkbox' } } as any)}
                      />
                      
                      <PropertyCheckbox
                        title="Prompt for Cost"
                        description="Ask for cost confirmation during sale"
                        checked={formData.prompts?.prompt_cost || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'prompts.prompt_cost', checked, type: 'checkbox' } } as any)}
                      />
                      
                      <PropertyCheckbox
                        title="Prompt for Serial"
                        description="Ask for serial number during sale"
                        checked={formData.prompts?.prompt_serial || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'prompts.prompt_serial', checked, type: 'checkbox' } } as any)}
                      />
                      
                      <PropertyCheckbox
                        title="Prompt for Lot"
                        description="Ask for lot number during sale"
                        checked={formData.prompts?.prompt_lot || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'prompts.prompt_lot', checked, type: 'checkbox' } } as any)}
                      />
                      
                      <PropertyCheckbox
                        title="Prompt for Expiry"
                        description="Ask for expiry date during sale"
                        checked={formData.prompts?.prompt_expiry || false}
                        onChange={(checked) => handleInputChange({ target: { name: 'prompts.prompt_expiry', checked, type: 'checkbox' } } as any)}
                      />
                    </div>
                  </div>

                  {/* Additional Settings */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-800">Additional Settings</h3>
                    
                    <div className="space-y-3">
                      {/* Prompt Weight */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prompt Weight Threshold
                        </label>
                        <input
                          type="number"
                          name="prompts.prompt_weight"
                          value={formData.prompts?.prompt_weight || ''}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>

                      {/* Manufacturer */}
                      <InputTextField
                        label="Manufacturer"
                        value={formData.attributes?.manufacturer}
                        onChange={(value) => handleInputChange({ target: { name: 'attributes.manufacturer', value, type: 'text' } } as any)}
                        placeholder="Enter manufacturer name"
                      />

                      {/* Model Number */}
                      <InputTextField
                        label="Model Number"
                        value={formData.attributes?.model_number}
                        onChange={(value) => handleInputChange({ target: { name: 'attributes.model_number', value, type: 'text' } } as any)}
                        placeholder="Enter model number"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attributes Tab */}
            {activeTab === 'attributes' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Attributes & Properties</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Tags */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.attributes?.tags?.join(', ') || ''}
                      onChange={(e) => handleArrayInputChange('attributes.tags', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter tags separated by commas"
                    />
                    <p className="mt-1 text-xs text-gray-500">Separate multiple tags with commas</p>
                  </div>
                </div>

                {/* Custom Attributes */}
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-4">Custom Attributes</h3>
                  <div className="space-y-3">
                    {Object.entries(formData.attributes?.custom_attributes || {}).map(([key, value], index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newCustomAttributes = { ...formData.attributes?.custom_attributes };
                            delete newCustomAttributes[key];
                            newCustomAttributes[e.target.value] = value as string;
                            setFormData(prev => ({ 
                              ...prev, 
                              attributes: { 
                                ...prev.attributes,
                                custom_attributes: newCustomAttributes || {}
                              }
                            }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Attribute name"
                        />
                        <input
                          type="text"
                          value={value as string}
                          onChange={(e) => handleObjectInputChange('attributes.custom_attributes', key, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Attribute value"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newCustomAttributes = { ...formData.attributes?.custom_attributes };
                            delete newCustomAttributes[key];
                            setFormData(prev => ({ 
                              ...prev, 
                              attributes: { 
                                ...prev.attributes,
                                custom_attributes: newCustomAttributes || {}
                              }
                            }));
                          }}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newKey = `attribute_${Object.keys(formData.attributes?.custom_attributes || {}).length + 1}`;
                        handleObjectInputChange('attributes.custom_attributes', newKey, '');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Attribute
                    </button>
                  </div>
                </div>

                {/* Properties */}
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-4">Properties</h3>
                  <div className="space-y-3">
                    {Object.entries(formData.attributes?.properties || {}).map(([key, value], index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newProperties = { ...formData.attributes?.properties };
                            delete newProperties[key];
                            newProperties[e.target.value] = value as string;
                            setFormData(prev => ({ 
                              ...prev, 
                              attributes: { 
                                ...prev.attributes,
                                properties: newProperties || {}
                              }
                            }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Property name"
                        />
                        <input
                          type="text"
                          value={value as string}
                          onChange={(e) => handleObjectInputChange('attributes.properties', key, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Property value"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newProperties = { ...formData.attributes?.properties };
                            delete newProperties[key];
                            setFormData(prev => ({ 
                              ...prev, 
                              attributes: { 
                                ...prev.attributes,
                                properties: newProperties || {}
                              }
                            }));
                          }}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newKey = `property_${Object.keys(formData.attributes?.properties || {}).length + 1}`;
                        handleObjectInputChange('attributes.properties', newKey, '');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Property
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Product Media</h2>
                
                <div>
                  <InputTextField
                    type="url"
                    label="Image URL"
                    value={formData.media?.image_url}
                    onChange={(value) => handleInputChange({ target: { name: 'media.image_url', value, type: 'url' } } as any)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Image Preview */}
                {formData.media?.image_url && (
                  <div>
                    <h3 className="text-md font-medium text-gray-800 mb-2">Preview</h3>
                    <div className="w-48 h-48 border border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={formData.media.image_url}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=Image+Not+Found';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Image Guidelines */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Image Guidelines</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Recommended size: 400x400 pixels or larger</li>
                    <li>• Supported formats: JPG, PNG, WebP</li>
                    <li>• Maximum file size: 5MB</li>
                    <li>• Use high-quality images for better visibility</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Modifiers Tab */}
            {activeTab === 'modifiers' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Product Modifiers</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Add modifier groups to allow customers to customize this product with additional options, sizes, or variations.
                  </p>
                </div>

                {/* Global Templates Browser */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-md font-medium text-purple-900">Global Modifier Templates</h3>
                      <p className="text-sm text-purple-700">Apply pre-configured modifier templates to this product</p>
                    </div>
                    <Button
                      onClick={() => setShowTemplatesBrowser(!showTemplatesBrowser)}
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      {showTemplatesBrowser ? 'Hide Templates' : 'Browse Templates'}
                    </Button>
                  </div>

                  {showTemplatesBrowser && (
                    <div className="mt-4">
                      {templatesLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                          <p className="text-sm text-purple-600 mt-2">Loading templates...</p>
                        </div>
                      ) : globalTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {globalTemplates.map((template) => (
                            <div
                              key={template.group_id}
                              className="bg-white border border-purple-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                                  {template.description && (
                                    <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                                  )}
                                  <div className="flex items-center space-x-2 mt-2 text-xs">
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                      {template.selection_type}
                                    </span>
                                    {template.required && (
                                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                                        Required
                                      </span>
                                    )}
                                    <span className="text-gray-500">
                                      {template.modifiers.length} modifiers
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => applyGlobalTemplate(template)}
                                  size="sm"
                                  className="ml-2 bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  Apply
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-purple-600">No global modifier templates available</p>
                          <Button
                            onClick={() => navigate('/global-modifiers/new')}
                            size="sm"
                            variant="outline"
                            className="mt-2 border-purple-300 text-purple-700 hover:bg-purple-100"
                          >
                            Create Template
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <ProductModifierManager
                  modifierGroups={formData.modifier_groups || []}
                  onChange={(modifierGroups) => {
                    setFormData(prev => ({
                      ...prev,
                      modifier_groups: modifierGroups
                    }));
                  }}
                  disabled={isLoading}
                />

                {/* Modifiers Help */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Modifier Guidelines</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Modifier Groups:</strong> Organize related options (e.g., "Toppings", "Size", "Spice Level")</li>
                    <li>• <strong>Selection Type:</strong> Choose "Single" for exclusive options or "Multiple" for add-ons</li>
                    <li>• <strong>Price Delta:</strong> Use positive values to add cost, negative values for discounts</li>
                    <li>• <strong>Required Groups:</strong> Force customers to make a selection from required groups</li>
                    <li>• <strong>Sort Order:</strong> Controls the display order of groups and modifiers</li>
                  </ul>
                </div>
              </div>
            )}
            </div>
          </EnhancedTabs>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2  bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>{isEditing ? 'Update Product' : 'Create Product'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Confirm Dialog */}
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
    </div>
  );
};

export default ProductEdit;
