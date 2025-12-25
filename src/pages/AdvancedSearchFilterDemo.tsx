import React, { useState, useMemo } from 'react';
import { 
  AdvancedSearchFilter, 
  PageHeader, 
  PageContainer,
  Widget,
  DataTable,
  type FilterConfig,
  type ViewMode,
  type Column
} from '../components/ui';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ExampleProduct {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive';
  price: number;
  stock: number;
  createdAt: string;
}

const AdvancedSearchFilterDemo: React.FC = () => {
  // Mock data
  const allProducts: ExampleProduct[] = useMemo(() => [
    { id: '1', name: 'Laptop Pro', category: 'Electronics', status: 'active', price: 1299, stock: 15, createdAt: '2024-01-15' },
    { id: '2', name: 'Wireless Mouse', category: 'Electronics', status: 'active', price: 29, stock: 50, createdAt: '2024-02-20' },
    { id: '3', name: 'Desk Chair', category: 'Furniture', status: 'active', price: 199, stock: 8, createdAt: '2024-01-10' },
    { id: '4', name: 'Coffee Maker', category: 'Appliances', status: 'inactive', price: 89, stock: 0, createdAt: '2024-03-05' },
    { id: '5', name: 'Notebook Set', category: 'Stationery', status: 'active', price: 15, stock: 100, createdAt: '2024-02-15' },
    { id: '6', name: 'Water Bottle', category: 'Accessories', status: 'active', price: 19, stock: 75, createdAt: '2024-01-25' },
    { id: '7', name: 'Backpack', category: 'Accessories', status: 'active', price: 49, stock: 30, createdAt: '2024-02-28' },
    { id: '8', name: 'Smartphone', category: 'Electronics', status: 'active', price: 799, stock: 20, createdAt: '2024-03-10' },
    { id: '9', name: 'Desk Lamp', category: 'Furniture', status: 'active', price: 35, stock: 40, createdAt: '2024-01-20' },
    { id: '10', name: 'USB Cable', category: 'Electronics', status: 'inactive', price: 9, stock: 200, createdAt: '2024-02-10' },
  ], []);

  // State
  const [searchValue, setSearchValue] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [stockLevel, setStockLevel] = useState('');

  // Filter options
  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(allProducts.map(p => p.category)));
    return categories.map(cat => ({
      id: cat,
      label: cat,
      description: `${allProducts.filter(p => p.category === cat).length} products`
    }));
  }, [allProducts]);

  const statusOptions = [
    { id: 'active', label: 'Active', description: 'Currently available' },
    { id: 'inactive', label: 'Inactive', description: 'Not available' }
  ];

  const stockOptions = [
    { id: 'all', label: 'All Stock Levels', description: 'No filter' },
    { id: 'in-stock', label: 'In Stock', description: 'Stock > 0' },
    { id: 'low-stock', label: 'Low Stock', description: 'Stock < 20' },
    { id: 'out-of-stock', label: 'Out of Stock', description: 'Stock = 0' }
  ];

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      key: 'category',
      label: 'Category',
      type: 'dropdown',
      options: categoryOptions,
      value: selectedCategory,
      placeholder: 'All Categories'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'dropdown',
      options: statusOptions,
      value: selectedStatus,
      placeholder: 'All Status'
    },
    {
      key: 'stock',
      label: 'Stock Level',
      type: 'dropdown',
      options: stockOptions,
      value: stockLevel,
      placeholder: 'All Stock Levels'
    }
  ];

  // Filter logic
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      // Search filter
      const matchesSearch = 
        product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        product.category.toLowerCase().includes(searchValue.toLowerCase()) ||
        product.id.toLowerCase().includes(searchValue.toLowerCase());

      // Category filter
      const matchesCategory = !selectedCategory || product.category === selectedCategory;

      // Status filter
      const matchesStatus = !selectedStatus || product.status === selectedStatus;

      // Stock level filter
      const matchesStock = !stockLevel || stockLevel === 'all' ||
        (stockLevel === 'in-stock' && product.stock > 0) ||
        (stockLevel === 'low-stock' && product.stock < 20 && product.stock > 0) ||
        (stockLevel === 'out-of-stock' && product.stock === 0);

      // Price range filter
      const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
      const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesStatus && matchesStock && matchesPrice;
    });
  }, [allProducts, searchValue, selectedCategory, selectedStatus, stockLevel, priceRange]);

  // Active filters
  const activeFilters = useMemo(() => {
    const filters = [];

    if (selectedCategory) {
      filters.push({
        key: 'category',
        label: 'Category',
        value: selectedCategory,
        onRemove: () => setSelectedCategory('')
      });
    }

    if (selectedStatus) {
      filters.push({
        key: 'status',
        label: 'Status',
        value: selectedStatus,
        onRemove: () => setSelectedStatus('')
      });
    }

    if (stockLevel && stockLevel !== 'all') {
      filters.push({
        key: 'stock',
        label: 'Stock',
        value: stockOptions.find(o => o.id === stockLevel)?.label || stockLevel,
        onRemove: () => setStockLevel('')
      });
    }

    if (priceRange.min || priceRange.max) {
      filters.push({
        key: 'price',
        label: 'Price Range',
        value: `$${priceRange.min || '0'} - $${priceRange.max || '∞'}`,
        onRemove: () => setPriceRange({ min: '', max: '' })
      });
    }

    return filters;
  }, [selectedCategory, selectedStatus, stockLevel, priceRange, stockOptions]);

  // Handlers
  const handleFilterChange = (key: string, value: any) => {
    switch (key) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'status':
        setSelectedStatus(value);
        break;
      case 'stock':
        setStockLevel(value);
        break;
      default:
        break;
    }
  };

  const handleClearAll = () => {
    setSearchValue('');
    setSelectedCategory('');
    setSelectedStatus('');
    setStockLevel('');
    setPriceRange({ min: '', max: '' });
  };

  // Table columns
  const columns: Column<ExampleProduct>[] = [
    {
      key: 'name',
      title: 'Product Name',
      sortable: true
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'price',
      title: 'Price',
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      key: 'stock',
      title: 'Stock',
      sortable: true,
      render: (value) => (
        <span className={
          value === 0 ? 'text-red-600' :
          value < 20 ? 'text-yellow-600' : 'text-green-600'
        }>
          {value}
        </span>
      )
    }
  ];

  // Render products based on view mode
  const renderProducts = () => {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-medium text-slate-900">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Price:</span>
                  <span className="font-semibold text-green-600">${product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Stock:</span>
                  <span className={`font-medium ${
                    product.stock === 0 ? 'text-red-600' :
                    product.stock < 20 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {product.stock}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (viewMode === 'list') {
      return (
        <div className="space-y-3">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{product.category}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <div className="text-slate-500">Price</div>
                    <div className="font-semibold text-green-600">${product.price.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500">Stock</div>
                    <div className={`font-medium ${
                      product.stock === 0 ? 'text-red-600' :
                      product.stock < 20 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {product.stock}
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Table view
    return (
      <DataTable
        data={filteredProducts}
        columns={columns}
        searchable={false}
        pagination={true}
        pageSize={10}
      />
    );
  };

  return (
    <PageContainer variant="default" spacing="lg">
      <PageHeader
        title="Advanced Search & Filter Demo"
        description="Demonstration of the reusable AdvancedSearchFilter component with all features"
      >
        <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </PageHeader>

      {/* Advanced Search Filter Component */}
      <AdvancedSearchFilter
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search products by name, category, or ID..."
        searchFields={['name', 'category', 'id']}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        enabledViews={['grid', 'list', 'table']}
        filters={filters}
        onFilterChange={handleFilterChange}
        showAdvancedFilters={showAdvancedFilters}
        onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
        activeFilters={activeFilters}
        totalResults={allProducts.length}
        filteredResults={filteredProducts.length}
        showResultsCount={true}
        onClearAll={handleClearAll}
      />

      {/* Products Display */}
      <Widget
        title="Products"
        description={`Viewing ${filteredProducts.length} of ${allProducts.length} products`}
      >
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-2">No products found</div>
            <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          renderProducts()
        )}
      </Widget>
    </PageContainer>
  );
};

export default AdvancedSearchFilterDemo;
