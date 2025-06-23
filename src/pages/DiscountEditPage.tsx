import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  TagIcon,
  CalendarIcon,
  CogIcon,
  SparklesIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { discountApiService } from '../services/discount/discountApiService';
import { PageHeader, Button, DropdownSearch, Alert, Loading, Card, PropertyCheckbox } from '../components/ui';
import { InputTextField, InputMoneyField } from '../components/ui';
import type { Discount, CreateDiscountRequest } from '../types/discount';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';
import useTenantStore from '../tenants/tenantStore';
import { useDeleteConfirmDialog, useDiscardChangesDialog } from '../hooks/useConfirmDialog';

// Discount templates for quick setup
const DISCOUNT_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Discount',
    description: '10% off for new customers',
    typcode: 'PERCENT',
    percentage: 10,
    app_mthd_code: 'AUTO',
    calculation_mthd_code: 'BEFORE_TAX',
    exclusive_discount_flag: 1,
    color: '#10B981',
    icon: '👋'
  },
  {
    id: 'seasonal',
    name: 'Seasonal Sale',
    description: '$25 off summer collection',
    typcode: 'AMOUNT',
    discount: 25,
    app_mthd_code: 'AUTO',
    calculation_mthd_code: 'BEFORE_TAX',
    min_eligible_price: 100,
    color: '#F59E0B',
    icon: '🌞'
  },
  {
    id: 'loyalty',
    name: 'Loyalty Reward',
    description: '15% off for returning customers',
    typcode: 'PERCENT',
    percentage: 15,
    app_mthd_code: 'MANUAL',
    calculation_mthd_code: 'BEFORE_TAX',
    max_trans_count: 3,
    color: '#8B5CF6',
    icon: '💎'
  },
  {
    id: 'clearance',
    name: 'Clearance Sale',
    description: '30% off selected items',
    typcode: 'PERCENT',
    percentage: 30,
    app_mthd_code: 'AUTO',
    calculation_mthd_code: 'BEFORE_TAX',
    max_percentage: 30,
    color: '#EF4444',
    icon: '🔥'
  },
  {
    id: 'bulk',
    name: 'Bulk Purchase',
    description: '$50 off orders over $500',
    typcode: 'AMOUNT',
    discount: 50,
    app_mthd_code: 'AUTO',
    calculation_mthd_code: 'BEFORE_TAX',
    min_eligible_price: 500,
    color: '#06B6D4',
    icon: '📦'
  },
  {
    id: 'flash',
    name: 'Flash Sale',
    description: '20% off limited time offer',
    typcode: 'PERCENT',
    percentage: 20,
    app_mthd_code: 'AUTO',
    calculation_mthd_code: 'BEFORE_TAX',
    exclusive_discount_flag: 1,
    color: '#EC4899',
    icon: '⚡'
  }
];

interface DiscountWidget {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  content: React.ReactNode;
}

const DiscountEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  
  const isEditing = Boolean(id);
  const [originalDiscount, setOriginalDiscount] = useState<Discount | null>(null);
  
  const [formData, setFormData] = useState<CreateDiscountRequest>({
    discount_code: '',
    description: '',
    typcode: 'PERCENT',
    app_mthd_code: 'AUTO',
    calculation_mthd_code: 'BEFORE_TAX',
    percentage: null,
    discount: null,
    effective_datetime: new Date().toISOString().slice(0, -1),
    expr_datetime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, -1),
    prompt: '',
    sort_order: 1,
    min_eligible_price: null,
    max_discount: null,
    max_amount: null,
    max_trans_count: null,
    max_percentage: null,
    exclusive_discount_flag: 0,
    serialized_discount_flag: 0,
    disallow_change_flag: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [showTemplates, setShowTemplates] = useState(!isEditing);

  // Dialog hooks
  const deleteDialog = useDeleteConfirmDialog();
  const discardDialog = useDiscardChangesDialog();

  // Dropdown options
  const discountTypeOptions: DropdownSearchOption[] = [
    { id: 'PERCENT', label: 'Percentage', description: 'Discount as a percentage of the total' },
    { id: 'AMOUNT', label: 'Fixed Amount', description: 'Discount as a fixed dollar amount' }
  ];

  const applicationMethodOptions: DropdownSearchOption[] = [
    { id: 'AUTO', label: 'Automatic', description: 'Automatically applied when conditions are met' },
    { id: 'MANUAL', label: 'Manual', description: 'Requires manual application by staff' }
  ];

  const calculationMethodOptions: DropdownSearchOption[] = [
    { id: 'BEFORE_TAX', label: 'Before Tax', description: 'Apply discount before tax calculation' },
    { id: 'AFTER_TAX', label: 'After Tax', description: 'Apply discount after tax calculation' }
  ];

  useEffect(() => {
    if (isEditing && id) {
      loadDiscount();
    }
  }, [id, isEditing]);

  const loadDiscount = async () => {
    if (!id || !currentTenant?.id || !currentStore?.store_id) return;

    try {
      setIsLoading(true);
      setFetchError(null);
      const discountData = await discountApiService.getDiscountById(
        currentTenant.id,
        currentStore.store_id,
        id
      );
      setOriginalDiscount(discountData);
      
      // Map discount data to form data
      setFormData({
        discount_code: discountData.discount_code,
        description: discountData.description,
        typcode: discountData.typcode,
        app_mthd_code: discountData.app_mthd_code,
        calculation_mthd_code: discountData.calculation_mthd_code,
        percentage: discountData.percentage,
        discount: discountData.discount,
        effective_datetime: discountData.effective_datetime.slice(0, -1), // Remove Z for datetime-local input
        expr_datetime: discountData.expr_datetime.slice(0, -1),
        prompt: discountData.prompt,
        sort_order: discountData.sort_order,
        min_eligible_price: discountData.min_eligible_price,
        max_discount: discountData.max_discount,
        max_amount: discountData.max_amount,
        max_trans_count: discountData.max_trans_count,
        max_percentage: discountData.max_percentage,
        exclusive_discount_flag: discountData.exclusive_discount_flag,
        serialized_discount_flag: discountData.serialized_discount_flag,
        disallow_change_flag: discountData.disallow_change_flag,
      });
    } catch (error) {
      console.error('Failed to load discount:', error);
      setFetchError('Failed to load discount. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateDiscountRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
    setSuccessMessage(null);
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const applyTemplate = (template: any) => {
    const now = new Date();
    const startDate = new Date(now.getTime());
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    setFormData(prev => ({
      ...prev,
      discount_code: template.name.toUpperCase().replace(/\s+/g, ''),
      description: template.description,
      typcode: template.typcode,
      app_mthd_code: template.app_mthd_code,
      calculation_mthd_code: template.calculation_mthd_code,
      percentage: template.percentage || null,
      discount: template.discount || null,
      min_eligible_price: template.min_eligible_price || null,
      max_trans_count: template.max_trans_count || null,
      exclusive_discount_flag: template.exclusive_discount_flag || 0,
      max_percentage: template.max_percentage || null,
      effective_datetime: startDate.toISOString().slice(0, -1),
      expr_datetime: endDate.toISOString().slice(0, -1),
      prompt: `${template.name} applied successfully!`,
    }));
    setShowTemplates(false);
    setHasChanges(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.discount_code.trim()) {
      newErrors.discount_code = 'Discount code is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.typcode === 'PERCENT' && (!formData.percentage || formData.percentage <= 0)) {
      newErrors.percentage = 'Percentage must be greater than 0';
    }

    if (formData.typcode === 'AMOUNT' && (!formData.discount || formData.discount <= 0)) {
      newErrors.discount = 'Discount amount must be greater than 0';
    }

    if (new Date(formData.effective_datetime) >= new Date(formData.expr_datetime)) {
      newErrors.expr_datetime = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDelete = async () => {
    if (!originalDiscount) return;

    deleteDialog.openDeleteDialog(
      originalDiscount.discount_code,
      async () => {
        await discountApiService.deleteDiscount(
          originalDiscount.tenant_id, 
          originalDiscount.store_id, 
          originalDiscount.discount_id
        );
        navigate('/discounts');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!currentTenant?.id || !currentStore?.store_id) return;

    try {
      setIsSaving(true);
      setErrors({});
      
      // Format datetime strings for API
      const submitData = {
        ...formData,
        effective_datetime: formData.effective_datetime + 'Z',
        expr_datetime: formData.expr_datetime + 'Z',
      };

      if (isEditing && id) {
        await discountApiService.updateDiscount(
          currentTenant.id,
          currentStore.store_id,
          id,
          submitData
        );
        setSuccessMessage('Discount updated successfully!');
      } else {
        await discountApiService.createDiscount(
          currentTenant.id,
          currentStore.store_id,
          submitData
        );
        setSuccessMessage('Discount created successfully!');
      }

      setHasChanges(false);
      setTimeout(() => navigate('/discounts'), 2000);
    } catch (error) {
      console.error('Failed to save discount:', error);
      setErrors({ general: 'Failed to save discount. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (hasChanges) {
      discardDialog.openDiscardDialog(() => {
        if (isEditing && originalDiscount) {
          setFormData({
            discount_code: originalDiscount.discount_code,
            description: originalDiscount.description,
            typcode: originalDiscount.typcode,
            app_mthd_code: originalDiscount.app_mthd_code,
            calculation_mthd_code: originalDiscount.calculation_mthd_code,
            percentage: originalDiscount.percentage,
            discount: originalDiscount.discount,
            effective_datetime: originalDiscount.effective_datetime.slice(0, -1),
            expr_datetime: originalDiscount.expr_datetime.slice(0, -1),
            prompt: originalDiscount.prompt,
            sort_order: originalDiscount.sort_order,
            min_eligible_price: originalDiscount.min_eligible_price,
            max_discount: originalDiscount.max_discount,
            max_amount: originalDiscount.max_amount,
            max_trans_count: originalDiscount.max_trans_count,
            max_percentage: originalDiscount.max_percentage,
            exclusive_discount_flag: originalDiscount.exclusive_discount_flag,
            serialized_discount_flag: originalDiscount.serialized_discount_flag,
            disallow_change_flag: originalDiscount.disallow_change_flag,
          });
        } else {
          navigate('/discounts');
        }
        setHasChanges(false);
        setErrors({});
        setSuccessMessage(null);
      });
    } else {
      navigate('/discounts');
    }
  };

  // Define widgets like in CategoryEditPage
  const widgets: DiscountWidget[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: TagIcon,
      description: 'Configure discount name, type, and value',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputTextField
              label="Discount Code"
              value={formData.discount_code}
              onChange={(value) => handleInputChange('discount_code', value)}
              placeholder="e.g., WELCOME10"
              error={errors.discount_code}
              required
            />

            <DropdownSearch
              label="Discount Type"
              value={formData.typcode}
              placeholder="Select discount type"
              options={discountTypeOptions}
              onSelect={(option) => handleInputChange('typcode', option?.id as 'PERCENT' | 'AMOUNT' || 'PERCENT')}
              error={errors.typcode}
              required
            />

            {formData.typcode === 'PERCENT' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.percentage || ''}
                  onChange={(e) => handleInputChange('percentage', e.target.value ? parseFloat(e.target.value) : null)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.percentage ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="10.00"
                />
                {errors.percentage && (
                  <p className="mt-1 text-sm text-red-600">{errors.percentage}</p>
                )}
              </div>
            ) : (
              <InputMoneyField
                label="Discount Amount"
                value={formData.discount || 0}
                onChange={(value) => handleInputChange('discount', value)}
                placeholder="25.00"
                error={errors.discount}
              />
            )}

            <DropdownSearch
              label="Application Method"
              value={formData.app_mthd_code}
              placeholder="Select application method"
              options={applicationMethodOptions}
              onSelect={(option) => handleInputChange('app_mthd_code', option?.id as 'AUTO' | 'MANUAL' || 'AUTO')}
              error={errors.app_mthd_code}
              required
            />
          </div>

          <InputTextField
            label="Description"
            value={formData.description}
            onChange={(value) => handleInputChange('description', value)}
            placeholder="Describe this discount"
            error={errors.description}
            required
          />

          <InputTextField
            label="Prompt Message"
            value={formData.prompt}
            onChange={(value) => handleInputChange('prompt', value)}
            placeholder="Message shown when discount is applied"
            error={errors.prompt}
          />
        </div>
      )
    },
    {
      id: 'schedule',
      title: 'Date & Time Range',
      icon: CalendarIcon,
      description: 'Set when this discount is active',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.effective_datetime}
              onChange={(e) => handleInputChange('effective_datetime', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.effective_datetime ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.effective_datetime && (
              <p className="mt-1 text-sm text-red-600">{errors.effective_datetime}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.expr_datetime}
              onChange={(e) => handleInputChange('expr_datetime', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.expr_datetime ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.expr_datetime && (
              <p className="mt-1 text-sm text-red-600">{errors.expr_datetime}</p>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'advanced',
      title: 'Advanced Settings',
      icon: CogIcon,
      description: 'Configure limits, thresholds, and calculation methods',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DropdownSearch
              label="Calculation Method"
              value={formData.calculation_mthd_code}
              placeholder="Select calculation method"
              options={calculationMethodOptions}
              onSelect={(option) => handleInputChange('calculation_mthd_code', option?.id as 'BEFORE_TAX' | 'AFTER_TAX' || 'BEFORE_TAX')}
              error={errors.calculation_mthd_code}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                min="1"
                value={formData.sort_order}
                onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <InputMoneyField
              label="Minimum Eligible Price"
              value={formData.min_eligible_price || 0}
              onChange={(value) => handleInputChange('min_eligible_price', value || null)}
              placeholder="0.00"
            />

            <InputMoneyField
              label="Maximum Discount Amount"
              value={formData.max_discount || 0}
              onChange={(value) => handleInputChange('max_discount', value || null)}
              placeholder="0.00"
            />

            <InputMoneyField
              label="Maximum Amount"
              value={formData.max_amount || 0}
              onChange={(value) => handleInputChange('max_amount', value || null)}
              placeholder="0.00"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Transaction Count
              </label>
              <input
                type="number"
                min="0"
                value={formData.max_trans_count || ''}
                onChange={(e) => handleInputChange('max_trans_count', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Unlimited"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.max_percentage || ''}
                onChange={(e) => handleInputChange('max_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="No limit"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'flags',
      title: 'Flags & Options',
      icon: SparklesIcon,
      description: 'Additional discount behavior settings',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <PropertyCheckbox
            title="Exclusive Discount"
            description="Cannot be combined with other discounts"
            checked={formData.exclusive_discount_flag === 1}
            onChange={(checked) => handleInputChange('exclusive_discount_flag', checked ? 1 : 0)}
          />

          <PropertyCheckbox
            title="Serialized Discount"
            description="Track usage with unique serial numbers"
            checked={formData.serialized_discount_flag === 1}
            onChange={(checked) => handleInputChange('serialized_discount_flag', checked ? 1 : 0)}
          />

          <PropertyCheckbox
            title="Disallow Changes"
            description="Discount cannot be modified after application"
            checked={formData.disallow_change_flag === 1}
            onChange={(checked) => handleInputChange('disallow_change_flag', checked ? 1 : 0)}
          />
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title={isEditing ? `Edit Discount: ${originalDiscount?.discount_code}` : 'Create New Discount'}
            description={isEditing ? 'Update discount details' : 'Add a new discount to your store'}
          >
            <Button
              variant="outline"
              onClick={() => navigate('/discounts')}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Discounts
            </Button>
          </PageHeader>
        </div>
      </div>

      {/* Template Selection (for new discounts) */}
      {showTemplates && !isEditing && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Choose a Template</h2>
              <p className="text-sm text-gray-600">Start with a pre-configured discount template or create from scratch</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {DISCOUNT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{template.icon}</span>
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowTemplates(false)}
              className="text-sm"
            >
              Skip Templates - Create from Scratch
            </Button>
          </div>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {hasChanges && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">You have unsaved changes</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDiscardChanges}
                >
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" className="max-w-7xl mx-auto my-4">
          {successMessage}
        </Alert>
      )}

      {/* Error Messages */}
      {fetchError && (
        <Alert variant="error" className="max-w-7xl mx-auto my-4">
          {fetchError}
        </Alert>
      )}

      {errors.general && (
        <Alert variant="error" className="max-w-7xl mx-auto my-4">
          {errors.general}
        </Alert>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Widgets */}
          {widgets.map((widget) => (
            <Card key={widget.id} className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <widget.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
                  <p className="text-sm text-gray-600">{widget.description}</p>
                </div>
              </div>
              {widget.content}
            </Card>
          ))}

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  className="text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete Discount
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleDiscardChanges}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? 'Saving...' : (isEditing ? 'Update Discount' : 'Create Discount')}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Confirm Dialogs */}
      {deleteDialog.dialogState.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {deleteDialog.dialogState.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {deleteDialog.dialogState.message}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={deleteDialog.closeDialog}
              >
                Cancel
              </Button>
              <Button
                onClick={deleteDialog.handleConfirm}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteDialog.dialogState.isLoading}
              >
                {deleteDialog.dialogState.isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {discardDialog.dialogState.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {discardDialog.dialogState.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {discardDialog.dialogState.message}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={discardDialog.closeDialog}
              >
                Cancel
              </Button>
              <Button
                onClick={discardDialog.handleConfirm}
                className="bg-orange-600 hover:bg-orange-700"
                disabled={discardDialog.dialogState.isLoading}
              >
                {discardDialog.dialogState.isLoading ? 'Discarding...' : 'Discard Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountEditPage;
