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
  CubeIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { PageHeader, EnhancedTabs, Button, ConfirmDialog, Loading } from '../components/ui';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';
import { 
  ProductBasicInfoTab,
  ProductPricingTab,
  ProductSettingsTab,
  ProductAttributesTab,
  ProductMediaTab,
  ProductModifiersTab
} from '../components/product';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';
import { productService, type CreateProductRequest, type UpdateProductRequest } from '../services/product';
import { globalModifierService, type GlobalModifierTemplate } from '../services/modifier/globalModifier.service';
import { categoryApiService } from '../services/category/categoryApiService';
import { CategoryUtils } from '../utils/categoryUtils';
import { taxServices } from '../services/tax';
import { validateAllModifierGroups } from '../utils/modifierValidation';
import { DEFAULT_UOM } from '../constants/uom';
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
    uom: DEFAULT_UOM,
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
  const [showTemplatesBrowser, setShowTemplatesBrowser] = useState(false);

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

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
        try {
          const response = await globalModifierService.getGlobalModifierGroups(
            currentTenant.id,
            currentStore.store_id,
            {
              active: true,
              includeModifiers: true
            }
          );
          const templates = response.items.map(group => 
            globalModifierService.mapApiGlobalModifierGroupToInternal(group)
          );
          setGlobalTemplates(templates);
        } catch (error) {
          console.error('Error loading global modifier templates:', error);
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
          const product = await productService.getProduct(
            currentTenant.id,
            currentStore.store_id,
            id
          );
          // Convert API response to internal Product format
          const convertedProduct: Partial<Product> = {
            item_id: product.item_id,
            store_id: product.store_id,
            name: product.name,
            description: product.description || '',
            uom: product.uom || DEFAULT_UOM,
            brand: product.brand || '',
            tax_group: product.tax_group || '',
            fiscal_id: product.fiscal_item_id || '',
            stock_status: (product.stock_status as 'in_stock' | 'out_of_stock' | 'low_stock' | 'on_order') || 'in_stock',
            pricing: {
              list_price: product.list_price || 0,
              sale_price: product.sale_price || 0,
              tare_value: product.tare_value || 0,
              tare_uom: product.tare_uom || '',
              discount_type: 'percentage',
              discount_value: 0,
              min_discount_value: 0,
              max_discount_value: 0
            },
            settings: {
              track_inventory: false, // Not available in API response
              allow_backorder: false, // Not available in API response
              require_serial: false, // Not available in API response
              taxable: true, // Default value
              measure_required: product.measure_required || false,
              non_inventoried: product.non_inventoried || false,
              shippable: product.shippable !== false,
              serialized: product.serialized || false,
              active: product.active !== false,
              disallow_discount: product.disallow_discount || false,
              online_only: product.online_only || false
            },
            prompts: {
              prompt_qty: product.prompt_qty || false,
              prompt_price: product.prompt_price || false,
              prompt_weight: 0,
              prompt_uom: false,
              prompt_description: product.prompt_description || false,
              prompt_cost: false,
              prompt_serial: false,
              prompt_lot: false,
              prompt_expiry: false
            },
            attributes: {
              manufacturer: '',
              model_number: '',
              category_id: product.merch_level1 || '',
              tags: [],
              custom_attributes: product.custom_attribute || {},
              properties: product.properties || {}
            },
            media: {
              image_url: product.image_url || ''
            },
            modifier_groups: product.modifier_groups?.map(group => ({
              group_id: group.group_id,
              name: group.name,
              selection_type: group.selection_type,
              exact_selections: group.exact_selections,
              max_selections: group.max_selections,
              min_selections: group.min_selections,
              required: group.required,
              sort_order: group.sort_order,
              price_delta: group.price_delta,
              modifiers: group.modifiers?.map(modifier => ({
                modifier_id: modifier.modifier_id,
                name: modifier.name,
                price_delta: modifier.price_delta,
                default_selected: modifier.default_selected,
                sort_order: modifier.sort_order
              })) || []
            })) || []
          };
          setFormData(convertedProduct);
        } catch (error) {
          console.error('Error loading product:', error);
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
      newErrors.store_id = 'Store is required';
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
      const errorMessages = Object.values(modifierErrors);
      if (errorMessages.length > 0) {
        newErrors.modifiers = errorMessages.join(', ');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const updated = { ...prev };
        let current: any = updated;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        const finalKey = keys[keys.length - 1];
        if (type === 'checkbox') {
          current[finalKey] = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
          current[finalKey] = parseFloat(value) || 0;
        } else {
          current[finalKey] = value;
        }
        
        return updated;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleArrayInputChange = (field: string, value: string) => {
    const values = value.split(',').map(v => v.trim()).filter(v => v);
    
    if (field.includes('.')) {
      const keys = field.split('.');
      setFormData(prev => {
        const updated = { ...prev };
        let current: any = updated;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = values;
        return updated;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: values
      }));
    }
  };

  const handleObjectInputChange = (parent: string, key: string, value: string) => {
    if (parent.includes('.')) {
      const keys = parent.split('.');
      setFormData(prev => {
        const updated = { ...prev };
        let current: any = updated;
        
        for (let i = 0; i < keys.length; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          if (i === keys.length - 1) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current[keys[i]][key] = value;
          } else {
            current = current[keys[i]];
          }
        }
        
        return updated;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as object,
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
      console.error('Missing tenant or store information');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isEditing && id) {
        const updateRequest: UpdateProductRequest = {
          item_id: id,
          store_id: currentStore.store_id,
          name: formData.name,
          description: formData.description,
          uom: formData.uom || DEFAULT_UOM,
          brand: formData.brand,
          tax_group: formData.tax_group,
          fiscal_item_id: formData.fiscal_id,
          stock_status: formData.stock_status,
          list_price: formData.pricing?.list_price || 0,
          sale_price: formData.pricing?.sale_price,
          tare_value: formData.pricing?.tare_value,
          tare_uom: formData.pricing?.tare_uom,
          image_url: formData.media?.image_url,
          measure_required: formData.settings?.measure_required,
          non_inventoried: formData.settings?.non_inventoried,
          shippable: formData.settings?.shippable,
          serialized: formData.settings?.serialized,
          active: formData.settings?.active,
          disallow_discount: formData.settings?.disallow_discount,
          online_only: formData.settings?.online_only,
          prompt_qty: formData.prompts?.prompt_qty,
          prompt_price: formData.prompts?.prompt_price,
          prompt_description: formData.prompts?.prompt_description,
          custom_attribute: formData.attributes?.custom_attributes,
          properties: formData.attributes?.properties,
          modifier_groups: formData.modifier_groups
        };
        await productService.updateProduct(
          currentTenant.id,
          currentStore.store_id,
          id,
          updateRequest
        );
        console.log('Product updated successfully');
      } else {
        const createRequest: CreateProductRequest = {
          item_id: `prod_${Date.now()}`, // Generate a unique ID for new products
          store_id: currentStore.store_id,
          name: formData.name!,
          description: formData.description,
          uom: formData.uom || DEFAULT_UOM,
          brand: formData.brand,
          tax_group: formData.tax_group,
          fiscal_item_id: formData.fiscal_id,
          stock_status: formData.stock_status,
          list_price: formData.pricing?.list_price || 0,
          sale_price: formData.pricing?.sale_price,
          tare_value: formData.pricing?.tare_value,
          tare_uom: formData.pricing?.tare_uom,
          image_url: formData.media?.image_url,
          measure_required: formData.settings?.measure_required,
          non_inventoried: formData.settings?.non_inventoried,
          shippable: formData.settings?.shippable,
          serialized: formData.settings?.serialized,
          active: formData.settings?.active,
          disallow_discount: formData.settings?.disallow_discount,
          online_only: formData.settings?.online_only,
          prompt_qty: formData.prompts?.prompt_qty,
          prompt_price: formData.prompts?.prompt_price,
          prompt_description: formData.prompts?.prompt_description,
          custom_attribute: formData.attributes?.custom_attributes,
          properties: formData.attributes?.properties,
          modifier_groups: formData.modifier_groups
        };
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
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
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

      {/* Main Content */}
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Tab Navigation */}
          <EnhancedTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            allowOverflow={true}
          >
            {/* Tab Content */}
            <div className="p-6">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <ProductBasicInfoTab
                  formData={formData}
                  errors={errors}
                  categories={categories}
                  isEditing={isEditing}
                  onInputChange={handleInputChange}
                  getCategoryDropdownOptions={getCategoryDropdownOptions}
                  handleCategorySelect={handleCategorySelect}
                  getCategoryDisplayValue={getCategoryDisplayValue}
                  handleStockStatusSelect={handleStockStatusSelect}
                  getStockStatusDropdownOptions={getStockStatusDropdownOptions}
                  getTaxGroupDropdownOptions={getTaxGroupDropdownOptions}
                  handleTaxGroupSelect={handleTaxGroupSelect}
                  taxGroupsLoading={taxGroupsLoading}
                />
              )}

              {/* Pricing Tab */}
              {activeTab === 'pricing' && (
                <ProductPricingTab
                  formData={formData}
                  errors={errors}
                  onInputChange={handleInputChange}
                  getDiscountTypeDropdownOptions={getDiscountTypeDropdownOptions}
                  handleDiscountTypeSelect={handleDiscountTypeSelect}
                />
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <ProductSettingsTab
                  formData={formData}
                  onInputChange={handleInputChange}
                />
              )}

              {/* Attributes Tab */}
              {activeTab === 'attributes' && (
                <ProductAttributesTab
                  formData={formData}
                  onInputChange={handleInputChange}
                  handleArrayInputChange={handleArrayInputChange}
                  handleObjectInputChange={handleObjectInputChange}
                  setFormData={setFormData}
                />
              )}

              {/* Media Tab */}
              {activeTab === 'media' && (
                <ProductMediaTab
                  formData={formData}
                  onInputChange={handleInputChange}
                />
              )}

              {/* Modifiers Tab */}
              {activeTab === 'modifiers' && (
                <ProductModifiersTab
                  formData={formData}
                  setFormData={setFormData}
                  isLoading={isLoading}
                  globalTemplates={globalTemplates}
                  showTemplatesBrowser={showTemplatesBrowser}
                  setShowTemplatesBrowser={setShowTemplatesBrowser}
                  applyGlobalTemplate={applyGlobalTemplate}
                />
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
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
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
