import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
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
import { useError } from '../hooks/useError';

const Discounts: React.FC = () => {
  const navigate = useNavigate();
  
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const { currentTenant, currentStore } = useTenantStore();

  // Error handling hooks
  const { showError, showApiError, showSuccess } = useError();

  // Dialog hook
  const deleteDialog = useDeleteConfirmDialog();

  useEffect(() => {
    if (currentTenant?.id && currentStore?.store_id) {
      loadDiscounts();
    }
  }, [currentTenant?.id, currentStore?.store_id]);

  const loadDiscounts = async () => {
    if (!currentTenant?.id || !currentStore?.store_id) {
      showError('Missing tenant or store information');
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
      showApiError('Failed to load discounts. Please try again.', undefined, '/v0/discount');
      setDiscounts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const isDiscountActive = (discount: Discount) => {
    const now = new Date();
    const startDate = new Date(discount.effective_datetime);
    const endDate = new Date(discount.expr_datetime);
    return now >= startDate && now <= endDate;
  };

  const handleDelete = async (discountId: string) => {
    const discount = discounts.find(d => d.discount_id === discountId);
    if (!discount) {
      showError('Discount not found');
      return;
    }

    deleteDialog.openDeleteDialog(
      discount.discount_code,
      async () => {
        try {
          await discountApiService.deleteDiscount(discount.tenant_id, discount.store_id, discount.discount_id);
          showSuccess('Discount deleted successfully!');
          await loadDiscounts(); // Reload the list
        } catch (error) {
          console.error('Failed to delete discount:', error);
          showApiError('Failed to delete discount. Please try again.', undefined, '/v0/discount');
        }
      }
    );
  };

  const filteredDiscounts = (discounts || []).filter(discount => {
    const matchesSearch = discount.discount_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discount.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || discount.typcode === selectedType;
    const matchesStatus = !selectedStatus || 
                         (selectedStatus === 'active' && isDiscountActive(discount)) ||
                         (selectedStatus === 'inactive' && !isDiscountActive(discount));
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Discounts"
        description="Manage your store's discounts and promotional offers"
      >
        <Button
          onClick={() => navigate('/discounts/new')}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Discount</span>
        </Button>
      </PageHeader>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search discounts..."
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
            <option value="DISCOUNT">Discount</option>
            <option value="VOUCHER">Voucher</option>
            <option value="COUPON">Coupon</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <>
          {/* Discounts Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDiscounts.map(discount => (
                <DiscountCard
                  key={discount.discount_id}
                  discount={discount}
                  onEdit={(discount) => navigate(`/discounts/edit/${discount.discount_id}`)}
                  onView={(discount) => navigate(`/discounts/${discount.discount_id}`)}
                  onDelete={(id) => handleDelete(id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
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
                  {filteredDiscounts.map((discount) => (
                    <DiscountListItem
                      key={discount.discount_id}
                      discount={discount}
                      onEdit={(discount) => navigate(`/discounts/edit/${discount.discount_code}`)}
                      onView={(discount) => navigate(`/discounts/${discount.discount_code}`)}
                      onDelete={(id) => handleDelete(id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredDiscounts.length === 0 && (
            <div className="text-center py-12">
              <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No discounts found' : 'No discounts yet'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search or filter criteria.' : 'Get started by creating your first discount.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                    <Button
                      onClick={() => navigate('/discounts/new')}
                      className="inline-flex items-center"
                    >
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                      Add Discount
                    </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

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

// Discount Card Component for Grid View
const DiscountCard: React.FC<{
  discount: Discount;
  onEdit: (discount: Discount) => void;
  onView: (discount: Discount) => void;
  onDelete: (id: string) => void;
}> = ({ discount, onEdit, onView, onDelete }) => {

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
    if (discount.calculation_mthd_code === 'PERCENT' || discount.calculation_mthd_code === 'PROMPT_PERCENT') {
      return `${discount.percentage}%`;
    } else {
      return `$${discount.discount}`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
              <TagIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{discount.discount_code}</h3>
              <p className="text-sm text-gray-500">
                {discount.typcode}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onView(discount)}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(discount)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(discount.discount_id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {discount.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{discount.description}</p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PercentBadgeIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {getDiscountValue(discount)}
            </span>
          </div>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {discount.app_mthd_code === 'TRANSACTION' ? 'Transaction' : 
             discount.app_mthd_code === 'LINE_ITEM' ? 'Line Item' : 'Group'}
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>{formatDate(discount.effective_datetime)}</span>
            </div>
            <div className="text-xs mt-1">
              to {formatDate(discount.expr_datetime)}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <span className={`px-2 py-1 text-xs rounded-full ${
            isDiscountActive(discount)
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isDiscountActive(discount) ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Discount List Item Component for Table View
const DiscountListItem: React.FC<{
  discount: Discount;
  onEdit: (discount: Discount) => void;
  onView: (discount: Discount) => void;
  onDelete: (id: string) => void;
}> = ({ discount, onEdit, onView, onDelete }) => {

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
    if (discount.calculation_mthd_code === 'PERCENT' || discount.calculation_mthd_code === 'PROMPT_PERCENT') {
      return `${discount.percentage}%`;
    } else {
      return `$${discount.discount}`;
    }
  };

  return (
    <tr className="hover:bg-gray-50">
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
              {discount.app_mthd_code === 'TRANSACTION' ? 'Transaction' : 
               discount.app_mthd_code === 'LINE_ITEM' ? 'Line Item' : 'Group'}
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
            {discount.calculation_mthd_code === 'PERCENT' || discount.calculation_mthd_code === 'PROMPT_PERCENT' ? 'Percentage' : 'Fixed Amount'}
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
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onView(discount)}
            className="text-gray-600 hover:text-gray-900"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(discount)}
            className="text-blue-600 hover:text-blue-900"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(discount.discount_id)}
            className="text-red-600 hover:text-red-900"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default Discounts;
