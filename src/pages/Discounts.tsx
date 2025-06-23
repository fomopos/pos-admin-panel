import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  TagIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  PercentBadgeIcon
} from '@heroicons/react/24/outline';
import { discountApiService } from '../services/discount/discountApiService';
import { PageHeader, Button, ConfirmDialog } from '../components/ui';
import type { Discount } from '../types/discount';
import useTenantStore from '../tenants/tenantStore';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';

const Discounts: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentTenant, currentStore } = useTenantStore();

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

  useEffect(() => {
    if (currentTenant?.id && currentStore?.store_id) {
      loadDiscounts();
    }
  }, [currentTenant?.id, currentStore?.store_id]);

  const loadDiscounts = async () => {
    if (!currentTenant?.id || !currentStore?.store_id) {
      console.log('Missing tenant or store information');
      return;
    }

    try {
      setLoading(true);
      const result = await discountApiService.getDiscounts({
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      });
      setDiscounts(result.discounts || []);
    } catch (error) {
      console.error('Failed to load discounts:', error);
      setDiscounts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (discountId: string) => {
    const discount = discounts.find(d => d.discount_id === discountId);
    if (!discount) return;

    deleteDialog.openDeleteDialog(
      discount.discount_code,
      async () => {
        await discountApiService.deleteDiscount(discount.tenant_id, discount.store_id, discount.discount_id);
        await loadDiscounts(); // Reload the list
      }
    );
  };

  const filteredDiscounts = (discounts || []).filter(discount =>
    discount.discount_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discount.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isDiscountActive = (discount: Discount) => {
    const now = new Date();
    const startDate = new Date(discount.effective_datetime);
    const endDate = new Date(discount.expr_datetime);
    return now >= startDate && now <= endDate;
  };

  const getDiscountValue = (discount: Discount) => {
    if (discount.typcode === 'PERCENT') {
      return `${discount.percentage}%`;
    } else {
      return `$${discount.discount}`;
    }
  };

  if (loading || !currentTenant?.id || !currentStore?.store_id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title={t('discounts.title')}
        description={t('discounts.description')}
      >
        <Button
          onClick={() => navigate('/discounts/new')}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusIcon className="h-4 w-4" />
          {t('discounts.add')}
        </Button>
      </PageHeader>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('discounts.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Discounts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredDiscounts.length === 0 ? (
          <div className="text-center py-12">
            <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? t('discounts.noResults') : t('discounts.empty.title')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? t('discounts.noResults.description') : t('discounts.empty.description')}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button
                  onClick={() => navigate('/discounts/new')}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusIcon className="h-4 w-4" />
                  {t('discounts.add')}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('discounts.table.code')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('discounts.table.description')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('discounts.table.type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('discounts.table.value')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('discounts.table.dates')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('discounts.table.status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDiscounts.map((discount) => (
                  <tr key={discount.discount_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <TagIcon className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {discount.discount_code}
                          </div>
                          <div className="text-sm text-gray-500">
                            {discount.app_mthd_code === 'AUTO' ? 'Automatic' : 'Manual'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {discount.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <PercentBadgeIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {discount.typcode === 'PERCENT' ? 'Percentage' : 'Fixed Amount'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {getDiscountValue(discount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{formatDate(discount.effective_datetime)}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          to {formatDate(discount.expr_datetime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isDiscountActive(discount)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isDiscountActive(discount) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/discounts/${discount.discount_id}`)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/discounts/edit/${discount.discount_id}`)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(discount.discount_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

export default Discounts;
