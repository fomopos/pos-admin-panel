import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  CreditCardIcon,
  BanknotesIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { tenderApiService } from '../services/tender/tenderApiService';
import { PageHeader, Button, ConfirmDialog } from '../components/ui';
import type { Tender } from '../services/types/payment.types';
import { useTenantStore } from '../tenants/tenantStore';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';
import { useTranslation } from 'react-i18next';

const PaymentSettings: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const { currentTenant, currentStore } = useTenantStore();

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

  useEffect(() => {
    loadTenders();
  }, []);

  const loadTenders = async () => {
    try {
      setLoading(true);
      const result = await tenderApiService.getTenders({
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      });
      setTenders(result);
    } catch (error) {
      console.error('Failed to load tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const tenderTypes = Array.from(new Set(tenders.map(t => t.type_code)));
  const currencies = Array.from(new Set(tenders.map(t => t.currency_id)));

  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = tender.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.tender_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || tender.type_code === selectedType;
    const matchesCurrency = !selectedCurrency || tender.currency_id === selectedCurrency;
    return matchesSearch && matchesType && matchesCurrency;
  });

  const handleEdit = (tender: Tender) => {
    navigate(`/payment-settings/edit/${tender.tender_id}`);
  };

  const handleView = (tender: Tender) => {
    navigate(`/payment-settings/${tender.tender_id}`);
  };

  const handleDelete = async (tenderId: string) => {
    const tender = tenders.find(t => t.tender_id === tenderId);
    if (!tender) return;

    deleteDialog.openDeleteDialog(
      tender.description,
      async () => {
        await tenderApiService.deleteTender(tenderId, {
          tenant_id: currentTenant?.id,
          store_id: currentStore?.store_id,
        });
        await loadTenders(); // Reload the list
      }
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <PageHeader
        title="Payment Settings"
        description="Manage payment methods and tender configurations"
      >
        <Button
          onClick={() => navigate('/payment-settings/new')}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Tender</span>
        </Button>
      </PageHeader>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tenders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {tenderTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Currencies</option>
            {currencies.map(currency => (
              <option key={currency} value={currency}>
                {currency.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="flex border border-gray-300 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <Squares2X2Icon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <ListBulletIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      ) : filteredTenders.length === 0 ? (
        <div className="text-center py-12">
          <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tenders found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedType || selectedCurrency
              ? 'No tenders match your search criteria.'
              : 'Get started by adding your first tender.'
            }
          </p>
          <Button
            onClick={() => navigate('/payment-settings/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Tender
          </Button>
        </div>
      ) : (
        <>
          {/* Tenders Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTenders.map(tender => (
                <TenderCard
                  key={tender.tender_id}
                  tender={tender}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Currency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Over Tender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTenders.map(tender => (
                    <TenderListItem
                      key={tender.tender_id}
                      tender={tender}
                      onEdit={handleEdit}
                      onView={handleView}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

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

// Tender Card Component for Grid View (matches CategoryCard style)
const TenderCard: React.FC<{
  tender: Tender;
  onEdit: (tender: Tender) => void;
  onView: (tender: Tender) => void;
  onDelete: (tenderId: string) => void;
}> = ({ tender, onEdit, onView, onDelete }) => {
  const { t } = useTranslation();

  const getTenderIcon = (typeCode: string) => {
    switch (typeCode) {
      case 'currency':
      case 'cash':
        return <BanknotesIcon className="w-6 h-6 text-green-400" />;
      case 'card':
        return <CreditCardIcon className="w-6 h-6 text-blue-400" />;
      default:
        return <CreditCardIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
              {getTenderIcon(tender.type_code)}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{tender.description}</h3>
              <p className="text-sm text-gray-500">{tender.currency_id.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onView(tender)}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(tender)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(tender.tender_id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Type:</span>
            <span className="font-medium capitalize">{tender.type_code}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Over Tender:</span>
            <span className="font-medium">{tender.over_tender_allowed ? 'Allowed' : 'Not Allowed'}</span>
          </div>
          {tender.denomination && tender.denomination.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Denominations:</span>
              <span className="font-medium">{tender.denomination.length} types</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {tender.display_order} Order
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            tender.is_active
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {tender.is_active ? t('common.active') : t('common.inactive')}
          </span>
        </div>
      </div>
    </div>
  );
};

// Tender List Item Component for Table View (matches CategoryListItem style)
const TenderListItem: React.FC<{
  tender: Tender;
  onEdit: (tender: Tender) => void;
  onView: (tender: Tender) => void;
  onDelete: (tenderId: string) => void;
}> = ({ tender, onEdit, onView, onDelete }) => {
  const { t } = useTranslation();

  const getTenderIcon = (typeCode: string) => {
    switch (typeCode) {
      case 'currency':
      case 'cash':
        return <BanknotesIcon className="w-5 h-5 text-green-400" />;
      case 'card':
        return <CreditCardIcon className="w-5 h-5 text-blue-400" />;
      default:
        return <CreditCardIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mr-3">
            {getTenderIcon(tender.type_code)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{tender.description}</div>
            <div className="text-sm text-gray-500">{tender.tender_id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {tender.currency_id.toUpperCase()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {tender.type_code.charAt(0).toUpperCase() + tender.type_code.slice(1)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {tender.over_tender_allowed ? 'Yes' : 'No'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          tender.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {tender.is_active ? t('common.active') : t('common.inactive')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onView(tender)}
            className="text-gray-600 hover:text-gray-900"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(tender)}
            className="text-blue-600 hover:text-blue-900"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(tender.tender_id)}
            className="text-red-600 hover:text-red-900"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default PaymentSettings;
