import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CreditCardIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import Button from '../components/ui/Button';
import { paymentServices } from '../services/payment';
import type { Tender, CreateTenderRequest } from '../services/types/payment.types';

interface PaymentSettingsState {
  tenders: Tender[];
  isLoading: boolean;
  showTenderForm: boolean;
  editingTender: Tender | null;
  formData: CreateTenderRequest;
  errors: Record<string, string>;
}

const TENDER_TYPES = [
  { value: 'cash', label: 'Cash', icon: BanknotesIcon },
  { value: 'credit_card', label: 'Credit Card', icon: CreditCardIcon },
  { value: 'debit_card', label: 'Debit Card', icon: CreditCardIcon },
  { value: 'gift_card', label: 'Gift Card', icon: CreditCardIcon },
  { value: 'store_credit', label: 'Store Credit', icon: CurrencyDollarIcon },
  { value: 'check', label: 'Check', icon: BanknotesIcon },
  { value: 'mobile_payment', label: 'Mobile Payment', icon: CreditCardIcon },
  { value: 'voucher', label: 'Voucher', icon: CurrencyDollarIcon },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: BanknotesIcon },
  { value: 'cryptocurrency', label: 'Cryptocurrency', icon: CurrencyDollarIcon }
];

const CURRENCIES = [
  { value: 'usd', label: 'USD - US Dollar' },
  { value: 'eur', label: 'EUR - Euro' },
  { value: 'gbp', label: 'GBP - British Pound' },
  { value: 'aed', label: 'AED - UAE Dirham' },
  { value: 'inr', label: 'INR - Indian Rupee' },
  { value: 'jpy', label: 'JPY - Japanese Yen' },
  { value: 'cad', label: 'CAD - Canadian Dollar' },
  { value: 'aud', label: 'AUD - Australian Dollar' },
  { value: 'chf', label: 'CHF - Swiss Franc' },
  { value: 'cny', label: 'CNY - Chinese Yuan' }
];

const PaymentSettings: React.FC = () => {
  const { currentTenant } = useTenantStore();
  
  const [state, setState] = useState<PaymentSettingsState>({
    tenders: [],
    isLoading: true,
    showTenderForm: false,
    editingTender: null,
    formData: {
      tender_id: '',
      type_code: 'cash',
      currency_id: 'aed',
      description: '',
      over_tender_allowed: false,
      availability: ['sale']
    },
    errors: {}
  });

  useEffect(() => {
    loadTenders();
  }, [currentTenant]);

  const loadTenders = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      // In a real app, you would use the actual tenant ID
      const tenders = await paymentServices.tender.getMockTenders();
      setState(prev => ({ ...prev, tenders, isLoading: false }));
    } catch (error) {
      console.error('Failed to load tenders:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCreateTender = () => {
    setState(prev => ({
      ...prev,
      showTenderForm: true,
      editingTender: null,
      formData: {
        tender_id: '',
        type_code: 'cash',
        currency_id: 'aed',
        description: '',
        over_tender_allowed: false,
        availability: ['sale']
      },
      errors: {}
    }));
  };

  const handleEditTender = (tender: Tender) => {
    setState(prev => ({
      ...prev,
      showTenderForm: true,
      editingTender: tender,
      formData: {
        tender_id: tender.tender_id,
        type_code: tender.type_code,
        currency_id: tender.currency_id,
        description: tender.description,
        over_tender_allowed: tender.over_tender_allowed,
        availability: tender.availability
      },
      errors: {}
    }));
  };

  const handleDeleteTender = async (tenderId: string) => {
    if (!confirm('Are you sure you want to delete this tender?')) return;

    try {
      await paymentServices.tender.deleteTender(tenderId);
      setState(prev => ({
        ...prev,
        tenders: prev.tenders.filter(t => t.tender_id !== tenderId)
      }));
    } catch (error) {
      console.error('Failed to delete tender:', error);
    }
  };

  const handleToggleStatus = async (tender: Tender) => {
    try {
      const updatedTender = await paymentServices.tender.toggleTenderStatus(
        tender.tender_id, 
        !tender.is_active
      );
      setState(prev => ({
        ...prev,
        tenders: prev.tenders.map(t => 
          t.tender_id === tender.tender_id ? updatedTender : t
        )
      }));
    } catch (error) {
      console.error('Failed to toggle tender status:', error);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setState(prev => ({ ...prev, errors: {} }));
      
      if (state.editingTender) {
        const updatedTender = await paymentServices.tender.updateTender(
          state.editingTender.tender_id,
          state.formData
        );
        setState(prev => ({
          ...prev,
          tenders: prev.tenders.map(t => 
            t.tender_id === state.editingTender!.tender_id ? updatedTender : t
          ),
          showTenderForm: false,
          editingTender: null
        }));
      } else {
        const newTender = await paymentServices.tender.createTender(state.formData);
        setState(prev => ({
          ...prev,
          tenders: [...prev.tenders, newTender],
          showTenderForm: false
        }));
      }
    } catch (error) {
      console.error('Failed to save tender:', error);
      setState(prev => ({
        ...prev,
        errors: { general: 'Failed to save tender. Please try again.' }
      }));
    }
  };

  const handleFormChange = (field: keyof CreateTenderRequest, value: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      errors: { ...prev.errors, [field]: '' }
    }));
  };

  const handleAvailabilityChange = (option: 'sale' | 'return', checked: boolean) => {
    setState(prev => {
      const availability = checked
        ? [...prev.formData.availability, option]
        : prev.formData.availability.filter(a => a !== option);
      
      return {
        ...prev,
        formData: { ...prev.formData, availability },
        errors: { ...prev.errors, availability: '' }
      };
    });
  };

  const getTenderTypeIcon = (typeCode: string) => {
    const tenderType = TENDER_TYPES.find(t => t.value === typeCode);
    const IconComponent = tenderType?.icon || CreditCardIcon;
    return <IconComponent className="h-6 w-6" />;
  };

  const getStatusBadge = (tender: Tender) => {
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
        tender.is_active !== false
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {tender.is_active !== false ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getCurrencyLabel = (currencyId: string) => {
    const currency = CURRENCIES.find(c => c.value === currencyId);
    return currency?.label || currencyId.toUpperCase();
  };

  if (state.isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payment Settings</h1>
          <p className="text-slate-500 mt-2">
            Configure payment options available for your POS system
          </p>
        </div>
        <Button onClick={handleCreateTender} className="flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>Add Tender</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-blue-50">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total Tenders</p>
              <p className="text-2xl font-bold text-slate-900">{state.tenders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-green-50">
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Active Tenders</p>
              <p className="text-2xl font-bold text-slate-900">
                {state.tenders.filter(t => t.is_active !== false).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-purple-50">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Currencies</p>
              <p className="text-2xl font-bold text-slate-900">
                {new Set(state.tenders.map(t => t.currency_id)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-orange-50">
              <BanknotesIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Over Tender Allowed</p>
              <p className="text-2xl font-bold text-slate-900">
                {state.tenders.filter(t => t.over_tender_allowed).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tenders List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Payment Tenders</h2>
        </div>
        
        <div className="divide-y divide-slate-200">
          {state.tenders.map((tender) => (
            <div key={tender.tender_id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getTenderTypeIcon(tender.type_code)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-slate-900 truncate">
                        {tender.description}
                      </h3>
                      {getStatusBadge(tender)}
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-slate-500">
                      <span>ID: {tender.tender_id}</span>
                      <span>Type: {tender.type_code}</span>
                      <span>Currency: {getCurrencyLabel(tender.currency_id)}</span>
                      <span>
                        Over Tender: {tender.over_tender_allowed ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-sm text-slate-500">Available for:</span>
                      {tender.availability.map((avail) => (
                        <span
                          key={avail}
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800"
                        >
                          {avail}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(tender)}
                    className="flex items-center space-x-1"
                  >
                    {tender.is_active !== false ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                    <span>{tender.is_active !== false ? 'Deactivate' : 'Activate'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTender(tender)}
                    className="flex items-center space-x-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTender(tender.tender_id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {state.tenders.length === 0 && (
            <div className="p-12 text-center">
              <CreditCardIcon className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">No tenders configured</h3>
              <p className="mt-1 text-sm text-slate-500">
                Get started by adding your first payment tender.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreateTender}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Tender
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tender Form Modal */}
      {state.showTenderForm && (
        <div className="fixed inset-0 bg-slate-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border border-slate-200 w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-2xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                {state.editingTender ? 'Edit Tender' : 'Add New Tender'}
              </h3>
              <button
                onClick={() => setState(prev => ({ ...prev, showTenderForm: false }))}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-6">
              {state.errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-600">{state.errors.general}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tender ID
                  </label>
                  <input
                    type="text"
                    value={state.formData.tender_id}
                    onChange={(e) => handleFormChange('tender_id', e.target.value)}
                    disabled={!!state.editingTender}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., cash, credit_card"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type
                  </label>
                  <select
                    value={state.formData.type_code}
                    onChange={(e) => handleFormChange('type_code', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {TENDER_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={state.formData.currency_id}
                    onChange={(e) => handleFormChange('currency_id', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={state.formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Cash payments"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Settings
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={state.formData.over_tender_allowed}
                      onChange={(e) => handleFormChange('over_tender_allowed', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Allow over tender (customer can pay more than the total amount)
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Availability
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={state.formData.availability.includes('sale')}
                      onChange={(e) => handleAvailabilityChange('sale', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <span className="ml-2 text-sm text-slate-700">Sales transactions</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={state.formData.availability.includes('return')}
                      onChange={(e) => handleAvailabilityChange('return', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <span className="ml-2 text-sm text-slate-700">Return transactions</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setState(prev => ({ ...prev, showTenderForm: false }))}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {state.editingTender ? 'Update Tender' : 'Create Tender'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSettings;
