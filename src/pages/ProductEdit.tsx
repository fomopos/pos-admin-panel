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
import type { MultipleDropdownSearchOption } from '../components/ui/MultipleDropdownSearch';
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
import { ProductValidationRules, type ProductFormData } from '../utils/productValidation';
import { DEFAULT_UOM } from '../constants/uom';
import type { EnhancedCategory } from '../types/category';
import type { TaxGroup } from '../services/types/tax.types';
import type { 
  Product,
  ProductFormErrors
} from '../services/types/product.types';
import { useError } from '../hooks/useError';

const ProductEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { currentStore, currentTenant } = useTenantStore();
  const { showError, showSuccess, showValidationError } = useError();
  
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
      category_ids: [],
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
              category_ids: product.merch_level1 ? [product.merch_level1] : [], // Convert single category to array
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

  // Convert categories to MultipleDropdownSearchOption format
  const getCategoryDropdownOptions = (): MultipleDropdownSearchOption[] => {
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

  // Handle category selection (multiple categories)
  const handleCategorySelect = (selectedValues: string[]) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        category_ids: selectedValues
      }
    }));
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

  const validateField = (fieldName: string, value: any): void => {
    // Convert formData to ProductFormData format for validation
    const validationData: ProductFormData = {
      name: formData.name || '',
      description: formData.description,
      store_id: formData.store_id || '',
      uom: formData.uom || '',
      brand: formData.brand,
      tax_group: formData.tax_group,
      fiscal_id: formData.fiscal_id,
      stock_status: formData.stock_status,
      pricing: {
        list_price: formData.pricing?.list_price || 0,
        sale_price: formData.pricing?.sale_price,
        tare_value: formData.pricing?.tare_value,
        tare_uom: formData.pricing?.tare_uom,
        discount_type: formData.pricing?.discount_type,
        discount_value: formData.pricing?.discount_value,
        min_discount_value: formData.pricing?.min_discount_value,
        max_discount_value: formData.pricing?.max_discount_value
      },
      settings: formData.settings,
      prompts: formData.prompts,
      attributes: formData.attributes,
      media: formData.media,
      modifier_groups: formData.modifier_groups
    };

    const validation = ProductValidationRules.validateField(fieldName, value, validationData);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: validation.isValid ? undefined : validation.error
    }));
  };

  const validateForm = (): boolean => {
    // Convert formData to ProductFormData format for validation
    const validationData: ProductFormData = {
      name: formData.name || '',
      description: formData.description,
      store_id: formData.store_id || '',
      uom: formData.uom || '',
      brand: formData.brand,
      tax_group: formData.tax_group,
      fiscal_id: formData.fiscal_id,
      stock_status: formData.stock_status,
      pricing: {
        list_price: formData.pricing?.list_price || 0,
        sale_price: formData.pricing?.sale_price,
        tare_value: formData.pricing?.tare_value,
        tare_uom: formData.pricing?.tare_uom,
        discount_type: formData.pricing?.discount_type,
        discount_value: formData.pricing?.discount_value,
        min_discount_value: formData.pricing?.min_discount_value,
        max_discount_value: formData.pricing?.max_discount_value
      },
      settings: formData.settings,
      prompts: formData.prompts,
      attributes: formData.attributes,
      media: formData.media,
      modifier_groups: formData.modifier_groups
    };

    // Use the comprehensive validation system
    const { isValid, errors: validationErrors } = ProductValidationRules.validateForm(validationData);
    
    // Set errors state for form fields
    setErrors(validationErrors);
    
    // If there are errors, show global error feedback using error framework
    if (!isValid) {
      const errorMessages = Object.entries(validationErrors).map(([field, error]) => {
        // Convert field names to user-friendly names
        const fieldNames: Record<string, string> = {
          'name': 'Product Name',
          'store_id': 'Store',
          'uom': 'Unit of Measure',
          'pricing.list_price': 'List Price',
          'pricing.sale_price': 'Sale Price',
          'pricing.tare_value': 'Tare Value',
          'pricing.discount_value': 'Discount Value',
          'pricing.min_discount_value': 'Minimum Discount',
          'pricing.max_discount_value': 'Maximum Discount',
          'description': 'Description',
          'brand': 'Brand',
          'tax_group': 'Tax Group',
          'fiscal_id': 'Fiscal ID',
          'prompts.prompt_weight': 'Prompt Weight',
          'attributes.manufacturer': 'Manufacturer',
          'attributes.model_number': 'Model Number',
          'attributes.category_ids': 'Categories',
          'attributes.tags': 'Tags',
          'media.image_url': 'Image URL',
          'modifier_groups': 'Modifier Groups'
        };
        
        // Handle modifier field names dynamically
        let friendlyFieldName = fieldNames[field];
        if (!friendlyFieldName && field.startsWith('modifier_groups.')) {
          const fieldParts = field.split('.');
          if (fieldParts.length >= 3) {
            const groupIndex = parseInt(fieldParts[1]) + 1;
            const groupField = fieldParts[2];
            
            if (fieldParts.length >= 5) {
              // Modifier-specific field
              const modifierIndex = parseInt(fieldParts[3]) + 1;
              const modifierField = fieldParts[4];
              const modifierFieldNames: Record<string, string> = {
                'name': 'Name',
                'price_delta': 'Price Delta',
                'sort_order': 'Sort Order',
                'default_selected': 'Default Selected'
              };
              friendlyFieldName = `Modifier ${modifierIndex} ${modifierFieldNames[modifierField] || modifierField} (Group ${groupIndex})`;
            } else {
              // Group-specific field
              const groupFieldNames: Record<string, string> = {
                'name': 'Name',
                'selection_type': 'Selection Type',
                'exact_selections': 'Exact Selections',
                'max_selections': 'Max Selections',
                'min_selections': 'Min Selections',
                'sort_order': 'Sort Order',
                'price_delta': 'Price Delta',
                'required': 'Required'
              };
              friendlyFieldName = `Modifier Group ${groupIndex} ${groupFieldNames[groupField] || groupField}`;
            }
          }
        }
        
        friendlyFieldName = friendlyFieldName || field;
        return `${friendlyFieldName}: ${error}`;
      });
      
      showValidationError(
        `Please fix the following errors before saving the product: ${errorMessages.join('; ')}`,
        'product_form_validation',
        null,
        'required'
      );
    }

    return isValid;
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
        let newValue: any;
        if (type === 'checkbox') {
          newValue = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
          newValue = parseFloat(value) || 0;
        } else {
          newValue = value;
        }
        
        current[finalKey] = newValue;
        
        // Perform real-time validation for the field
        validateField(name, newValue);
        
        return updated;
      });
    } else {
      let newValue: any;
      if (type === 'checkbox') {
        newValue = (e.target as HTMLInputElement).checked;
      } else if (type === 'number') {
        newValue = parseFloat(value) || 0;
      } else {
        newValue = value;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
      
      // Perform real-time validation for the field
      validateField(name, newValue);
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
        
        // Perform real-time validation for array fields
        validateField(field, values);
        
        return updated;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: values
      }));
      
      // Perform real-time validation for array fields
      validateField(field, values);
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
        
        // Perform validation for nested object fields
        const fieldName = `${parent}.${key}`;
        validateField(fieldName, value);
        
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
      
      // Perform validation for object fields
      const fieldName = `${parent}.${key}`;
      validateField(fieldName, value);
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
          custom_attribute: {
            ...formData.attributes?.custom_attributes,
            // Store category_ids in custom attributes for now
            category_ids: formData.attributes?.category_ids || []
          },
          properties: formData.attributes?.properties,
          modifier_groups: formData.modifier_groups
        };
        await productService.updateProduct(
          currentTenant.id,
          currentStore.store_id,
          id,
          updateRequest
        );
        showSuccess(`Product "${formData.name}" updated successfully`);
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
          custom_attribute: {
            ...formData.attributes?.custom_attributes,
            // Store category_ids in custom attributes for now
            category_ids: formData.attributes?.category_ids || []
          },
          properties: formData.attributes?.properties,
          modifier_groups: formData.modifier_groups
        };
        await productService.createProduct(
          currentTenant.id,
          currentStore.store_id,
          createRequest
        );
        showSuccess(`Product "${formData.name}" created successfully`);
        console.log('Product created successfully');
      }
      
      navigate('/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      showError(
        error?.message || `Failed to ${isEditing ? 'update' : 'create'} product`
      );
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
        showSuccess(`Product "${productName}" deleted successfully`);
        console.log('Product deleted successfully');
        navigate('/products');
      } catch (error: any) {
        console.error('Error deleting product:', error);
        showError(error?.message || 'Failed to delete product');
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleBack = () => {
    navigate('/products');
  };

  // Helper function to check if a tab has errors
  const getTabErrorStatus = (tabId: string): boolean => {
    const errorFields = Object.keys(errors);
    
    switch (tabId) {
      case 'basic':
        return ['name', 'description', 'uom', 'brand', 'tax_group', 'fiscal_id', 'stock_status'].some(field => errorFields.includes(field));
      case 'pricing':
        return ['pricing.list_price', 'pricing.sale_price', 'pricing.tare_value', 'pricing.tare_uom', 'pricing.discount_type', 'pricing.discount_value', 'pricing.min_discount_value', 'pricing.max_discount_value'].some(field => errorFields.includes(field));
      case 'settings':
        return ['settings.track_inventory', 'settings.allow_backorder', 'settings.require_serial', 'settings.taxable', 'settings.measure_required', 'settings.non_inventoried', 'settings.shippable', 'settings.serialized', 'settings.active', 'settings.disallow_discount', 'settings.online_only'].some(field => errorFields.includes(field));
      case 'attributes':
        return ['attributes.manufacturer', 'attributes.model_number', 'attributes.category_ids', 'attributes.tags'].some(field => errorFields.includes(field));
      case 'media':
        return ['media.images', 'media.image_url'].some(field => errorFields.includes(field));
      case 'modifiers':
        // Check for general modifier_groups errors and specific modifier field errors
        return ['modifier_groups', 'global_modifier_groups'].some(field => errorFields.includes(field)) ||
               errorFields.some(field => field.startsWith('modifier_groups.'));
      default:
        return false;
    }
  };

  const tabs = [
    { 
      id: 'basic', 
      name: 'Basic Info', 
      icon: ClipboardDocumentListIcon,
      hasError: getTabErrorStatus('basic')
    },
    { 
      id: 'pricing', 
      name: 'Pricing', 
      icon: CurrencyDollarIcon,
      hasError: getTabErrorStatus('pricing')
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: CogIcon,
      hasError: getTabErrorStatus('settings')
    },
    { 
      id: 'attributes', 
      name: 'Attributes', 
      icon: TagIcon,
      hasError: getTabErrorStatus('attributes')
    },
    { 
      id: 'media', 
      name: 'Media', 
      icon: PhotoIcon,
      hasError: getTabErrorStatus('media')
    },
    { 
      id: 'modifiers', 
      name: 'Modifiers', 
      icon: CubeIcon,
      hasError: getTabErrorStatus('modifiers')
    }
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
          
          <Button
            type="submit"
            form="product-form"
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
      </PageHeader>

      {/* Main Content */}
      <div>
        <form id="product-form" onSubmit={handleSubmit}>
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
                  errors={errors}
                  isLoading={isLoading}
                  globalTemplates={globalTemplates}
                  showTemplatesBrowser={showTemplatesBrowser}
                  setShowTemplatesBrowser={setShowTemplatesBrowser}
                  applyGlobalTemplate={applyGlobalTemplate}
                  onValidateField={validateField}
                />
              )}
            </div>
          </EnhancedTabs>
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
