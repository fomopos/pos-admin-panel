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
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import { PageHeader, EnhancedTabs, Button, ConfirmDialog, Loading } from '../components/ui';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';
import { productService } from '../services/product';
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
    }
  });

  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

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
          const product = productService.mapApiProductToProduct(apiProduct);
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
    { id: 'media', name: 'Media', icon: PhotoIcon }
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
      <div className="p-6">
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
          >
            {/* Tab Content */}
            <div className="px-6 py-8">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter product name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  {/* UOM */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit of Measure <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="uom"
                      value={formData.uom || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.uom ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., lb, kg, each"
                    />
                    {errors.uom && <p className="mt-1 text-sm text-red-600">{errors.uom}</p>}
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter brand name"
                    />
                  </div>

                  {/* Tax Group */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Group
                    </label>
                    <select
                      name="tax_group"
                      value={formData.tax_group || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select tax group</option>
                      <option value="standard">Standard</option>
                      <option value="reduced">Reduced</option>
                      <option value="zero">Zero</option>
                      <option value="exempt">Exempt</option>
                    </select>
                  </div>

                  {/* Fiscal ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fiscal ID
                    </label>
                    <input
                      type="text"
                      name="fiscal_id"
                      value={formData.fiscal_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter fiscal ID"
                    />
                  </div>

                  {/* Stock Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Status
                    </label>
                    <select
                      name="stock_status"
                      value={formData.stock_status || 'in_stock'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="backorder">Backorder</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
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
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Pricing Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* List Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      List Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="pricing.list_price"
                        value={formData.pricing?.list_price || ''}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.list_price ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.list_price && <p className="mt-1 text-sm text-red-600">{errors.list_price}</p>}
                  </div>

                  {/* Sale Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sale Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="pricing.sale_price"
                        value={formData.pricing?.sale_price || ''}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Tare Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tare Value
                    </label>
                    <input
                      type="number"
                      name="pricing.tare_value"
                      value={formData.pricing?.tare_value || ''}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Tare UOM */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tare UOM
                    </label>
                    <input
                      type="text"
                      name="pricing.tare_uom"
                      value={formData.pricing?.tare_uom || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., oz, g"
                    />
                  </div>

                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type
                    </label>
                    <select
                      name="pricing.discount_type"
                      value={formData.pricing?.discount_type || 'percentage'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      name="pricing.discount_value"
                      value={formData.pricing?.discount_value || ''}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Min Discount Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Discount Value
                    </label>
                    <input
                      type="number"
                      name="pricing.min_discount_value"
                      value={formData.pricing?.min_discount_value || ''}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Max Discount Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Discount Value
                    </label>
                    <input
                      type="number"
                      name="pricing.max_discount_value"
                      value={formData.pricing?.max_discount_value || ''}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Product Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inventory Settings */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-800">Inventory Settings</h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.track_inventory"
                          checked={formData.settings?.track_inventory || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Track Inventory</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.allow_backorder"
                          checked={formData.settings?.allow_backorder || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow Backorder</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.require_serial"
                          checked={formData.settings?.require_serial || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Require Serial Number</span>
                      </label>
                    </div>
                  </div>

                  {/* Product Flags */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-800">Product Flags</h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.taxable"
                          checked={formData.settings?.taxable || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Taxable</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.measure_required"
                          checked={formData.settings?.measure_required || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Measure Required</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.non_inventoried"
                          checked={formData.settings?.non_inventoried || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Non-Inventoried</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.shippable"
                          checked={formData.settings?.shippable || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Shippable</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.active"
                          checked={formData.settings?.active || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.disallow_discount"
                          checked={formData.settings?.disallow_discount || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Disallow Discount</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.online_only"
                          checked={formData.settings?.online_only || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Online Only</span>
                      </label>
                    </div>
                  </div>

                  {/* Prompt Settings */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-800">Prompt Settings</h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="prompts.prompt_price"
                          checked={formData.prompts?.prompt_price || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Prompt for Price</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="prompts.prompt_qty"
                          checked={formData.prompts?.prompt_qty || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Prompt for Quantity</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="prompts.prompt_description"
                          checked={formData.prompts?.prompt_description || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Prompt for Description</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="prompts.prompt_uom"
                          checked={formData.prompts?.prompt_uom || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Prompt for UOM</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="prompts.prompt_cost"
                          checked={formData.prompts?.prompt_cost || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Prompt for Cost</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="prompts.prompt_serial"
                          checked={formData.prompts?.prompt_serial || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Prompt for Serial</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="prompts.prompt_lot"
                          checked={formData.prompts?.prompt_lot || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Prompt for Lot</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="prompts.prompt_expiry"
                          checked={formData.prompts?.prompt_expiry || false}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Prompt for Expiry</span>
                      </label>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Manufacturer
                        </label>
                        <input
                          type="text"
                          name="attributes.manufacturer"
                          value={formData.attributes?.manufacturer || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter manufacturer name"
                        />
                      </div>

                      {/* Model Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Model Number
                        </label>
                        <input
                          type="text"
                          name="attributes.model_number"
                          value={formData.attributes?.model_number || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter model number"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attributes Tab */}
            {activeTab === 'attributes' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Attributes & Properties</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="attributes.category_id"
                      value={formData.attributes?.category_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select category</option>
                      <option value="beverages">Beverages</option>
                      <option value="food">Food</option>
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing</option>
                      <option value="home">Home & Garden</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="media.image_url"
                    value={formData.media?.image_url || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
              className="flex items-center space-x-2"
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
