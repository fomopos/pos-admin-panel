import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeftIcon,
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
import { useError } from '../hooks/useError';

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

// Availability options for tender usage - will be created inside component with translations

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

// Dropdown options will be created inside component with translations

const TenderEditPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  const { showError, showSuccess, showValidationError } = useError();
  
  // Dropdown options for select fields with translations
  const TENDER_TYPE_OPTIONS = [
    { id: 'currency', label: t('tenderEdit.tenderTypes.currency.label'), description: t('tenderEdit.tenderTypes.currency.description') },
    { id: 'card', label: t('tenderEdit.tenderTypes.card.label'), description: t('tenderEdit.tenderTypes.card.description') },
    { id: 'giftcard', label: t('tenderEdit.tenderTypes.giftcard.label'), description: t('tenderEdit.tenderTypes.giftcard.description') },
    { id: 'loyalty', label: t('tenderEdit.tenderTypes.loyalty.label'), description: t('tenderEdit.tenderTypes.loyalty.description') },
    { id: 'voucher', label: t('tenderEdit.tenderTypes.voucher.label'), description: t('tenderEdit.tenderTypes.voucher.description') }
  ];

  const CURRENCY_OPTIONS = [
    { id: 'aed', label: 'AED', description: t('tenderEdit.currencies.aed') },
    { id: 'usd', label: 'USD', description: t('tenderEdit.currencies.usd') },
    { id: 'eur', label: 'EUR', description: t('tenderEdit.currencies.eur') },
    { id: 'gbp', label: 'GBP', description: t('tenderEdit.currencies.gbp') }
  ];
  
  // Availability options for tender usage with translations
  const AVAILABILITY_OPTIONS = [
    {
      id: 'SALE',
      label: t('tenderEdit.availability.sale.label'),
      description: t('tenderEdit.availability.sale.description')
    },
    {
      id: 'RETURN_WITH_RECEIPT',
      label: t('tenderEdit.availability.returnWithReceipt.label'),
      description: t('tenderEdit.availability.returnWithReceipt.description')
    },
    {
      id: 'RETURN_WITHOUT_RECEIPT',
      label: t('tenderEdit.availability.returnWithoutReceipt.label'), 
      description: t('tenderEdit.availability.returnWithoutReceipt.description')
    }
  ];
  
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
      newErrors.tender_id = t('tenderEdit.form.errors.tenderIdRequired');
    }
    
    if (!formData.description.trim()) {
      newErrors.description = t('tenderEdit.form.errors.descriptionRequired');
    }
    
    if (formData.tender_id.length > 50) {
      newErrors.tender_id = t('tenderEdit.form.errors.tenderIdTooLong');
    }
    
    if (!formData.availability || formData.availability.length === 0) {
      newErrors.availability = t('tenderEdit.form.errors.availabilityRequired');
    }
    
    setErrors(newErrors);
    
    // Show validation error summary if there are errors
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.entries(newErrors).map(([field, error]) => {
        // Create friendly field names
        let friendlyFieldName = '';
        switch (field) {
          case 'tender_id':
            friendlyFieldName = t('tenderEdit.form.tenderId');
            break;
          case 'description':
            friendlyFieldName = t('tenderEdit.form.description');
            break;
          case 'availability':
            friendlyFieldName = t('tenderEdit.form.availability');
            break;
          default:
            friendlyFieldName = field;
        }
        return `${friendlyFieldName}: ${error}`;
      });
      
      showValidationError(
        `${t('tenderEdit.form.errors.validationSummary')} ${errorMessages.join('; ')}`,
        'tender_form_validation',
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

      const tenderData = {
        ...formData,
      };

      if (isEditing && id) {
        await tenderApiService.updateTender(id, tenderData, {
          tenant_id: currentTenant?.id,
          store_id: currentStore?.store_id
        });
        showSuccess(t('tenderEdit.success.updated'));
        setHasChanges(false);
      } else {
        await tenderApiService.createTender(tenderData, {
          tenant_id: currentTenant?.id,
          store_id: currentStore?.store_id
        }); 
        showSuccess(t('tenderEdit.success.created'));
        setHasChanges(false);
        setTimeout(() => navigate('/payment-settings'), 1500);
      }
    } catch (error: any) {
      console.error('Failed to save tender:', error);
      showError(error.message || t('tenderEdit.form.errors.saveFailed'));
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
        title={isEditing ? t('tenderEdit.title.edit') : t('tenderEdit.title.create')}
      >
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/payment-settings')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>{t('tenderEdit.backToPayments')}</span>
          </Button>
          
          {isEditing && (
            <Button
              onClick={handleDelete}
              variant="outline"
              disabled={isSaving}
              className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" />
              <span>{t('tenderEdit.delete')}</span>
            </Button>
          )}
          
          <Button
            type="submit"
            form="tender-form"
            disabled={isSaving}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{t('tenderEdit.saving')}</span>
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-4 w-4" />
                <span>{isEditing ? t('tenderEdit.actions.updateTender') : t('tenderEdit.actions.createTender')}</span>
              </>
            )}
          </Button>
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
                <h3 className="text-sm font-semibold text-amber-900">{t('tenderEdit.unsavedChanges.title')}</h3>
                <p className="text-xs text-amber-700 mt-1">{t('tenderEdit.unsavedChanges.description')}</p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3">
              <Button
                onClick={discardChanges}
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-100 bg-white"
              >
                <span>{t('tenderEdit.unsavedChanges.discard')}</span>
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
                    <span>{t('tenderEdit.saving')}</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-4 w-4" />
                    <span>{t('tenderEdit.unsavedChanges.save')}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </PageHeader>

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
          title={t('tenderEdit.templates.title')}
          description={t('tenderEdit.templates.description')}
          icon={SparklesIcon}
          variant="primary"
          headerActions={
            <Button
              onClick={() => setShowTemplates(false)}
              variant="outline"
              size="sm"
            >
              {t('tenderEdit.templates.skip')}
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
                        {t(template.name)}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {t(template.description)}
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
      <form id="tender-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {/* Basic Information Widget */}
          <Widget
            title={t('tenderEdit.sections.basicInfo.title')}
            description={t('tenderEdit.sections.basicInfo.description')}
            icon={CreditCardIcon}
            className="lg:col-span-2 overflow-visible"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField
                label={t('tenderEdit.form.tenderId')}
                required
                value={formData.tender_id}
                onChange={(value) => handleInputChange('tender_id', value)}
                placeholder={t('tenderEdit.form.placeholders.tenderId')}
                error={errors.tender_id}
                disabled={isEditing}
                helperText={isEditing ? t('tenderEdit.form.helperText.tenderIdReadonly') : undefined}
              />

              <InputTextField
                label={t('tenderEdit.form.description')}
                required
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                placeholder={t('tenderEdit.form.placeholders.description')}
                error={errors.description}
              />

              <div>
                <DropdownSearch
                  label={t('tenderEdit.form.tenderType')}
                  required
                  value={formData.type_code}
                  placeholder={t('tenderEdit.form.placeholders.tenderType')}
                  searchPlaceholder={t('tenderEdit.form.placeholders.searchTenderTypes')}
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
                  label={t('tenderEdit.form.currency')}
                  required
                  value={formData.currency_id}
                  placeholder={t('tenderEdit.form.placeholders.currency')}
                  searchPlaceholder={t('tenderEdit.form.placeholders.searchCurrencies')}
                  options={CURRENCY_OPTIONS}
                  onSelect={(option) => handleInputChange('currency_id', option?.id || 'aed')}
                  displayValue={(option) => option ? `${option.label} - ${option.description}` : ''}
                  allowClear={false}
                  closeOnSelect={true}
                  error={errors.currency_id}
                />
              </div>

              <InputTextField
                label={t('tenderEdit.form.displayOrder')}
                type="number"
                value={formData.display_order}
                onChange={(value) => handleInputChange('display_order', parseInt(value) || 1)}
                placeholder={t('tenderEdit.form.placeholders.displayOrder')}
                helperText={t('tenderEdit.form.helperText.displayOrder')}
                min={1}
              />

              {/* Availability Selection */}
              <div>
                <MultipleDropdownSearch
                  label={t('tenderEdit.form.availability')}
                  values={formData.availability}
                  options={AVAILABILITY_OPTIONS}
                  onSelect={(selectedValues) => handleInputChange('availability', selectedValues)}
                  placeholder={t('tenderEdit.form.placeholders.availability')}
                  searchPlaceholder={t('tenderEdit.form.placeholders.searchAvailability')}
                  allowSelectAll={true}
                  selectAllLabel={t('tenderEdit.form.selectAll')}
                  clearAllLabel={t('tenderEdit.form.clearAll')}
                  noOptionsMessage={t('tenderEdit.form.noAvailabilityOptions')}
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
              title={t('tenderEdit.sections.denominations.title')}
              description={t('tenderEdit.sections.denominations.description')}
              icon={BanknotesIcon}
              headerActions={
                <Button
                  onClick={addDenomination}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>{t('tenderEdit.sections.denominations.addDenomination')}</span>
                </Button>
              }
            >
              <div className="space-y-4">
                {formData.denomination.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BanknotesIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>{t('tenderEdit.sections.denominations.noDenominations')}</p>
                    <p className="text-sm">{t('tenderEdit.sections.denominations.getStarted')}</p>
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
                          placeholder={t('tenderEdit.sections.denominations.value')}
                        />
                      </div>
                      <div className="flex-2">
                        <input
                          type="text"
                          value={denom.description}
                          onChange={(e) => handleDenominationChange(index, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={t('tenderEdit.sections.denominations.description')}
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
            title={t('tenderEdit.sections.configuration.title')}
            description={t('tenderEdit.sections.configuration.description')}
            icon={Cog6ToothIcon}
          >
            <div className="space-y-6">
              <PropertyCheckbox
                title={t('tenderEdit.configuration.serialNumberRequired.title')}
                description={t('tenderEdit.configuration.serialNumberRequired.description')}
                checked={formData.configuration.serial_nbr_req}
                onChange={(checked) => handleConfigurationChange('serial_nbr_req', checked)}
              />

              <PropertyCheckbox
                title={t('tenderEdit.configuration.openCashDrawer.title')}
                description={t('tenderEdit.configuration.openCashDrawer.description')}
                checked={formData.configuration.open_cash_drawer}
                onChange={(checked) => handleConfigurationChange('open_cash_drawer', checked)}
              />

              <PropertyCheckbox
                title={t('tenderEdit.configuration.customerRequired.title')}
                description={t('tenderEdit.configuration.customerRequired.description')}
                checked={formData.configuration.customer_required}
                onChange={(checked) => handleConfigurationChange('customer_required', checked)}
              />

              <PropertyCheckbox
                title={t('tenderEdit.configuration.splitTenderAllowed.title')}
                description={t('tenderEdit.configuration.splitTenderAllowed.description')}
                checked={formData.configuration.split_tender_allowed}
                onChange={(checked) => handleConfigurationChange('split_tender_allowed', checked)}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('tenderEdit.form.maxRefundDays')}
                </label>
                <input
                  type="number"
                  value={formData.configuration.max_refund_days}
                  onChange={(e) => handleConfigurationChange('max_refund_days', parseInt(e.target.value) || 30)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('tenderEdit.form.placeholders.maxRefundDays')}
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('tenderEdit.form.changeCashLimit')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.configuration.change_cash_limit}
                  onChange={(e) => handleConfigurationChange('change_cash_limit', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('tenderEdit.form.placeholders.changeCashLimit')}
                  min={0}
                />
              </div>
            </div>
          </Widget>

          {/* Settings Widget */}
          <Widget
            title={t('tenderEdit.sections.settings.title')}
            description={t('tenderEdit.sections.settings.description')}
            icon={Cog6ToothIcon}
            className="lg:col-span-2 overflow-visible"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <PropertyCheckbox
                  title={t('tenderEdit.settings.activeStatus.title')}
                  description={t('tenderEdit.settings.activeStatus.description')}
                  checked={formData.is_active}
                  onChange={(checked) => handleInputChange('is_active', checked)}
                />

                <PropertyCheckbox
                  title={t('tenderEdit.settings.overTenderAllowed.title')}
                  description={t('tenderEdit.settings.overTenderAllowed.description')}
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
