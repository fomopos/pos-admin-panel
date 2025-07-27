import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { PageHeader, Button, ConfirmDialog, Loading, Alert } from '../components/ui';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';
import { useError } from '../hooks/useError';
import { useTenantStore } from '../tenants/tenantStore';
import { productService } from '../services/product';

// Types for advanced filters
interface PriceRange {
  min: number | '';
  max: number | '';
}

interface DateRange {
  start: string;
  end: string;
}

interface AdvancedFilters {
  priceRange: PriceRange;
  stockLevel: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
  suppliers: string[];
  tags: string[];
  dateRange: DateRange;
  status: 'all' | 'active' | 'inactive';
}

// Product interface definition
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  sku: string;
  category: string;
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  supplier: string;
  barcode: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductCard: React.FC<{ product: Product; onEdit: (product: Product) => void; onDelete: (id: string) => void }> = ({
  product,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const stockStatus = product.stockQuantity <= product.minStockLevel ? 'low' : 'normal';
  const isOutOfStock = product.stockQuantity === 0;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6 hover:shadow-md transition-all duration-200 hover:border-primary-200 group">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-mono">{product.sku}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 line-clamp-2">{product.description}</p>
        </div>
        <div className="flex space-x-1 ml-2 sm:ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(product)}
            className="text-primary-600 hover:text-primary-800 hover:bg-primary-50 opacity-0 group-hover:opacity-100 transition-all"
          >
            {t('common.edit')}
          </Button>
          <Button
            variant="ghost"  
            size="sm"
            onClick={() => onDelete(product.id)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
          >
            {t('common.delete')}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Price</span>
          <p className="font-semibold text-sm sm:text-lg text-green-600">${product.price}</p>
          <span className="text-xs text-gray-500">Cost: ${product.cost}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Stock</span>
          <p className={`font-semibold text-sm sm:text-lg ${
            isOutOfStock ? 'text-red-600' : 
            stockStatus === 'low' ? 'text-yellow-600' : 'text-gray-900'
          }`}>
            {product.stockQuantity} {product.unit}
          </p>
          <span className="text-xs text-gray-500">Min: {product.minStockLevel}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
            {product.category}
          </span>
          {product.tags.length > 0 && (
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              +{product.tags.length} {t('products.grid.tags')}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full font-medium ${
            product.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.isActive ? t('products.status.active') : t('products.status.inactive')}
          </span>
          {isOutOfStock && (
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
              {t('products.status.outOfStock')}
            </span>
          )}
          {stockStatus === 'low' && !isOutOfStock && (
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
              {t('products.status.lowStock')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductListItem: React.FC<{ 
  product: Product; 
  onEdit: (product: Product) => void; 
  onDelete: (id: string) => void;
  isEven?: boolean;
}> = ({
  product,
  onEdit,
  onDelete,
  isEven = false,
}) => {
  const { t } = useTranslation();
  const stockStatus = product.stockQuantity <= product.minStockLevel ? 'low' : 'normal';
  const isOutOfStock = product.stockQuantity === 0;
  
  return (
    <tr className={`hover:bg-primary-50 transition-colors group ${isEven ? 'bg-gray-25' : 'bg-white'}`}>
      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
        <div>
          <div className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {product.name}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 font-mono">{product.sku}</div>
          <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">{product.description}</div>
        </div>
      </td>
      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          {product.category}
        </span>
      </td>
      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
        <div className="text-xs sm:text-sm font-semibold text-green-600">${product.price}</div>
        <div className="text-xs text-gray-500">{t('products.table.cost')}: ${product.cost}</div>
      </td>
      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <span className={`text-xs sm:text-sm font-semibold ${
            isOutOfStock ? 'text-red-600' : 
            stockStatus === 'low' ? 'text-yellow-600' : 'text-gray-900'
          }`}>
            {product.stockQuantity} {product.unit}
          </span>
          {isOutOfStock && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {t('products.status.outOfStock')}
            </span>
          )}
          {stockStatus === 'low' && !isOutOfStock && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {t('products.status.lowStock')}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">{t('products.table.min')}: {product.minStockLevel}</div>
      </td>
      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
        <div className="flex flex-col space-y-1">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            product.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.isActive ? t('products.status.active') : t('products.status.inactive')}
          </span>
          {product.tags.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              {product.tags.length} {t('products.grid.tags')}
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
        <div className="flex space-x-1 sm:space-x-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(product)}
            className="text-primary-600 hover:text-primary-900 hover:bg-primary-50"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(product.id)}
            className="text-red-600 hover:text-red-900 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
};

// Advanced Filter Panel Component
const AdvancedFilterPanel: React.FC<{
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onClearFilters: () => void;
  suppliers: string[];
  allTags: string[];
}> = ({ filters, onFiltersChange, onClearFilters, suppliers, allTags }) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-6 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t('products.filters.advancedFilters')}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <XMarkIcon className="w-4 h-4" />
          <span>{t('products.filters.clearAll')}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Price Range */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">{t('products.filters.priceRange')}</label>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <input
                type="number"
                placeholder={t('products.filters.minPrice')}
                value={filters.priceRange.min}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  priceRange: { ...filters.priceRange, min: e.target.value === '' ? '' : Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <span className="text-gray-400 text-sm">{t('products.filters.to')}</span>
            <div className="flex-1">
              <input
                type="number"
                placeholder={t('products.filters.maxPrice')}
                value={filters.priceRange.max}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  priceRange: { ...filters.priceRange, max: e.target.value === '' ? '' : Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Stock Level */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">{t('products.filters.stockLevel')}</label>
          <select
            value={filters.stockLevel}
            onChange={(e) => onFiltersChange({
              ...filters,
              stockLevel: e.target.value as AdvancedFilters['stockLevel']
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="all">{t('products.filters.allStockLevels')}</option>
            <option value="in-stock">{t('products.filters.inStock')}</option>
            <option value="low-stock">{t('products.filters.lowStock')}</option>
            <option value="out-of-stock">{t('products.filters.outOfStock')}</option>
          </select>
        </div>

        {/* Status */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">{t('products.filters.productStatus')}</label>
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({
              ...filters,
              status: e.target.value as AdvancedFilters['status']
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="all">{t('products.filters.allStatus')}</option>
            <option value="active">{t('products.filters.activeProducts')}</option>
            <option value="inactive">{t('products.filters.inactiveProducts')}</option>
          </select>
        </div>

        {/* Suppliers */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            {t('products.filters.suppliers')} ({filters.suppliers.length} {t('products.filters.selected')})
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="space-y-2">
              {suppliers.map(supplier => (
                <label key={supplier} className="flex items-center cursor-pointer hover:bg-white rounded p-1 transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.suppliers.includes(supplier)}
                    onChange={(e) => {
                      const newSuppliers = e.target.checked
                        ? [...filters.suppliers, supplier]
                        : filters.suppliers.filter(s => s !== supplier);
                      onFiltersChange({ ...filters, suppliers: newSuppliers });
                    }}
                    className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 truncate">{supplier}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Product Tags ({filters.tags.length} selected)
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="space-y-2">
              {allTags.map(tag => (
                <label key={tag} className="flex items-center cursor-pointer hover:bg-white rounded p-1 transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.tags.includes(tag)}
                    onChange={(e) => {
                      const newTags = e.target.checked
                        ? [...filters.tags, tag]
                        : filters.tags.filter(t => t !== tag);
                      onFiltersChange({ ...filters, tags: newTags });
                    }}
                    className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {tag}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Created Date Range</label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateRange: { ...filters.dateRange, start: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateRange: { ...filters.dateRange, end: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Products: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentTenant, currentStore } = useTenantStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    priceRange: { min: '', max: '' },
    stockLevel: 'all',
    suppliers: [],
    tags: [],
    dateRange: { start: '', end: '' },
    status: 'all'
  });
  
  // Error management
  const { showErrorMessage } = useError();
  const [error, setError] = useState<string | null>(null);
  
  const deleteDialog = useDeleteConfirmDialog();
  
  const categories = Array.from(new Set(products.map(p => p.category)));
  const suppliers = Array.from(new Set(products.map(p => p.supplier)));
  const allTags = Array.from(new Set(products.flatMap(p => p.tags)));

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      if (!currentTenant || !currentStore) {
        setProducts([]);
        setError('Please select a tenant and store to view products.');
        return;
      }
      
      setIsLoading(true);
      setError(null); // Clear any previous errors
      
      try {
        const res = await productService.getProducts(currentTenant.id, currentStore.store_id);
        // Map API products to UI Product type
        const mapped = res.items.map(apiProduct => ({
          id: apiProduct.item_id,
          name: apiProduct.name,
          description: apiProduct.description || '',
          price: apiProduct.list_price,
          cost: 0, // Not available in API, set to 0 or fetch if available
          sku: apiProduct.item_id,
          category: apiProduct.categories?.[0] || '',
          stockQuantity: 0, // Not available in API, set to 0 or fetch if available
          minStockLevel: 0, // Not available in API, set to 0 or fetch if available
          unit: apiProduct.uom || '',
          supplier: '', // Not available in API
          barcode: '', // Not available in API
          tags: apiProduct.categories || [],
          isActive: apiProduct.active !== false,
          createdAt: new Date(apiProduct.created_at),
          updatedAt: new Date(apiProduct.updated_at),
        }));
        setProducts(mapped);
        // Clear any existing errors on successful load
        setError(null);
      } catch (error) {
        console.error('Failed to fetch products', error);
        setError('Failed to load products. Please check your connection and try again.');
        // Also show error notification
        showErrorMessage('Failed to load products. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [currentTenant, currentStore, showErrorMessage]);

  // Cleanup effect to clear errors when component unmounts
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Basic search
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      // Advanced filters
      const matchesPriceRange = (
        (advancedFilters.priceRange.min === '' || product.price >= advancedFilters.priceRange.min) &&
        (advancedFilters.priceRange.max === '' || product.price <= advancedFilters.priceRange.max)
      );
      
      const matchesStockLevel = (() => {
        switch (advancedFilters.stockLevel) {
          case 'in-stock':
            return product.stockQuantity > product.minStockLevel;
          case 'low-stock':
            return product.stockQuantity > 0 && product.stockQuantity <= product.minStockLevel;
          case 'out-of-stock':
            return product.stockQuantity === 0;
          default:
            return true;
        }
      })();
      
      const matchesSuppliers = advancedFilters.suppliers.length === 0 || 
                              advancedFilters.suppliers.includes(product.supplier);
      
      const matchesTags = advancedFilters.tags.length === 0 || 
                         advancedFilters.tags.some(tag => product.tags.includes(tag));
      
      const matchesStatus = advancedFilters.status === 'all' || 
                           (advancedFilters.status === 'active' && product.isActive) ||
                           (advancedFilters.status === 'inactive' && !product.isActive);
      
      const matchesDateRange = (() => {
        if (!advancedFilters.dateRange.start && !advancedFilters.dateRange.end) return true;
        const productDate = product.createdAt.toISOString().split('T')[0];
        const startDate = advancedFilters.dateRange.start;
        const endDate = advancedFilters.dateRange.end;
        
        if (startDate && endDate) {
          return productDate >= startDate && productDate <= endDate;
        } else if (startDate) {
          return productDate >= startDate;
        } else if (endDate) {
          return productDate <= endDate;
        }
        return true;
      })();
      
      return matchesSearch && matchesCategory && matchesPriceRange && 
             matchesStockLevel && matchesSuppliers && matchesTags && 
             matchesStatus && matchesDateRange;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stockQuantity - b.stockQuantity;
          break;
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, advancedFilters, sortBy, sortOrder]);

  const handleEdit = (product: Product) => {
    navigate(`/products/edit/${product.id}`);
  };

  const handleDelete = (id: string) => {
    const product = products.find(p => p.id === id);
    const productName = product ? product.name : 'this product';
    
    deleteDialog.openDeleteDialog(productName, async () => {
      if (!currentTenant || !currentStore) {
        setError('Tenant or store not selected. Please refresh the page and try again.');
        showErrorMessage('Tenant or store not selected. Please refresh the page and try again.');
        return;
      }

      try {
        await productService.deleteProduct(currentTenant.id, currentStore.store_id, id);
        setProducts(products.filter(p => p.id !== id));
        console.log('Product deleted successfully');
        // Clear any existing errors on successful operation
        setError(null);
      } catch (error) {
        console.error('Failed to delete product:', error);
        const errorMessage = 'Failed to delete product. Please check your connection and try again.';
        setError(errorMessage);
        showErrorMessage(errorMessage);
      }
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('name');
    setSortOrder('asc');
    setAdvancedFilters({
      priceRange: { min: '', max: '' },
      stockLevel: 'all',
      suppliers: [],
      tags: [],
      dateRange: { start: '', end: '' },
      status: 'all'
    });
  };

  // Helper function to clear errors
  const clearError = () => {
    setError(null);
  };

  // Retry function to refetch products
  const retryFetchProducts = async () => {
    if (!currentTenant || !currentStore) {
      setError('Please select a tenant and store to view products.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await productService.getProducts(currentTenant.id, currentStore.store_id);
      const mapped = res.items.map(apiProduct => ({
        id: apiProduct.item_id,
        name: apiProduct.name,
        description: apiProduct.description || '',
        price: apiProduct.list_price,
        cost: 0,
        sku: apiProduct.item_id,
        category: apiProduct.categories?.[0] || '',
        stockQuantity: 0,
        minStockLevel: 0,
        unit: apiProduct.uom || '',
        supplier: '',
        barcode: '',
        tags: apiProduct.categories || [],
        isActive: apiProduct.active !== false,
        createdAt: new Date(apiProduct.created_at),
        updatedAt: new Date(apiProduct.updated_at),
      }));
      setProducts(mapped);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch products', error);
      setError('Failed to load products. Please check your connection and try again.');
      showErrorMessage('Failed to load products. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveFilters = searchTerm || selectedCategory || 
    advancedFilters.priceRange.min !== '' || advancedFilters.priceRange.max !== '' ||
    advancedFilters.stockLevel !== 'all' || advancedFilters.suppliers.length > 0 ||
    advancedFilters.tags.length > 0 || advancedFilters.dateRange.start ||
    advancedFilters.dateRange.end || advancedFilters.status !== 'all';

  // Show loading spinner
  if (isLoading) {
    return (
      <Loading
        title={t('products.loading.title')}
        description={t('products.loading.description')}
        fullScreen={false}
        size="lg"
      />
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <PageHeader
        title={t('products.title')}
        description={t('products.description')}
      >
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/global-modifiers')}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <PlusIcon className="w-5 h-5" />
            <span>{t('products.addModifier')}</span>
          </Button>
          <Button
            onClick={() => navigate('/products/new')}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusIcon className="w-5 h-5" />
            <span>{t('products.addProduct')}</span>
          </Button>
        </div>
      </PageHeader>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" onClose={clearError} className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retryFetchProducts}
              disabled={isLoading}
              className="ml-4 border-red-300 text-red-700 hover:bg-red-50"
            >
              {isLoading ? 'Retrying...' : 'Retry'}
            </Button>
          </div>
        </Alert>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('products.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">{t('products.filters.allCategories')}</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <Button
            variant={showAdvancedFilters ? "primary" : "outline"}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center space-x-2"
          >
            <FunnelIcon className="w-4 h-4" />
            <span>{t('products.filters.advancedFilters')}</span>
            {showAdvancedFilters ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
          </Button>
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{t('products.filters.activeFilters')}</span>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                      {t('common.search')}: {searchTerm}
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-1 text-primary-600 hover:text-primary-800"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                      {t('categories.title')}: {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory('')}
                        className="ml-1 text-primary-600 hover:text-primary-800"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {/* Show advanced filters summary */}
                  {advancedFilters.stockLevel !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                      {t('products.filters.stockLevel')}: {advancedFilters.stockLevel.replace('-', ' ')}
                    </span>
                  )}
                  {advancedFilters.status !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                      {t('common.status')}: {advancedFilters.status}
                    </span>
                  )}
                  {(advancedFilters.priceRange.min !== '' || advancedFilters.priceRange.max !== '') && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                      {t('products.results.price')}: ${advancedFilters.priceRange.min || '0'} - ${advancedFilters.priceRange.max || '∞'}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm" 
                onClick={handleClearFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                {t('products.filters.clearAllFilters')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <AdvancedFilterPanel
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          onClearFilters={handleClearFilters}
          suppliers={suppliers}
          allTags={allTags}
        />
      )}

      {/* Results Summary and Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filteredProducts.length}</span> {t('products.results.productsFound')}
            {hasActiveFilters && (
              <span className="text-gray-500"> ({t('products.results.filteredFrom')} {products.length} {t('products.results.total')})</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">{t('products.results.sortBy')}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="name">{t('products.results.name')}</option>
              <option value="price">{t('products.results.price')}</option>
              <option value="stock">{t('products.results.stock')}</option>
              <option value="created">{t('products.results.created')}</option>
            </select>
          </div>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Products Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Squares2X2Icon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-lg font-semibold text-gray-900">{filteredProducts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">In Stock</p>
              <p className="text-lg font-semibold text-gray-900">
                {filteredProducts.filter(p => p.stockQuantity > p.minStockLevel).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Low Stock</p>
              <p className="text-lg font-semibold text-gray-900">
                {filteredProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Out of Stock</p>
              <p className="text-lg font-semibold text-gray-900">
                {filteredProducts.filter(p => p.stockQuantity === 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('products.table.product')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('products.table.category')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('products.table.price')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('products.table.stock')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('products.table.status')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('products.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredProducts.map((product, index) => (
                <ProductListItem
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isEven={index % 2 === 0}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredProducts.length === 0 && !error && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Squares2X2Icon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('products.empty.title')}</h3>
          {hasActiveFilters ? (
            <div className="space-y-4">
              <p className="text-gray-500 max-w-md mx-auto">
                {t('products.empty.description')}
              </p>
              <Button
                onClick={handleClearFilters}
                className="mx-auto"
              >
                {t('products.filters.clearAllFilters')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-500 max-w-md mx-auto">
                {t('products.empty.createFirst')}
              </p>
              <Button
                onClick={() => navigate('/products/new')}
                className="mx-auto flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Your First Product</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.dialogState.isOpen}
        title={deleteDialog.dialogState.title}
        message={deleteDialog.dialogState.message}
        onConfirm={deleteDialog.handleConfirm}
        onClose={deleteDialog.closeDialog}
        variant={deleteDialog.dialogState.variant}
        confirmText={deleteDialog.dialogState.confirmText}
        cancelText={deleteDialog.dialogState.cancelText}
        isLoading={deleteDialog.dialogState.isLoading}
      />
    </div>
  );
};

export default Products;