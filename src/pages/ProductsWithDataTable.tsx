import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon,
  EyeIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import DataTable, { type Column } from '../components/ui/DataTable';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  discount: number;
  tax: number;
  category: string;
  inventory: number;
  status: 'active' | 'inactive';
  image?: string;
}

interface Category {
  id: string;
  name: string;
}

const ProductsWithDataTable: React.FC = () => {
  const { t } = useTranslation();
  const { currentTenant } = useTenantStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    description: '',
    price: 0,
    discount: 0,
    tax: 0,
    category: '',
    inventory: 0,
    status: 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCategories([
        { id: '1', name: 'Electronics' },
        { id: '2', name: 'Clothing' },
        { id: '3', name: 'Food & Beverages' },
        { id: '4', name: 'Books' },
        { id: '5', name: 'Home & Garden' },
      ]);
      
      setProducts([
        {
          id: '1',
          name: 'Wireless Headphones',
          sku: 'WH-001',
          description: 'High-quality wireless headphones with noise cancellation',
          price: 199.99,
          discount: 10,
          tax: 8.5,
          category: 'Electronics',
          inventory: 25,
          status: 'active',
          image: '/images/headphones.jpg',
        },
        {
          id: '2',
          name: 'Cotton T-Shirt',
          sku: 'CT-002',
          description: 'Comfortable cotton t-shirt in various colors',
          price: 29.99,
          discount: 0,
          tax: 8.5,
          category: 'Clothing',
          inventory: 150,
          status: 'active',
        },
        {
          id: '3',
          name: 'Coffee Beans',
          sku: 'CB-003',
          description: 'Premium arabica coffee beans, 1lb bag',
          price: 15.99,
          discount: 5,
          tax: 0,
          category: 'Food & Beverages',
          inventory: 75,
          status: 'active',
        },
        {
          id: '4',
          name: 'Programming Book',
          sku: 'PB-004',
          description: 'Learn React development from scratch',
          price: 49.99,
          discount: 15,
          tax: 0,
          category: 'Books',
          inventory: 30,
          status: 'inactive',
        },
        {
          id: '5',
          name: 'Smart Watch',
          sku: 'SW-005',
          description: 'Advanced fitness tracking smartwatch',
          price: 299.99,
          discount: 20,
          tax: 8.5,
          category: 'Electronics',
          inventory: 45,
          status: 'active',
        },
        {
          id: '6',
          name: 'Organic Tea',
          sku: 'OT-006',
          description: 'Premium organic green tea blend',
          price: 24.99,
          discount: 0,
          tax: 0,
          category: 'Food & Beverages',
          inventory: 120,
          status: 'active',
        },
        // Add more products for pagination demo
        ...Array.from({ length: 20 }, (_, i) => ({
          id: `${i + 7}`,
          name: `Product ${i + 7}`,
          sku: `PRD-${String(i + 7).padStart(3, '0')}`,
          description: `Description for product ${i + 7}`,
          price: Math.random() * 100 + 10,
          discount: Math.random() * 20,
          tax: 8.5,
          category: categories[Math.floor(Math.random() * 5)]?.name || 'Electronics',
          inventory: Math.floor(Math.random() * 200),
          status: Math.random() > 0.2 ? 'active' : 'inactive' as 'active' | 'inactive',
        })),
      ]);
      
      setIsLoading(false);
    };

    fetchData();
  }, [currentTenant]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'discount' || name === 'tax' || name === 'inventory' 
        ? parseFloat(value) || 0 
        : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.inventory === undefined || formData.inventory < 0) newErrors.inventory = 'Inventory must be 0 or greater';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (editingProduct) {
        // Update existing product
        setProducts(prev => prev.map(p => 
          p.id === editingProduct.id 
            ? { ...p, ...formData } as Product
            : p
        ));
      } else {
        // Add new product
        const newProduct: Product = {
          ...formData as Product,
          id: Date.now().toString(),
        };
        setProducts(prev => [...prev, newProduct]);
      }
      
      handleCloseForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      description: '',
      price: 0,
      discount: 0,
      tax: 0,
      category: '',
      inventory: 0,
      status: 'active',
    });
    setErrors({});
  };

  const getStatusBadge = (status: Product['status']) => {
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
        status === 'active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {status === 'active' ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getInventoryStatus = (inventory: number) => {
    if (inventory === 0) return { color: 'text-red-600', label: 'Out of Stock' };
    if (inventory < 20) return { color: 'text-yellow-600', label: 'Low Stock' };
    return { color: 'text-green-600', label: 'In Stock' };
  };

  // Filter products by category
  const filteredProducts = selectedCategory 
    ? products.filter(product => product.category === selectedCategory)
    : products;

  // Define table columns
  const columns: Column<Product>[] = [
    {
      key: 'name',
      title: 'Product',
      sortable: true,
      render: (value, product) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <PhotoIcon className="h-6 w-6 text-slate-400" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-slate-900">{product.name}</div>
            <div className="text-sm text-slate-500">{product.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'sku',
      title: 'SKU',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-slate-900">{value}</span>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-slate-700">{value}</span>
      ),
    },
    {
      key: 'price',
      title: 'Price',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-semibold text-slate-900">${value.toFixed(2)}</span>
      ),
    },
    {
      key: 'inventory',
      title: 'Inventory',
      sortable: true,
      render: (value, product) => {
        const status = getInventoryStatus(product.inventory);
        return (
          <div>
            <div className="text-sm font-medium text-slate-900">{value}</div>
            <div className={`text-xs ${status.color}`}>
              {status.label}
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, product) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(product)}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(product.id)}
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products (DataTable Demo)</h1>
          <p className="text-slate-500 mt-1">
            {currentTenant ? `${currentTenant.name} - ` : ''}
            Manage your product catalog with the new modular DataTable component
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Export
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </button>
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-2xl mb-4">
                <PhotoIcon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-slate-900">{products.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-2xl mb-4">
                <EyeIcon className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Active Products</p>
              <p className="text-3xl font-bold text-slate-900">
                {products.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-2xl mb-4">
                <PhotoIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Low Stock</p>
              <p className="text-3xl font-bold text-slate-900">
                {products.filter(p => p.inventory < 20).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-2xl mb-4">
                <PhotoIcon className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Categories</p>
              <p className="text-3xl font-bold text-slate-900">{categories.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* DataTable with built-in search, sorting, and pagination */}
      <DataTable
        data={filteredProducts}
        columns={columns}
        loading={isLoading}
        searchable={true}
        searchPlaceholder="Search products by name, SKU, or description..."
        searchFields={['name', 'sku', 'description']}
        filterable={true}
        filters={
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        }
        pagination={true}
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        defaultSort={{ key: 'name', direction: 'asc' }}
        onRowClick={(product) => {
          console.log('Clicked product:', product);
          // You could navigate to product detail page here
        }}
        emptyState={
          <div className="text-center py-12">
            <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">No products found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Try adjusting your search or filter criteria.
            </p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        }
      />

      {/* Product Form Modal - Same as before */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-2xl bg-white border-slate-200">
            <Card className="border-0 shadow-none">
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-1">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {editingProduct ? 'Update product information' : 'Add a new product to your catalog'}
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Product Name"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      error={errors.name}
                      required
                    />
                    
                    <Input
                      label="SKU"
                      name="sku"
                      value={formData.sku || ''}
                      onChange={handleInputChange}
                      error={errors.sku}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Price ($)"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      error={errors.price}
                      required
                    />
                    
                    <Input
                      label="Inventory"
                      name="inventory"
                      type="number"
                      value={formData.inventory || ''}
                      onChange={handleInputChange}
                      error={errors.inventory}
                      required
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Category</label>
                      <select
                        name="category"
                        value={formData.category || ''}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-sm text-red-600">{errors.category}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <Button type="submit">
                      {editingProduct ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsWithDataTable;
