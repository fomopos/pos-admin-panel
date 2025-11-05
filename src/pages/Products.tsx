import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  PlusIcon, 
  Squares2X2Icon, 
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { PageHeader, Button, ConfirmDialog, Loading, Alert, PageContainer, H4, Body1, Body2, Caption, DataTable, AdvancedSearchFilter } from '../components/ui';
import type { Column, FilterConfig, ViewMode } from '../components/ui';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';
import { useError } from '../hooks/useError';
import { useCategories } from '../hooks/useCategories';
import { useTenantStore } from '../tenants/tenantStore';
import { productService } from '../services/product';
import { useCurrencyFormatter } from '../utils/currencyUtils';

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
  categoryName: string; // Display name for the category
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

const ProductCard: React.FC<{ 
  product: Product; 
  onEdit: (product: Product) => void; 
  onDelete: (id: string) => void;
  formatCurrency: (amount: string | number) => string;
}> = ({
  product,
  onEdit,
  onDelete,
  formatCurrency,
}) => {
  const { t } = useTranslation();
  const stockStatus = product.stockQuantity <= product.minStockLevel ? 'low' : 'normal';
  const isOutOfStock = product.stockQuantity === 0;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6 hover:shadow-md transition-all duration-200 hover:border-primary-200 group">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <H4 className="truncate group-hover:text-primary-600 transition-colors">
            {product.name}
          </H4>
          <Caption color="muted" className="mt-1 font-mono">{product.sku}</Caption>
          <Body2 color="secondary" className="mt-1 sm:mt-2 line-clamp-2">{product.description}</Body2>
        </div>
        <div className="flex space-x-1 ml-2 sm:ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(product)}
            className="opacity-0 group-hover:opacity-100 transition-all"
          >
            {t('common.edit')}
          </Button>
          <Button
            variant="destructive"  
            size="sm"
            onClick={() => onDelete(product.id)}
            className="opacity-0 group-hover:opacity-100 transition-all"
          >
            {t('common.delete')}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
          <Caption color="muted" className="uppercase tracking-wide">Price</Caption>
          <Body1 weight="semibold" className="text-green-600">{formatCurrency(product.price)}</Body1>
          <Caption color="muted">Cost: {formatCurrency(product.cost)}</Caption>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
          <Caption color="muted" className="uppercase tracking-wide">Stock</Caption>
          <Body1 weight="semibold" className={
            isOutOfStock ? 'text-red-600' : 
            stockStatus === 'low' ? 'text-yellow-600' : 'text-gray-900'
          }>
            {product.stockQuantity} {product.unit}
          </Body1>
          <Caption color="muted">Min: {product.minStockLevel}</Caption>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Caption className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
            {product.categoryName || product.category || 'Uncategorized'}
          </Caption>
          {product.tags.length > 0 && (
            <Caption className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 text-blue-700 rounded-full">
              +{product.tags.length} {t('products.grid.tags')}
            </Caption>
          )}
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Caption className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium ${
            product.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.isActive ? t('products.status.active') : t('products.status.inactive')}
          </Caption>
          {isOutOfStock && (
            <Caption className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-red-100 text-red-800 rounded-full font-medium">
              {t('products.status.outOfStock')}
            </Caption>
          )}
          {stockStatus === 'low' && !isOutOfStock && (
            <Caption className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
              {t('products.status.lowStock')}
            </Caption>
          )}
        </div>
      </div>
    </div>
  );
};

// Advanced Filter Panel Component
const Products: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentTenant, currentStore } = useTenantStore();
  const { categoryOptions, getCategoryNames } = useCategories({
    tenantId: currentTenant?.id,
    storeId: currentStore?.store_id,
    autoLoad: true
  });
  const formatCurrency = useCurrencyFormatter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
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
  
  const allTags = Array.from(new Set(products.flatMap(p => p.tags)));

  // Filter configuration for AdvancedSearchFilter
  const filterConfigs: FilterConfig[] = [
    {
      key: 'category',
      label: t('products.filters.category'),
      type: 'dropdown',
      options: [
        { id: '', label: t('products.filters.allCategories') },
        ...categoryOptions
      ],
      value: selectedCategory
    },
    {
      key: 'status',
      label: t('products.filters.status'),
      type: 'dropdown',
      options: [
        { id: 'all', label: t('products.filters.allStatuses') },
        { id: 'active', label: t('products.filters.active') },
        { id: 'inactive', label: t('products.filters.inactive') }
      ],
      value: advancedFilters.status
    },
    {
      key: 'tags',
      label: t('products.filters.tags'),
      type: 'multiselect',
      options: allTags.map(t => ({ id: t, label: t })),
      value: advancedFilters.tags
    }
  ];

  // Handle filter changes from AdvancedSearchFilter
  const handleFilterChange = (key: string, value: any) => {
    if (key === 'category') {
      setSelectedCategory(value as string);
    } else if (key === 'status') {
      setAdvancedFilters(prev => ({ ...prev, status: value as AdvancedFilters['status'] }));
    } else if (key === 'tags') {
      setAdvancedFilters(prev => ({ ...prev, tags: value as string[] }));
    }
  };

  // Active filters for badge display
  const activeFilters: Array<{ key: string; label: string; value: string; onRemove: () => void }> = [];
  
  if (searchTerm) {
    activeFilters.push({
      key: 'search',
      label: t('common.search'),
      value: searchTerm,
      onRemove: () => setSearchTerm('')
    });
  }
  
  if (selectedCategory) {
    const categoryLabel = categoryOptions.find(c => c.id === selectedCategory)?.label || selectedCategory;
    activeFilters.push({
      key: 'category',
      label: t('products.filters.category'),
      value: categoryLabel,
      onRemove: () => setSelectedCategory('')
    });
  }
  
  if (advancedFilters.status !== 'all') {
    activeFilters.push({
      key: 'status',
      label: t('products.filters.status'),
      value: advancedFilters.status === 'active' ? t('products.filters.active') : t('products.filters.inactive'),
      onRemove: () => setAdvancedFilters(prev => ({ ...prev, status: 'all' }))
    });
  }
  
  if (advancedFilters.tags.length > 0) {
    activeFilters.push({
      key: 'tags',
      label: t('products.filters.tags'),
      value: `${advancedFilters.tags.length} selected`,
      onRemove: () => setAdvancedFilters(prev => ({ ...prev, tags: [] }))
    });
  }

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
        // Fetch products from API
        const productsRes = await productService.getProducts(currentTenant.id, currentStore.store_id);

        // Get all unique category IDs from products
        const categoryIds = Array.from(new Set(
          productsRes.items
            .map((product: any) => product.categories || [])
            .flat()
            .filter(Boolean)
        ));

        // Get category names for all categories used by products
        const categoryNames = await getCategoryNames(categoryIds);

        // Map API products to UI Product type with category names
        const mapped = productsRes.items.map((apiProduct: any) => {
          const categoryId = apiProduct.categories?.[0] || '';
          const categoryName = categoryNames[categoryId] || categoryId;
          
          return {
            id: apiProduct.item_id,
            name: apiProduct.name,
            description: apiProduct.description || '',
            price: apiProduct.list_price,
            cost: 0, // Not available in API, set to 0 or fetch if available
            sku: apiProduct.item_id,
            category: categoryId,
            categoryName: categoryName,
            stockQuantity: 0, // Not available in API, set to 0 or fetch if available
            minStockLevel: 0, // Not available in API, set to 0 or fetch if available
            unit: apiProduct.uom || '',
            supplier: '', // Not available in API
            barcode: '', // Not available in API
            tags: apiProduct.categories || [],
            isActive: apiProduct.active !== false,
            createdAt: new Date(apiProduct.created_at),
            updatedAt: new Date(apiProduct.updated_at),
          };
        });

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
  }, [currentTenant, currentStore, getCategoryNames, showErrorMessage]);

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

    return filtered;
  }, [products, searchTerm, selectedCategory, advancedFilters]);

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

  // Define DataTable columns
  const tableColumns = useMemo<Column<Product>[]>(() => [
    {
      key: 'name',
      title: t('products.table.product'),
      sortable: true,
      render: (_, product) => (
        <div>
          <Body2 weight="semibold" className="group-hover:text-primary-600 transition-colors">
            {product.name}
          </Body2>
          <Body2 color="muted" className="font-mono">{product.sku}</Body2>
          <Caption color="secondary" className="mt-1 truncate max-w-xs">{product.description}</Caption>
        </div>
      )
    },
    {
      key: 'category',
      title: t('products.table.category'),
      sortable: true,
      render: (_, product) => (
        <Caption className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-primary-100 text-primary-800">
          {product.categoryName || product.category || 'Uncategorized'}
        </Caption>
      )
    },
    {
      key: 'price',
      title: t('products.table.price'),
      sortable: true,
      render: (_, product) => (
        <div>
          <Body2 weight="semibold" className="text-green-600">{formatCurrency(product.price)}</Body2>
          <Caption color="muted">{t('products.table.cost')}: {formatCurrency(product.cost)}</Caption>
        </div>
      )
    },
    {
      key: 'stockQuantity',
      title: t('products.table.stock'),
      sortable: true,
      render: (_, product) => {
        const stockStatus = product.stockQuantity <= product.minStockLevel ? 'low' : 'normal';
        const isOutOfStock = product.stockQuantity === 0;
        
        return (
          <div>
            <div className="flex items-center space-x-2">
              <Body2 weight="semibold" className={
                isOutOfStock ? 'text-red-600' : 
                stockStatus === 'low' ? 'text-yellow-600' : 'text-gray-900'
              }>
                {product.stockQuantity} {product.unit}
              </Body2>
              {isOutOfStock && (
                <Caption className="inline-flex items-center px-1.5 py-0.5 rounded-full font-medium bg-red-100 text-red-800">
                  {t('products.status.outOfStock')}
                </Caption>
              )}
              {stockStatus === 'low' && !isOutOfStock && (
                <Caption className="inline-flex items-center px-1.5 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-800">
                  {t('products.status.lowStock')}
                </Caption>
              )}
            </div>
            <Caption color="muted">{t('products.table.min')}: {product.minStockLevel}</Caption>
          </div>
        );
      }
    },
    {
      key: 'isActive',
      title: t('products.table.status'),
      sortable: true,
      render: (_, product) => (
        <div className="flex flex-col space-y-1">
          <Caption className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${
            product.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.isActive ? t('products.status.active') : t('products.status.inactive')}
          </Caption>
          {product.tags.length > 0 && (
            <Caption className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              {product.tags.length} {t('products.grid.tags')}
            </Caption>
          )}
        </div>
      )
    },
    {
      key: 'id',
      title: t('products.table.actions'),
      sortable: false,
      render: (_, product) => (
        <div className="flex space-x-1 justify-end group/actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(product);
            }}
            className="relative p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all group/edit"
            title="Edit"
          >
            <PencilIcon className="w-4 h-4" />
            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover/edit:opacity-100 group-hover/edit:visible transition-all duration-200 pointer-events-none">
              Edit
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(product.id);
            }}
            className="relative p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-all group/delete"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover/delete:opacity-100 group-hover/delete:visible transition-all duration-200 pointer-events-none">
              Delete
            </span>
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ], [t, formatCurrency]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
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
      // Fetch products from API
      const productsRes = await productService.getProducts(currentTenant.id, currentStore.store_id);

      // Get all unique category IDs from products
      const categoryIds = Array.from(new Set(
        productsRes.items
          .map((product: any) => product.categories || [])
          .flat()
          .filter(Boolean)
      ));

      // Get category names for all categories used by products
      const categoryNames = await getCategoryNames(categoryIds);

      // Map API products to UI Product type with category names
      const mapped = productsRes.items.map((apiProduct: any) => {
        const categoryId = apiProduct.categories?.[0] || '';
        const categoryName = categoryNames[categoryId] || categoryId;
        
        return {
          id: apiProduct.item_id,
          name: apiProduct.name,
          description: apiProduct.description || '',
          price: apiProduct.list_price,
          cost: 0,
          sku: apiProduct.item_id,
          category: categoryId,
          categoryName: categoryName,
          stockQuantity: 0,
          minStockLevel: 0,
          unit: apiProduct.uom || '',
          supplier: '',
          barcode: '',
          tags: apiProduct.categories || [],
          isActive: apiProduct.active !== false,
          createdAt: new Date(apiProduct.created_at),
          updatedAt: new Date(apiProduct.updated_at),
        };
      });

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
      <PageContainer variant="default" spacing="md">
        <Loading
          title={t('products.loading.title')}
          description={t('products.loading.description')}
          fullScreen={false}
          size="lg"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="default" spacing="md">
      {/* Header */}
      <PageHeader
        title={t('products.title')}
        description={t('products.description')}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/global-modifiers')}
            className="flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>{t('products.addModifier')}</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/products/new')}
            className="flex items-center space-x-2"
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

      {/* Search and Filter */}
      <AdvancedSearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchLabel={t('products.search.label')}
        searchPlaceholder={t('products.search.placeholder')}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        enabledViews={['grid', 'list']}
        filters={filterConfigs}
        onFilterChange={handleFilterChange}
        activeFilters={activeFilters}
        totalResults={products.length}
        filteredResults={filteredProducts.length}
        showResultsCount={true}
        onClearAll={handleClearFilters}
        className="mb-4 sm:mb-6"
      />

      {/* Products Display */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}

      {(viewMode === 'list' || viewMode === 'table') && (
        <DataTable
          data={filteredProducts}
          columns={tableColumns}
          loading={false}
          searchable={false}
          pagination={true}
          pageSize={25}
          pageSizeOptions={[10, 25, 50, 100]}
          onRowClick={(product) => handleEdit(product)}
          searchFields={['name', 'sku', 'description']}
          defaultSort={{ key: 'name', direction: 'asc' }}
          emptyState={
            <div className="text-slate-500">
              <div className="text-lg font-medium mb-1">{t('products.empty.title')}</div>
              <div className="text-sm">{t('products.empty.description')}</div>
            </div>
          }
        />
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
    </PageContainer>
  );
};

export default Products;