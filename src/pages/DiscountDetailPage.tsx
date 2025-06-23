import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  TagIcon,
  PercentBadgeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { discountApiService } from '../services/discount/discountApiService';
import { PageHeader, Button, Card, ConfirmDialog } from '../components/ui';
import type { Discount } from '../types/discount';
import useTenantStore from '../tenants/tenantStore';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';

const DiscountDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentTenant, currentStore } = useTenantStore();

  const [loading, setLoading] = useState(true);
  const [discount, setDiscount] = useState<Discount | null>(null);

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

  useEffect(() => {
    if (id) {
      loadDiscount();
    }
  }, [id]);

  const loadDiscount = async () => {
    if (!id || !currentTenant?.id || !currentStore?.store_id) return;

    try {
      setLoading(true);
      const discountData = await discountApiService.getDiscountById(
        currentTenant.id,
        currentStore.store_id,
        id
      );
      setDiscount(discountData);
    } catch (error) {
      console.error('Failed to load discount:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!discount) return;

    deleteDialog.openDeleteDialog(
      discount.discount_code,
      async () => {
        await discountApiService.deleteDiscount(discount.tenant_id, discount.store_id, discount.discount_id);
        navigate('/discounts');
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!discount) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Discount Not Found</h2>
          <p className="mt-2 text-gray-600">The discount you're looking for doesn't exist.</p>
          <Button
            onClick={() => navigate('/discounts')}
            className="mt-4"
          >
            Back to Discounts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title={discount.discount_code}
        description="Discount details and settings"
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/discounts')}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Discounts
          </Button>
          <Button
            onClick={() => navigate(`/discounts/edit/${discount.discount_id}`)}
            className="flex items-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                isDiscountActive(discount)
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isDiscountActive(discount) ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Discount Code
                </label>
                <div className="flex items-center">
                  <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {discount.discount_code}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Discount Type & Value
                </label>
                <div className="flex items-center">
                  {discount.typcode === 'PERCENT' ? (
                    <PercentBadgeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  ) : (
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  )}
                  <span className="text-lg font-semibold text-gray-900">
                    {getDiscountValue(discount)}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({discount.typcode === 'PERCENT' ? 'Percentage' : 'Fixed Amount'})
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Description
                </label>
                <p className="text-gray-900">{discount.description}</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Prompt Message
                </label>
                <p className="text-gray-900">{discount.prompt}</p>
              </div>
            </div>
          </Card>

          {/* Date Range */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Date Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Start Date & Time
                </label>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900">{formatDate(discount.effective_datetime)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  End Date & Time
                </label>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900">{formatDate(discount.expr_datetime)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Advanced Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Application Method
                </label>
                <span className="text-gray-900">
                  {discount.app_mthd_code === 'AUTO' ? 'Automatic' : 'Manual'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Calculation Method
                </label>
                <span className="text-gray-900">
                  {discount.calculation_mthd_code === 'BEFORE_TAX' ? 'Before Tax' : 'After Tax'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Sort Order
                </label>
                <span className="text-gray-900">{discount.sort_order}</span>
              </div>

              {discount.min_eligible_price && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Minimum Eligible Price
                  </label>
                  <span className="text-gray-900">${discount.min_eligible_price}</span>
                </div>
              )}

              {discount.max_discount && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Maximum Discount Amount
                  </label>
                  <span className="text-gray-900">${discount.max_discount}</span>
                </div>
              )}

              {discount.max_trans_count && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Max Transaction Count
                  </label>
                  <span className="text-gray-900">{discount.max_trans_count}</span>
                </div>
              )}

              {discount.max_percentage && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Maximum Percentage
                  </label>
                  <span className="text-gray-900">{discount.max_percentage}%</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Flags & Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Exclusive Discount</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  discount.exclusive_discount_flag === 1
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {discount.exclusive_discount_flag === 1 ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Serialized Discount</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  discount.serialized_discount_flag === 1
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {discount.serialized_discount_flag === 1 ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disallow Changes</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  discount.disallow_change_flag === 1
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {discount.disallow_change_flag === 1 ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </Card>

          {/* Metadata */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Created At
                </label>
                <span className="text-sm text-gray-900">{formatDate(discount.created_at)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Created By
                </label>
                <span className="text-sm text-gray-900">{discount.create_user_id}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Last Updated
                </label>
                <span className="text-sm text-gray-900">{formatDate(discount.updated_at)}</span>
              </div>

              {discount.update_user_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Updated By
                  </label>
                  <span className="text-sm text-gray-900">{discount.update_user_id}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
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

export default DiscountDetailPage;
