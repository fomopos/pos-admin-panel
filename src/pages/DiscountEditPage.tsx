import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CogIcon,
  SparklesIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  InformationCircleIcon,
  PercentBadgeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { discountApiService } from '../services/discount/discountApiService';
import { PageHeader, Button, DropdownSearch, Alert, Loading, PropertyCheckbox, ConfirmDialog, Widget } from '../components/ui';
import { InputTextField, InputMoneyField } from '../components/ui';
import type { Discount, CreateDiscountRequest } from '../types/discount';
import type { DropdownSearchOption } from '../components/ui/DropdownSearch';
import useTenantStore from '../tenants/tenantStore';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';
import { useError } from '../hooks/useError';

// Discount templates for quick setup
const DISCOUNT_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Discount',
    description: '10% off for new customers',
    typcode: 'DISCOUNT',
    calculation_mthd_code: 'PERCENT',
    percentage: 10,
    app_mthd_code: 'TRANSACTION',
    exclusive_discount_flag: 1,
    color: '#10B981',
    icon: '👋'
  },
  {
    id: 'seasonal',
    name: 'Seasonal Sale',
    description: '$25 off summer collection',
    typcode: 'VOUCHER',
    calculation_mthd_code: 'AMOUNT',
    discount: 25,
    app_mthd_code: 'TRANSACTION',
    min_eligible_price: 100,
    color: '#F59E0B',
    icon: '🌞'
  },
  {
    id: 'loyalty',
    name: 'Loyalty Reward',
    description: '15% off for returning customers',
    typcode: 'COUPON',
    calculation_mthd_code: 'PERCENT',
    percentage: 15,
    app_mthd_code: 'LINE_ITEM',
    max_trans_count: 3,
    color: '#8B5CF6',
    icon: '💎'
  },
  {
    id: 'clearance',
    name: 'Clearance Sale',
    description: '30% off selected items',
    typcode: 'DISCOUNT',
    calculation_mthd_code: 'PERCENT',
    percentage: 30,
    app_mthd_code: 'GROUP',
    max_percentage: 30,
    color: '#EF4444',
    icon: '🔥'
  },
  {
    id: 'bulk',
    name: 'Bulk Purchase',
    description: '$50 off orders over $500',
    typcode: 'VOUCHER',
    calculation_mthd_code: 'AMOUNT',
    discount: 50,
    app_mthd_code: 'TRANSACTION',
    min_eligible_price: 500,
    color: '#06B6D4',
    icon: '📦'
  },
  {
    id: 'flash',
    name: 'Flash Sale',
    description: '20% off limited time offer',
    typcode: 'COUPON',
    calculation_mthd_code: 'PERCENT',
    percentage: 20,
    app_mthd_code: 'TRANSACTION',
    exclusive_discount_flag: 1,
    color: '#EC4899',
    icon: '⚡'
  }
];

const DiscountEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();

  const isEditing = Boolean(id);
  const [originalDiscount, setOriginalDiscount] = useState<Discount | null>(null);

  const [formData, setFormData] = useState<CreateDiscountRequest>({
    discount_code: '',
    description: '',
    typcode: 'DISCOUNT',
    app_mthd_code: 'TRANSACTION',
    calculation_mthd_code: 'PERCENT',
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

  const [showTemplates, setShowTemplates] = useState(!isEditing);

  // Error handling hooks
  const { showError, showSuccess, showValidationError } = useError();

  // Dialog hooks
  const deleteDialog = useDeleteConfirmDialog();

  // Dropdown options
  const discountTypeOptions: DropdownSearchOption[] = [
    { id: 'DISCOUNT', label: 'Discount', description: 'Standard discount applied to items' },
    { id: 'VOUCHER', label: 'Voucher', description: 'Voucher-based discount or credit' },
    { id: 'COUPON', label: 'Coupon', description: 'Coupon code discount' }
  ];

  const applicationMethodOptions: DropdownSearchOption[] = [
    { id: 'LINE_ITEM', label: 'Line Item', description: 'Applied to individual line items' },
    { id: 'TRANSACTION', label: 'Transaction', description: 'Applied to the entire transaction' },
    { id: 'GROUP', label: 'Group', description: 'Applied to a group of items' }
  ];

  const calculationMethodOptions: DropdownSearchOption[] = [
    { id: 'PERCENT', label: 'Percentage', description: 'Calculate discount as a percentage' },
    { id: 'AMOUNT', label: 'Fixed Amount', description: 'Calculate discount as a fixed amount' },
    { id: 'PROMPT_PERCENT', label: 'Prompt Percentage', description: 'Prompt user for percentage amount' },
    { id: 'PROMPT_AMOUNT', label: 'Prompt Amount', description: 'Prompt user for fixed amount' }
  ];

  useEffect(() => {
    if (isEditing && id) {
      loadDiscount();
    }
  }, [id, isEditing]);

  // Check for changes to enable/disable save button
  useEffect(() => {
    if (!isEditing) {
      // For new discounts, check if any required fields are filled
      const hasData = formData.discount_code.trim() !== '' ||
        formData.description.trim() !== '';
      setHasChanges(hasData);
    } else if (originalDiscount) {
      // For editing, check if any values have changed from original
      const hasChanged =
        formData.discount_code !== originalDiscount.discount_code ||
        formData.description !== originalDiscount.description ||
        formData.typcode !== originalDiscount.typcode ||
        formData.app_mthd_code !== originalDiscount.app_mthd_code ||
        formData.calculation_mthd_code !== originalDiscount.calculation_mthd_code ||
        formData.percentage !== originalDiscount.percentage ||
        formData.discount !== originalDiscount.discount ||
        formData.effective_datetime !== originalDiscount.effective_datetime.slice(0, -1) ||
        formData.expr_datetime !== originalDiscount.expr_datetime.slice(0, -1) ||
        formData.prompt !== originalDiscount.prompt ||
        formData.sort_order !== originalDiscount.sort_order ||
        formData.min_eligible_price !== originalDiscount.min_eligible_price ||
        formData.max_discount !== originalDiscount.max_discount ||
        formData.max_amount !== originalDiscount.max_amount ||
        formData.max_trans_count !== originalDiscount.max_trans_count ||
        formData.max_percentage !== originalDiscount.max_percentage ||
        formData.exclusive_discount_flag !== originalDiscount.exclusive_discount_flag ||
        formData.serialized_discount_flag !== originalDiscount.serialized_discount_flag ||
        formData.disallow_change_flag !== originalDiscount.disallow_change_flag;

      setHasChanges(hasChanged);
    }
  }, [formData, originalDiscount, isEditing]);

  const loadDiscount = async () => {
    if (!id || !currentTenant?.id || !currentStore?.store_id) {
      showError('Missing required information to load discount');
      return;
    }

    try {
      setIsLoading(true);
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
    } catch (error: any) {
      console.error('Failed to load discount:', error);
      showError(error?.message || 'Failed to load discount. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateDiscountRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
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

    // Required field validations
    if (!formData.discount_code.trim()) {
      newErrors.discount_code = 'Discount code is required';
    } else if (formData.discount_code.length > 50) {
      newErrors.discount_code = 'Discount code must be less than 50 characters';
    } else if (!/^[A-Z0-9_-]+$/i.test(formData.discount_code)) {
      newErrors.discount_code = 'Discount code can only contain letters, numbers, hyphens, and underscores';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 255) {
      newErrors.description = 'Description must be less than 255 characters';
    }

    // Calculation method specific validations
    if (formData.calculation_mthd_code === 'PERCENT' || formData.calculation_mthd_code === 'PROMPT_PERCENT') {
      if (!formData.percentage || formData.percentage <= 0) {
        newErrors.percentage = 'Percentage must be greater than 0';
      } else if (formData.percentage > 100) {
        newErrors.percentage = 'Percentage cannot exceed 100%';
      }
    }

    if (formData.calculation_mthd_code === 'AMOUNT' || formData.calculation_mthd_code === 'PROMPT_AMOUNT') {
      if (!formData.discount || formData.discount <= 0) {
        newErrors.discount = 'Discount amount must be greater than 0';
      } else if (formData.discount > 999999) {
        newErrors.discount = 'Discount amount is too large';
      }
    }

    // Date validations
    const startDate = new Date(formData.effective_datetime);
    const endDate = new Date(formData.expr_datetime);

    if (isNaN(startDate.getTime())) {
      newErrors.effective_datetime = 'Start date is invalid';
    }

    if (isNaN(endDate.getTime())) {
      newErrors.expr_datetime = 'End date is invalid';
    }

    if (startDate >= endDate) {
      newErrors.expr_datetime = 'End date must be after start date';
    }

    // Business logic validations
    if (formData.min_eligible_price && formData.min_eligible_price < 0) {
      newErrors.min_eligible_price = 'Minimum eligible price cannot be negative';
    }

    if (formData.max_discount && formData.max_discount < 0) {
      newErrors.max_discount = 'Maximum discount cannot be negative';
    }

    if (formData.max_amount && formData.max_amount < 0) {
      newErrors.max_amount = 'Maximum amount cannot be negative';
    }

    if (formData.max_trans_count && formData.max_trans_count < 1) {
      newErrors.max_trans_count = 'Maximum transaction count must be at least 1';
    }

    if (formData.max_percentage && (formData.max_percentage < 0 || formData.max_percentage > 100)) {
      newErrors.max_percentage = 'Maximum percentage must be between 0 and 100';
    }

    if (formData.sort_order < 0) {
      newErrors.sort_order = 'Sort order cannot be negative';
    }

    // Cross-field validations
    if (formData.min_eligible_price && formData.max_discount &&
      formData.calculation_mthd_code === 'AMOUNT' &&
      formData.max_discount > formData.min_eligible_price) {
      newErrors.max_discount = 'Maximum discount cannot exceed minimum eligible price';
    }

    setErrors(newErrors);

    // If there are errors, show global error feedback using error framework
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors);
      showValidationError(
        `Please fix the following errors before saving the discount: ${errorMessages.slice(0, 3).join(', ')}${errorMessages.length > 3 ? '...' : ''}`,
        'form_validation',
        null,
        'required'
      );
    }

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

    if (!currentTenant?.id || !currentStore?.store_id) {
      showError('Missing tenant or store information');
      return;
    }

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
        showSuccess('Discount updated successfully!');
        setHasChanges(false);
      } else {
        await discountApiService.createDiscount(
          currentTenant.id,
          currentStore.store_id,
          submitData
        );
        showSuccess('Discount created successfully!');
        setHasChanges(false);
        setTimeout(() => navigate('/discounts'), 1500);
      }
    } catch (error: any) {
      console.error('Failed to save discount:', error);

      // Use error framework for API error display
      showError(error?.message || 'Failed to save discount. Please try again.');

      // Also set local error for backward compatibility
      setErrors({ submit: error.message || 'Failed to save discount. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const saveAllChanges = () => {
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Loading
        title="Loading Discount"
        description="Please wait while we fetch the discount data..."
        variant="primary"
      />
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <PageHeader
        title={isEditing ? 'Edit Discount' : 'Create Discount'}
        description={isEditing ? 'Modify discount details and settings' : 'Create a new discount for your store'}
      >
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/discounts')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Discounts</span>
          </Button>

          {hasChanges && (
            <Button
              onClick={saveAllChanges}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="h-4 w-4" />
                  <span>{isEditing ? 'Update Discount' : 'Create Discount'}</span>
                </>
              )}
            </Button>
          )}

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
      </PageHeader>

      {/* Template Selection for New Discounts */}
      {showTemplates && !isEditing && (
        <Widget
          title="Discount Templates"
          description="Choose a template to get started quickly, or skip to create from scratch"
          icon={SparklesIcon}
          variant="primary"
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
            {DISCOUNT_TEMPLATES.map((template) => (
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
                    {template.icon}
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
                        <PercentBadgeIcon className="h-3 w-3 mr-1" />
                        {template.typcode}
                      </span>
                      <span className="flex items-center">
                        {template.calculation_mthd_code}
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
        </Widget>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {/* Basic Information Widget */}
          <Widget
            title="Basic Information"
            description="Essential discount details and configuration"
            icon={InformationCircleIcon}
            className="lg:col-span-2 overflow-visible"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField
                label="Discount Code"
                required
                value={formData.discount_code}
                onChange={(value) => handleInputChange('discount_code', value)}
                placeholder="e.g., WELCOME10"
                error={errors.discount_code}
                colSpan="md:col-span-2"
              />

              <DropdownSearch
                label="Discount Type"
                value={formData.typcode}
                placeholder="Select discount type"
                options={discountTypeOptions}
                onSelect={(option) => handleInputChange('typcode', option?.id as 'DISCOUNT' | 'VOUCHER' | 'COUPON' || 'DISCOUNT')}
                error={errors.typcode}
                required
              />

              <DropdownSearch
                label="Calculation Method"
                value={formData.calculation_mthd_code}
                placeholder="Select calculation method"
                options={calculationMethodOptions}
                onSelect={(option) => handleInputChange('calculation_mthd_code', option?.id as 'PERCENT' | 'AMOUNT' | 'PROMPT_PERCENT' | 'PROMPT_AMOUNT' || 'PERCENT')}
                error={errors.calculation_mthd_code}
                required
              />

              {(formData.calculation_mthd_code === 'PERCENT' || formData.calculation_mthd_code === 'PROMPT_PERCENT') ? (
                <InputTextField
                  label="Percentage (%)"
                  type="number"
                  value={formData.percentage || ''}
                  onChange={(value) => handleInputChange('percentage', value ? parseFloat(value) : null)}
                  placeholder="10.00"
                  error={errors.percentage}
                  min={0}
                  max={100}
                  step={0.01}
                />
              ) : (formData.calculation_mthd_code === 'AMOUNT' || formData.calculation_mthd_code === 'PROMPT_AMOUNT') ? (
                <InputMoneyField
                  label="Discount Amount"
                  value={formData.discount || 0}
                  onChange={(value) => handleInputChange('discount', value ? parseFloat(value) : null)}
                  placeholder="25.00"
                  error={errors.discount}
                />
              ) : null}

              <DropdownSearch
                label="Application Method"
                value={formData.app_mthd_code}
                placeholder="Select application method"
                options={applicationMethodOptions}
                onSelect={(option) => handleInputChange('app_mthd_code', option?.id as 'LINE_ITEM' | 'TRANSACTION' | 'GROUP' || 'TRANSACTION')}
                error={errors.app_mthd_code}
                required
              />
            </div>

            <div className="mt-6">
              <InputTextField
                label="Description"
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                placeholder="Describe this discount"
                error={errors.description}
                required
              />
            </div>

            <div className="mt-6">
              <InputTextField
                label="Prompt Message"
                value={formData.prompt}
                onChange={(value) => handleInputChange('prompt', value)}
                placeholder="Message shown when discount is applied"
                error={errors.prompt}
              />
            </div>
          </Widget>

          {/* Schedule Widget */}
          <Widget
            title="Schedule"
            description="Set when this discount is active"
            icon={CalendarIcon}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.effective_datetime}
                  onChange={(e) => handleInputChange('effective_datetime', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.effective_datetime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  required
                />
                {errors.effective_datetime && (
                  <p className="mt-1 text-sm text-red-600">{errors.effective_datetime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.expr_datetime}
                  onChange={(e) => handleInputChange('expr_datetime', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.expr_datetime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  required
                />
                {errors.expr_datetime && (
                  <p className="mt-1 text-sm text-red-600">{errors.expr_datetime}</p>
                )}
              </div>
            </div>
          </Widget>

          {/* Advanced Settings Widget */}
          <Widget
            title="Advanced Settings"
            description="Configure limits, thresholds, and calculation methods"
            icon={CogIcon}
          >
            <div className="space-y-6">
              <InputTextField
                label="Sort Order"
                type="number"
                value={formData.sort_order}
                onChange={(value) => handleInputChange('sort_order', parseInt(value) || 1)}
                placeholder="1"
                helperText="Lower numbers appear first in the discount list"
                min={1}
              />

              <div className="grid grid-cols-1 gap-6">
                <InputMoneyField
                  label="Minimum Eligible Price"
                  value={formData.min_eligible_price || 0}
                  onChange={(value) => handleInputChange('min_eligible_price', value ? parseFloat(value) : null)}
                  placeholder="0.00"
                />

                <InputMoneyField
                  label="Maximum Discount Amount"
                  value={formData.max_discount || 0}
                  onChange={(value) => handleInputChange('max_discount', value ? parseFloat(value) : null)}
                  placeholder="0.00"
                />

                <InputMoneyField
                  label="Maximum Amount"
                  value={formData.max_amount || 0}
                  onChange={(value) => handleInputChange('max_amount', value ? parseFloat(value) : null)}
                  placeholder="0.00"
                />

                <InputTextField
                  label="Max Transaction Count"
                  type="number"
                  value={formData.max_trans_count || ''}
                  onChange={(value) => handleInputChange('max_trans_count', value ? parseInt(value) : null)}
                  placeholder="Unlimited"
                  min={0}
                />

                <InputTextField
                  label="Maximum Percentage"
                  type="number"
                  value={formData.max_percentage || ''}
                  onChange={(value) => handleInputChange('max_percentage', value ? parseFloat(value) : null)}
                  placeholder="No limit"
                  min={0}
                  max={100}
                  step={0.01}
                />
              </div>
            </div>
          </Widget>

          {/* Settings Widget */}
          <Widget
            title="Settings"
            description="Discount behavior and options"
            icon={SparklesIcon}
            className="lg:col-span-2"
          >
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
          </Widget>
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
    </div>
  );
};

export default DiscountEditPage;
