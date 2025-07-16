import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  TrashIcon,
  PlusIcon,
  CreditCardIcon,
  BanknotesIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  TagIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { tenderApiService } from '../services/tender/tenderApiService';
import { PageHeader, Button, Alert, ConfirmDialog, Loading, PropertyCheckbox, InputTextField, DropdownSearch, MultipleDropdownSearch, Widget } from '../components/ui';
import type { 
  Tender, 
  TenderDenomination, 
  TenderUserSettings,
  TenderConfiguration
} from '../services/types/payment.types';
import { useTenantStore } from '../tenants/tenantStore';
import { useDeleteConfirmDialog, useDiscardChangesDialog } from '../hooks/useConfirmDialog';

// Form data interface
interface TenderFormData {
  tender_id: string;
  type_code: string;
  currency_id: string;
  description: string;
  display_order: number;
  is_active: boolean;
  over_tender_allowed: boolean;
  denomination: TenderDenomination[];
  user_settings: TenderUserSettings[];
  configuration: TenderConfiguration;
  availability: string[];
}

// Availability options for tender usage
const AVAILABILITY_OPTIONS = [
  {
    id: 'SALE',
    label: 'Sale',
    description: 'Can be used for regular sales transactions'
  },
  {
    id: 'RETURN_WITH_RECEIPT',
    label: 'Return with Receipt',
    description: 'Can be used for returns with receipt'
  },
  {
    id: 'RETURN_WITHOUT_RECEIPT',
    label: 'Return without Receipt', 
    description: 'Can be used for returns without receipt'
  }
];

// Tender templates for quick setup
const TENDER_TEMPLATES = [
  {
    id: 'cash_aed',
    name: 'tenderEdit.templates.cash.name',
    description: 'tenderEdit.templates.cash.description',
    type_code: 'currency',
    currency_id: 'aed',
    icon: BanknotesIcon,
    color: '#059669',
    denomination: [
      { id: 'fils_5', value: 0.05, description: '5 fils', display_order: 1 },
      { id: 'fils_10', value: 0.10, description: '10 fils', display_order: 2 },
      { id: 'fils_25', value: 0.25, description: '25 fils', display_order: 3 },
      { id: 'fils_50', value: 0.50, description: '50 fils', display_order: 4 },
      { id: 'dirham_1', value: 1.00, description: '1 dirham', display_order: 5 },
      { id: 'dirham_5', value: 5.00, description: '5 dirhams', display_order: 6 },
      { id: 'dirham_10', value: 10.00, description: '10 dirhams', display_order: 7 },
      { id: 'dirham_20', value: 20.00, description: '20 dirhams', display_order: 8 },
      { id: 'dirham_50', value: 50.00, description: '50 dirhams', display_order: 9 },
      { id: 'dirham_100', value: 100.00, description: '100 dirhams', display_order: 10 },
      { id: 'dirham_200', value: 200.00, description: '200 dirhams', display_order: 11 },
      { id: 'dirham_500', value: 500.00, description: '500 dirhams', display_order: 12 },
      { id: 'dirham_1000', value: 1000.00, description: '1000 dirhams', display_order: 13 }
    ]
  },
  {
    id: 'card_visa',
    name: 'tenderEdit.templates.visa.name',
    description: 'tenderEdit.templates.visa.description',
    type_code: 'card',
    currency_id: 'aed',
    icon: CreditCardIcon,
    color: '#1E40AF',
    denomination: []
  },
  {
    id: 'card_mastercard',
    name: 'tenderEdit.templates.mastercard.name',
    description: 'tenderEdit.templates.mastercard.description',
    type_code: 'card',
    currency_id: 'aed',
    icon: CreditCardIcon,
    color: '#DC2626',
    denomination: []
  },
  {
    id: 'gift_card',
    name: 'tenderEdit.templates.giftCard.name',
    description: 'tenderEdit.templates.giftCard.description',
    type_code: 'giftcard',
    currency_id: 'aed',
    icon: TagIcon,
    color: '#7C3AED',
    denomination: []
  },
  {
    id: 'loyalty_points',
    name: 'tenderEdit.templates.loyaltyPoints.name',
    description: 'tenderEdit.templates.loyaltyPoints.description',
    type_code: 'loyalty',
    currency_id: 'aed',
    icon: SparklesIcon,
    color: '#F59E0B',
    denomination: []
  },
  {
    id: 'voucher',
    name: 'tenderEdit.templates.voucher.name',
    description: 'tenderEdit.templates.voucher.description',
    type_code: 'voucher',
    currency_id: 'aed',
    icon: TagIcon,
    color: '#059669',
    denomination: []
  }
];

// Dropdown options for select fields
const TENDER_TYPE_OPTIONS = [
  { id: 'currency', label: 'tenderEdit.tenderTypes.currency.label', description: 'tenderEdit.tenderTypes.currency.description' },
  { id: 'card', label: 'tenderEdit.tenderTypes.card.label', description: 'tenderEdit.tenderTypes.card.description' },
  { id: 'giftcard', label: 'tenderEdit.tenderTypes.giftcard.label', description: 'tenderEdit.tenderTypes.giftcard.description' },
  { id: 'loyalty', label: 'tenderEdit.tenderTypes.loyalty.label', description: 'tenderEdit.tenderTypes.loyalty.description' },
  { id: 'voucher', label: 'tenderEdit.tenderTypes.voucher.label', description: 'tenderEdit.tenderTypes.voucher.description' }
];

const CURRENCY_OPTIONS = [
  { id: 'aed', label: 'AED', description: 'tenderEdit.currencies.aed' },
  { id: 'usd', label: 'USD', description: 'tenderEdit.currencies.usd' },
  { id: 'eur', label: 'EUR', description: 'tenderEdit.currencies.eur' },
  { id: 'gbp', label: 'GBP', description: 'tenderEdit.currencies.gbp' }
];

const TenderEditPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  
  const isEditing = Boolean(id);
  const [originalTender, setOriginalTender] = useState<Tender | null>(null);
  
  const [formData, setFormData] = useState<TenderFormData>({
    tender_id: '',
    type_code: 'currency',
    currency_id: 'aed',
    description: '',
    display_order: 1,
    is_active: true,
    over_tender_allowed: true,
    denomination: [],
    user_settings: [
      {
        group_id: 'everyone',
        usage_code: ['sale', 'default'],
        over_tender_limit: 10000.00,
        min_amount: 0.01,
        max_amount: 10000.00,
        max_refund_with_receipt: 10000.00,
        max_refund_without_receipt: 1000.00
      }
    ],
    configuration: {
      serial_nbr_req: false,
      open_cash_drawer: true,
      unit_count_code: 'denomination',
      min_denomination: 0.01,
      effective_date: new Date().toISOString(),
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      max_refund_days: 30,
      customer_required: false,
      change_tender_id: 'local_currency',
      change_cash_limit: 10000.00,
      split_tender_allowed: true
    },
    availability: ['SALE', 'RETURN_WITH_RECEIPT', 'RETURN_WITHOUT_RECEIPT']
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

  // Load tender data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        // If editing, load the specific tender
        if (isEditing && id) {
          const tenderData = await tenderApiService.getTenderById(id, {
            tenant_id: currentTenant?.id,
            store_id: currentStore?.store_id
          });
          
          setOriginalTender(JSON.parse(JSON.stringify(tenderData))); // Deep clone
          
          // Map to form data
          setFormData({
            tender_id: tenderData.tender_id,
            type_code: tenderData.type_code,
            currency_id: tenderData.currency_id,
            description: tenderData.description || '',
            display_order: tenderData.display_order || 1,
            is_active: tenderData.is_active ?? true,
            over_tender_allowed: tenderData.over_tender_allowed ?? true,
            denomination: tenderData.denomination || [],
            user_settings: tenderData.user_settings || [],
            configuration: tenderData.configuration || {
              serial_nbr_req: false,
              open_cash_drawer: true,
              unit_count_code: 'denomination',
              min_denomination: 0.01,
              effective_date: new Date().toISOString(),
              expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              max_refund_days: 30,
              customer_required: false,
              change_tender_id: 'local_currency',
              change_cash_limit: 10000.00,
              split_tender_allowed: true
            },
            availability: tenderData.availability || ['SALE', 'RETURN_WITH_RECEIPT', 'RETURN_WITHOUT_RECEIPT']
          });
        }
      } catch (error) {
        console.error('Failed to load tender data:', error);
        setFetchError('Failed to load tender data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isEditing, id, currentTenant, currentStore]);

  // Check for changes
  useEffect(() => {
    if (isEditing && originalTender) {
      // Compare current form data with original tender
      const currentData = {
        tender_id: formData.tender_id,
        type_code: formData.type_code,
        currency_id: formData.currency_id,
        description: formData.description || null,
        display_order: formData.display_order,
        is_active: formData.is_active,
        over_tender_allowed: formData.over_tender_allowed,
        denomination: formData.denomination,
        user_settings: formData.user_settings,
        configuration: formData.configuration,
        availability: formData.availability
      };

      const originalData = {
        tender_id: originalTender.tender_id,
        type_code: originalTender.type_code,
        currency_id: originalTender.currency_id,
        description: originalTender.description,
        display_order: originalTender.display_order,
        is_active: originalTender.is_active,
        over_tender_allowed: originalTender.over_tender_allowed,
        denomination: originalTender.denomination,
        user_settings: originalTender.user_settings,
        configuration: originalTender.configuration,
        availability: originalTender.availability
      };

      setHasChanges(JSON.stringify(currentData) !== JSON.stringify(originalData));
    } else if (!isEditing) {
      // For new tenders, check if any fields are filled
      const hasData = formData.tender_id.trim() !== '' || 
                     formData.description.trim() !== '' ||
                     formData.denomination.length > 0;
      setHasChanges(hasData);
    }
  }, [formData, originalTender, isEditing]);

  const handleInputChange = (field: keyof TenderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleConfigurationChange = (field: keyof TenderConfiguration, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuration: { ...prev.configuration, [field]: value }
    }));
  };

  const applyTemplate = (template: any) => {
    setFormData(prev => ({
      ...prev,
      tender_id: template.id,
      type_code: template.type_code,
      currency_id: template.currency_id,
      description: template.description,
      denomination: template.denomination || []
    }));
    setShowTemplates(false);
  };

  const addDenomination = () => {
    const newDenomination: TenderDenomination = {
      id: `denom_${Date.now()}`,
      value: 0.01,
      description: '',
      display_order: formData.denomination.length + 1
    };
    setFormData(prev => ({
      ...prev,
      denomination: [...prev.denomination, newDenomination]
    }));
  };

  const removeDenomination = (index: number) => {
    setFormData(prev => ({
      ...prev,
      denomination: prev.denomination.filter((_, i) => i !== index)
    }));
  };

  const handleDenominationChange = (index: number, field: keyof TenderDenomination, value: any) => {
    setFormData(prev => ({
      ...prev,
      denomination: prev.denomination.map((denom, i) => 
        i === index ? { ...denom, [field]: value } : denom
      )
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.tender_id.trim()) {
      newErrors.tender_id = 'Tender ID is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.tender_id.length > 50) {
      newErrors.tender_id = 'Tender ID must be less than 50 characters';
    }
    
    if (!formData.availability || formData.availability.length === 0) {
      newErrors.availability = 'At least one availability option is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSaving(true);
      setErrors({});

      const tenderData = {
        ...formData,
      };

      if (isEditing && id) {
        await tenderApiService.updateTender(id, tenderData, {
          tenant_id: currentTenant?.id,
          store_id: currentStore?.store_id
        });
        setSuccessMessage('Tender updated successfully!');
      } else {
        await tenderApiService.createTender(tenderData, {
          tenant_id: currentTenant?.id,
          store_id: currentStore?.store_id
        }); 
        setSuccessMessage('Tender created successfully!');
        setTimeout(() => navigate('/payment-settings'), 1500);
      }
      
      setHasChanges(false);
    } catch (error: any) {
      console.error('Failed to save tender:', error);
      setErrors({ submit: error.message || 'Failed to save tender. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    deleteDialog.openDeleteDialog(
      originalTender?.description || 'this tender',
      async () => {
        await tenderApiService.deleteTender(id, {
          tenant_id: currentTenant?.id,
          store_id: currentStore?.store_id
        });
        navigate('/payment-settings');
      }
    );
  };

  const discardChanges = () => {
    discardDialog.openDiscardDialog(() => {
      if (originalTender) {
        setFormData({
          tender_id: originalTender.tender_id,
          type_code: originalTender.type_code,
          currency_id: originalTender.currency_id,
          description: originalTender.description || '',
          display_order: originalTender.display_order || 1,
          is_active: originalTender.is_active ?? true,
          over_tender_allowed: originalTender.over_tender_allowed ?? true,
          denomination: originalTender.denomination || [],
          user_settings: originalTender.user_settings || [],
          configuration: originalTender.configuration || {
            serial_nbr_req: false,
            open_cash_drawer: true,
            unit_count_code: 'denomination',
            min_denomination: 0.01,
            effective_date: new Date().toISOString(),
            expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            max_refund_days: 30,
            customer_required: false,
            change_tender_id: 'local_currency',
            change_cash_limit: 10000.00,
            split_tender_allowed: true
          },
          availability: originalTender.availability || ['SALE', 'RETURN_WITH_RECEIPT', 'RETURN_WITHOUT_RECEIPT']
        });
      } else {
        // Reset to empty form
        setFormData({
          tender_id: '',
          type_code: 'currency',
          currency_id: 'aed',
          description: '',
          display_order: 1,
          is_active: true,
          over_tender_allowed: true,
          denomination: [],
          user_settings: [
            {
              group_id: 'everyone',
              usage_code: ['sale', 'default'],
              over_tender_limit: 10000.00,
              min_amount: 0.01,
              max_amount: 10000.00,
              max_refund_with_receipt: 10000.00,
              max_refund_without_receipt: 1000.00
            }
          ],
          configuration: {
            serial_nbr_req: false,
            open_cash_drawer: true,
            unit_count_code: 'denomination',
            min_denomination: 0.01,
            effective_date: new Date().toISOString(),
            expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            max_refund_days: 30,
            customer_required: false,
            change_tender_id: 'local_currency',
            change_cash_limit: 10000.00,
            split_tender_allowed: true
          },
          availability: ['SALE', 'RETURN_WITH_RECEIPT', 'RETURN_WITHOUT_RECEIPT']
        });
      }
      
      setErrors({});
      setHasChanges(false);
    });
  };

  const saveAllChanges = () => {
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <PageHeader
        title={isEditing ? 'Edit Tender' : 'Create New Tender'}
      >
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/payment-settings')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Payment Settings</span>
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

      {/* Fetch Error */}
      {fetchError && (
        <Alert variant="error" className="mb-4">
          <ExclamationTriangleIcon className="h-5 w-5" />
          {fetchError}
        </Alert>
      )}

      {/* Template Selection for New Tenders */}
      {showTemplates && !isEditing && (
        <Widget
          title="Tender Templates"
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
            {TENDER_TEMPLATES.map((template) => {
              const IconComponent = template.icon;
              return (
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
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Widget>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {/* Basic Information Widget */}
          <Widget
            title="Basic Information"
            description="Essential tender details and identification"
            icon={CreditCardIcon}
            className="lg:col-span-2 overflow-visible"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField
                label="Tender ID"
                required
                value={formData.tender_id}
                onChange={(value) => handleInputChange('tender_id', value)}
                placeholder="Enter tender ID"
                error={errors.tender_id}
                disabled={isEditing}
                helperText={isEditing ? "Tender ID cannot be changed when editing" : undefined}
              />

              <InputTextField
                label="Description"
                required
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                placeholder="Enter tender description"
                error={errors.description}
              />

              <div>
                <DropdownSearch
                  label="Tender Type"
                  required
                  value={formData.type_code}
                  placeholder="Select tender type"
                  searchPlaceholder="Search tender types..."
                  options={TENDER_TYPE_OPTIONS}
                  onSelect={(option) => handleInputChange('type_code', option?.id || 'currency')}
                  displayValue={(option) => option ? `${option.label} - ${option.description}` : ''}
                  allowClear={false}
                  closeOnSelect={true}
                  error={errors.type_code}
                />
              </div>

              <div>
                <DropdownSearch
                  label="Currency"
                  required
                  value={formData.currency_id}
                  placeholder="Select currency"
                  searchPlaceholder="Search currencies..."
                  options={CURRENCY_OPTIONS}
                  onSelect={(option) => handleInputChange('currency_id', option?.id || 'aed')}
                  displayValue={(option) => option ? `${option.label} - ${option.description}` : ''}
                  allowClear={false}
                  closeOnSelect={true}
                  error={errors.currency_id}
                />
              </div>

              <InputTextField
                label="Display Order"
                type="number"
                value={formData.display_order}
                onChange={(value) => handleInputChange('display_order', parseInt(value) || 1)}
                placeholder="1"
                helperText="Lower numbers appear first in the tender list"
                min={1}
              />

              {/* Availability Selection */}
              <div>
                <MultipleDropdownSearch
                  label="Availability"
                  values={formData.availability}
                  options={AVAILABILITY_OPTIONS}
                  onSelect={(selectedValues) => handleInputChange('availability', selectedValues)}
                  placeholder="Select tender availability options"
                  searchPlaceholder="Search availability options..."
                  allowSelectAll={true}
                  selectAllLabel="Select All"
                  clearAllLabel="Clear All"
                  noOptionsMessage="No availability options found"
                  required={true}
                  error={errors.availability}
                  className="w-full"
                />
              </div>
            </div>
          </Widget>

          {/* Denominations Widget - Only show for currency type */}
          {formData.type_code === 'currency' && (
            <Widget
              title="Denominations"
              description="Configure available denominations for this tender"
              icon={BanknotesIcon}
              headerActions={
                <Button
                  onClick={addDenomination}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Denomination</span>
                </Button>
              }
            >
              <div className="space-y-4">
                {formData.denomination.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BanknotesIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No denominations configured</p>
                    <p className="text-sm">Click "Add Denomination" to get started</p>
                  </div>
                ) : (
                  formData.denomination.map((denom, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <input
                          type="number"
                          step="0.01"
                          value={denom.value}
                          onChange={(e) => handleDenominationChange(index, 'value', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Value"
                        />
                      </div>
                      <div className="flex-2">
                        <input
                          type="text"
                          value={denom.description}
                          onChange={(e) => handleDenominationChange(index, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Description"
                        />
                      </div>
                      <Button
                        onClick={() => removeDenomination(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Widget>
          )}

          {/* Configuration Widget */}
          <Widget
            title="Configuration"
            description="Tender behavior and system configuration"
            icon={Cog6ToothIcon}
          >
            <div className="space-y-6">
              <PropertyCheckbox
                title="Serial Number Required"
                description="Require serial number entry for this tender"
                checked={formData.configuration.serial_nbr_req}
                onChange={(checked) => handleConfigurationChange('serial_nbr_req', checked)}
              />

              <PropertyCheckbox
                title="Open Cash Drawer"
                description="Automatically open cash drawer when using this tender"
                checked={formData.configuration.open_cash_drawer}
                onChange={(checked) => handleConfigurationChange('open_cash_drawer', checked)}
              />

              <PropertyCheckbox
                title="Customer Required"
                description="Require customer information for this tender"
                checked={formData.configuration.customer_required}
                onChange={(checked) => handleConfigurationChange('customer_required', checked)}
              />

              <PropertyCheckbox
                title="Split Tender Allowed"
                description="Allow this tender to be used in split payments"
                checked={formData.configuration.split_tender_allowed}
                onChange={(checked) => handleConfigurationChange('split_tender_allowed', checked)}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Refund Days
                </label>
                <input
                  type="number"
                  value={formData.configuration.max_refund_days}
                  onChange={(e) => handleConfigurationChange('max_refund_days', parseInt(e.target.value) || 30)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="30"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Change Cash Limit
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.configuration.change_cash_limit}
                  onChange={(e) => handleConfigurationChange('change_cash_limit', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10000.00"
                  min={0}
                />
              </div>
            </div>
          </Widget>

          {/* Settings Widget */}
          <Widget
            title="Settings"
            description="Tender status and behavioral settings"
            icon={Cog6ToothIcon}
            className="lg:col-span-2 overflow-visible"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <PropertyCheckbox
                  title="Active Status"
                  description="Whether this tender is active and available for use"
                  checked={formData.is_active}
                  onChange={(checked) => handleInputChange('is_active', checked)}
                />

                <PropertyCheckbox
                  title="Over Tender Allowed"
                  description="Allow customers to pay more than the required amount"
                  checked={formData.over_tender_allowed}
                  onChange={(checked) => handleInputChange('over_tender_allowed', checked)}
                />
              </div>
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

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 bg-white rounded-lg p-4 sm:p-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/payment-settings')}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-4 w-4" />
                <span>{isEditing ? 'Update Tender' : 'Create Tender'}</span>
              </>
            )}
          </Button>
        </div>
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

export default TenderEditPage;
