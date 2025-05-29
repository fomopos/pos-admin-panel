import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  Squares2X2Icon,
  ListBulletIcon,
  EllipsisVerticalIcon,
  HeartIcon,
  CogIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid 
} from '@heroicons/react/24/solid';
import { useTenantStore } from '../tenants/tenantStore';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import type { 
  Product as NewProduct,
  ProductFormErrors
} from '../services/types/product.types';

// Legacy Product interface for backward compatibility with existing data
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
  rating?: number;
  isFavorite?: boolean;
  soldCount?: number;
  brand?: string;
}

interface Category {
  id: string;
  name: string;
}

const Products: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenantStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState<Partial<NewProduct>>({
    store_id: '',
    name: '',
    description: '',
    uom: 'EACH',
    brand: '',
    tax_group: '',
    fiscal_id: '',
    stock_status: 'in_stock',
    pricing: {
      list_price: 0,
      sale_price: 0,
      tare_value: 0,
      tare_uom: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_discount_value: 0,
      max_discount_value: 0
    },
    settings: {
      track_inventory: false,
      allow_backorder: false,
      require_serial: false,
      taxable: true,
      measure_required: false,
      non_inventoried: false,
      shippable: true,
      serialized: false,
      active: true,
      disallow_discount: false,
      online_only: false
    },
    prompts: {
      prompt_qty: false,
      prompt_price: false,
      prompt_weight: 0,
      prompt_uom: false,
      prompt_description: false,
      prompt_cost: false,
      prompt_serial: false,
      prompt_lot: false,
      prompt_expiry: false
    },
    attributes: {
      manufacturer: '',
      model_number: '',
      category_id: '',
      tags: [],
      custom_attributes: {},
      properties: {}
    },
    media: {
      image_url: ''
    }
  });
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [activeTab, setActiveTab] = useState('basic');

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
          tax: 8,
          category: 'Electronics',
          inventory: 50,
          status: 'active',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
          rating: 4.5,
          isFavorite: false,
          soldCount: 234,
          brand: 'TechSound'
        },
        {
          id: '2',
          name: 'Coffee Beans',
          sku: 'CB-002',
          description: 'Premium organic coffee beans from Colombia',
          price: 24.99,
          discount: 0,
          tax: 0,
          category: 'Food & Beverages',
          inventory: 120,
          status: 'active',
          image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300',
          rating: 4.8,
          isFavorite: true,
          soldCount: 156,
          brand: 'CoffeeMaster'
        },
        {
          id: '3',
          name: 'Cotton T-Shirt',
          sku: 'TS-003',
          description: 'Comfortable 100% cotton t-shirt in various colors',
          price: 29.99,
          discount: 15,
          tax: 5,
          category: 'Clothing',
          inventory: 200,
          status: 'active',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
          rating: 4.2,
          isFavorite: false,
          soldCount: 89,
          brand: 'StyleCo'
        },
        {
          id: '4',
          name: 'JavaScript Handbook',
          sku: 'JS-004',
          description: 'Complete guide to modern JavaScript development',
          price: 39.99,
          discount: 5,
          tax: 0,
          category: 'Books',
          inventory: 75,
          status: 'active',
          image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',
          rating: 4.7,
          isFavorite: true,
          soldCount: 67,
          brand: 'TechBooks'
        },
        {
          id: '5',
          name: 'Garden Tools Set',
          sku: 'GT-005',
          description: 'Complete set of essential garden tools',
          price: 89.99,
          discount: 20,
          tax: 10,
          category: 'Home & Garden',
          inventory: 30,
          status: 'inactive',
          image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300',
          rating: 4.3,
          isFavorite: false,
          soldCount: 23,
          brand: 'GardenPro'
        }
      ]);
      
      setIsLoading(false);
    };

    fetchData();
  }, [currentTenant]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle nested field updates
    const updateNestedField = (path: string, val: any) => {
      const keys = path.split('.');
      if (keys.length === 1) {
        return { [keys[0]]: val };
      } else if (keys.length === 2) {
        const currentNestedValue = formData[keys[0] as keyof NewProduct] as any;
        return {
          [keys[0]]: {
            ...(currentNestedValue || {}),
            [keys[1]]: val
          }
        };
      }
      return {};
    };

    const processedValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked
      : type === 'number' 
      ? parseFloat(value) || 0 
      : value;

    setFormData(prev => ({
      ...prev,
      ...updateNestedField(name, processedValue)
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: ProductFormErrors = {};
    
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.store_id) newErrors.store_id = 'Store ID is required';
    if (!formData.uom) newErrors.uom = 'Unit of measure is required';
    if (!formData.pricing?.list_price || formData.pricing.list_price <= 0) newErrors.list_price = 'List price must be greater than 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create new product with legacy format for display
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name || '',
        sku: `PRD-${Date.now()}`,
        description: formData.description || '',
        price: formData.pricing?.list_price || 0,
        discount: 0,
        tax: 0,
        category: formData.brand || 'General',
        inventory: 0,
        status: formData.settings?.active ? 'active' : 'inactive',
        brand: formData.brand,
        image: formData.media?.image_url,
      };
      setProducts(prev => [...prev, newProduct]);
      
      handleCloseForm();
    }
  };

  const handleEdit = (product: Product) => {
    // Navigate to dedicated edit page instead of showing modal
    navigate(`/products/edit/${product.id}`);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      store_id: currentTenant?.id || '',
      name: '',
      description: '',
      uom: 'EACH',
      brand: '',
      tax_group: '',
      fiscal_id: '',
      stock_status: 'in_stock',
      pricing: {
        list_price: 0,
        sale_price: 0,
        tare_value: 0,
        tare_uom: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_discount_value: 0,
        max_discount_value: 0
      },
      settings: {
        track_inventory: false,
        allow_backorder: false,
        require_serial: false,
        taxable: true,
        measure_required: false,
        non_inventoried: false,
        shippable: true,
        serialized: false,
        active: true,
        disallow_discount: false,
        online_only: false
      },
      prompts: {
        prompt_qty: false,
        prompt_price: false,
        prompt_weight: 0,
        prompt_uom: false,
        prompt_description: false,
        prompt_cost: false,
        prompt_serial: false,
        prompt_lot: false,
        prompt_expiry: false
      },
      attributes: {
        manufacturer: '',
        model_number: '',
        category_id: '',
        tags: [],
        custom_attributes: {},
        properties: {}
      },
      media: {
        image_url: ''
      }
    });
    setErrors({});
    setActiveTab('basic');
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <ArchiveBoxIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">Manage your product inventory and catalog</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
      }`}>
        {filteredProducts.map((product) => (
          <div key={product.id} className="fadeIn">
            {viewMode === 'grid' ? (
              <ProductCard product={product} onEdit={handleEdit} onDelete={handleDelete} />
            ) : (
              <ProductListItem product={product} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <PhotoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Product Form Modal - Only for new products */}
      {showForm && (
        <ProductFormModal
          formData={formData}
          errors={errors}
          categories={categories}
          activeTab={activeTab}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
          onTabChange={setActiveTab}
        />
      )}
    </div>
  );
};

// Product Card Component
const ProductCard: React.FC<{
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}> = ({ product, onEdit, onDelete }) => {
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const inventoryStatus = getInventoryStatus(product.inventory);
  const discountedPrice = product.price * (1 - product.discount / 100);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="relative">
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PhotoIcon className="h-16 w-16 text-gray-300" />
            </div>
          )}
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full shadow-sm hover:bg-opacity-100 transition-all duration-200"
        >
          {isFavorite ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {product.status === 'active' ? (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Active
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
              Inactive
            </span>
          )}
        </div>

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
              -{product.discount}%
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
          </div>
          
          <div className="relative ml-2">
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200">
              <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIconSolid
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">{product.rating}</span>
            <span className="text-sm text-gray-400 ml-1">({product.soldCount} sold)</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {product.discount > 0 ? (
              <>
                <span className="text-xl font-bold text-gray-900">
                  ${discountedPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Inventory Status */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-sm font-medium ${inventoryStatus.color}`}>
            {inventoryStatus.text}
          </span>
          <span className="text-sm text-gray-500">
            {product.inventory} in stock
          </span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            onClick={() => onEdit(product)}
            className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-xl py-2 px-4 text-sm font-medium transition-all duration-200"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            onClick={() => onDelete(product.id)}
            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl py-2 px-4 text-sm font-medium transition-all duration-200"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Product List Item Component
const ProductListItem: React.FC<{
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}> = ({ product, onEdit, onDelete }) => {
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);
  const inventoryStatus = getInventoryStatus(product.inventory);
  const discountedPrice = product.price * (1 - product.discount / 100);

  return (
    <Card className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-200">
      <div className="p-6">
        <div className="flex items-center space-x-6">
          {/* Product Image */}
          <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PhotoIcon className="h-8 w-8 text-gray-300" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.brand} • SKU: {product.sku}</p>
                
                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">{product.rating}</span>
                    <span className="text-sm text-gray-400 ml-1">({product.soldCount} sold)</span>
                  </div>
                )}

                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              </div>

              {/* Price */}
              <div className="text-right ml-4">
                {product.discount > 0 ? (
                  <div>
                    <span className="text-xl font-bold text-gray-900">
                      ${discountedPrice.toFixed(2)}
                    </span>
                    <br />
                    <span className="text-sm text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="ml-2 px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
                      -{product.discount}%
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex flex-col items-end space-y-3 ml-4">
            <div className="flex items-center space-x-3">
              {product.status === 'active' ? (
                <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                  Active
                </span>
              ) : (
                <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
                  Inactive
                </span>
              )}
              
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                {isFavorite ? (
                  <HeartIconSolid className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <div className="text-right">
              <span className={`text-sm font-medium ${inventoryStatus.color}`}>
                {inventoryStatus.text}
              </span>
              <br />
              <span className="text-sm text-gray-500">
                {product.inventory} in stock
              </span>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => onEdit(product)}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => onDelete(product.id)}
                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Helper function for inventory status
const getInventoryStatus = (inventory: number) => {
  if (inventory === 0) return { color: 'text-red-600', text: 'Out of Stock' };
  if (inventory < 20) return { color: 'text-orange-600', text: 'Low Stock' };
  return { color: 'text-green-600', text: 'In Stock' };
};

// Product Form Modal Component (For new products only)
const ProductFormModal: React.FC<{
  formData: Partial<NewProduct>;
  errors: ProductFormErrors;
  categories: Category[];
  activeTab: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onTabChange: (tab: string) => void;
}> = ({ formData, errors, categories, activeTab, onInputChange, onSubmit, onClose, onTabChange }) => {
  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: ClipboardDocumentListIcon },
    { id: 'pricing', name: 'Pricing', icon: CurrencyDollarIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
    { id: 'attributes', name: 'Attributes', icon: TagIcon },
    { id: 'media', name: 'Media', icon: PhotoIcon },
  ];

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === tabs.length - 1;

  const handleNext = () => {
    if (!isLastTab) {
      onTabChange(tabs[currentTabIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (!isFirstTab) {
      onTabChange(tabs[currentTabIndex - 1].id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Add New Product
              </h2>
              <p className="text-blue-100 mt-1">
                Create a new product in your catalog
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Step {currentTabIndex + 1} of {tabs.length}</span>
              <span>{Math.round(((currentTabIndex + 1) / tabs.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-blue-500 bg-opacity-30 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentTabIndex + 1) / tabs.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-1 p-1 mx-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={onSubmit} className="flex-1 overflow-hidden">
          <div className="p-6 h-96 overflow-y-auto">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={onInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="Enter product name"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit of Measure *
                    </label>
                    <select
                      name="uom"
                      value={formData.uom || 'EACH'}
                      onChange={onInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.uom ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <option value="EACH">Each</option>
                      <option value="KG">Kilogram</option>
                      <option value="LB">Pound</option>
                      <option value="LTR">Liter</option>
                      <option value="GAL">Gallon</option>
                      <option value="BOX">Box</option>
                      <option value="PACK">Pack</option>
                    </select>
                    {errors.uom && <p className="text-red-600 text-sm mt-1">{errors.uom}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand || ''}
                      onChange={onInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter brand name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tax Group
                    </label>
                    <select
                      name="tax_group"
                      value={formData.tax_group || ''}
                      onChange={onInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Tax Group</option>
                      <option value="standard">Standard Tax</option>
                      <option value="reduced">Reduced Tax</option>
                      <option value="exempt">Tax Exempt</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={onInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter product description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fiscal Item ID
                    </label>
                    <input
                      type="text"
                      name="fiscal_id"
                      value={formData.fiscal_id || ''}
                      onChange={onInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter fiscal item ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Stock Status
                    </label>
                    <select
                      name="stock_status"
                      value={formData.stock_status || 'in_stock'}
                      onChange={onInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="on_order">On Order</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      List Price * ($)
                    </label>
                    <input
                      type="number"
                      name="pricing.list_price"
                      value={formData.pricing?.list_price || ''}
                      onChange={onInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.list_price ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.list_price && <p className="text-red-600 text-sm mt-1">{errors.list_price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sale Price ($)
                    </label>
                    <input
                      type="number"
                      name="pricing.sale_price"
                      value={formData.pricing?.sale_price || ''}
                      onChange={onInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tare Value
                    </label>
                    <input
                      type="number"
                      name="pricing.tare_value"
                      value={formData.pricing?.tare_value || ''}
                      onChange={onInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tare UOM
                    </label>
                    <select
                      name="pricing.tare_uom"
                      value={formData.pricing?.tare_uom || ''}
                      onChange={onInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Tare Unit</option>
                      <option value="KG">Kilogram</option>
                      <option value="LB">Pound</option>
                      <option value="GRAM">Gram</option>
                      <option value="OZ">Ounce</option>
                    </select>
                  </div>
                </div>

                {/* Price Summary */}
                {formData.pricing?.list_price && formData.pricing.list_price > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Price Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>List Price:</span>
                        <span>${formData.pricing.list_price?.toFixed(2)}</span>
                      </div>
                      {formData.pricing?.sale_price && formData.pricing.sale_price > 0 && formData.pricing.sale_price < formData.pricing.list_price && (
                        <div className="flex justify-between text-green-600">
                          <span>Sale Price:</span>
                          <span>${formData.pricing.sale_price.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Final Price:</span>
                        <span>
                          ${(formData.pricing?.sale_price && formData.pricing.sale_price > 0 && formData.pricing.sale_price < formData.pricing.list_price 
                            ? formData.pricing.sale_price 
                            : formData.pricing.list_price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      name="settings.disallow_discount"
                      id="disallow_discount"
                      checked={formData.settings?.disallow_discount || false}
                      onChange={onInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="disallow_discount" className="ml-2 text-sm font-medium text-gray-700">
                      Disallow Discount
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">
                    Check this box to prevent discounts from being applied to this product.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Product Settings Checkboxes */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Product Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="settings.measure_required"
                        id="measure_required"
                        checked={formData.settings?.measure_required || false}
                        onChange={onInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="measure_required" className="ml-2 text-sm font-medium text-gray-700">
                        Measure Required
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="settings.non_inventoried"
                        id="non_inventoried"
                        checked={formData.settings?.non_inventoried || false}
                        onChange={onInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="non_inventoried" className="ml-2 text-sm font-medium text-gray-700">
                        Non-Inventoried
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="settings.shippable"
                        id="shippable"
                        checked={formData.settings?.shippable !== false}
                        onChange={onInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="shippable" className="ml-2 text-sm font-medium text-gray-700">
                        Shippable
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="settings.serialized"
                        id="serialized"
                        checked={formData.settings?.serialized || false}
                        onChange={onInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="serialized" className="ml-2 text-sm font-medium text-gray-700">
                        Serialized
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="settings.active"
                        id="active"
                        checked={formData.settings?.active !== false}
                        onChange={onInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
                        Active Product
                      </label>
                    </div>
                  </div>
                </div>

                {/* Prompt Settings */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-4">Prompt Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="prompts.prompt_qty"
                        id="prompt_qty"
                        checked={formData.prompts?.prompt_qty || false}
                        onChange={onInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="prompt_qty" className="ml-2 text-sm font-medium text-gray-700">
                        Prompt for Quantity
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="prompts.prompt_price"
                        id="prompt_price"
                        checked={formData.prompts?.prompt_price || false}
                        onChange={onInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="prompt_price" className="ml-2 text-sm font-medium text-gray-700">
                        Prompt for Price
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="prompts.prompt_weight"
                        id="prompt_weight"
                        checked={(formData.prompts?.prompt_weight || 0) > 0}
                        onChange={onInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="prompt_weight" className="ml-2 text-sm font-medium text-gray-700">
                        Prompt for Weight
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="prompts.prompt_description"
                        id="prompt_description"
                        checked={formData.prompts?.prompt_description || false}
                        onChange={onInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="prompt_description" className="ml-2 text-sm font-medium text-gray-700">
                        Prompt for Description
                      </label>
                    </div>
                  </div>
                </div>

                {/* Other Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      name="attributes.manufacturer"
                      value={formData.attributes?.manufacturer || ''}
                      onChange={onInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter manufacturer name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Model Number
                    </label>
                    <input
                      type="text"
                      name="attributes.model_number"
                      value={formData.attributes?.model_number || ''}
                      onChange={onInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter model number"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attributes' && (
              <div className="space-y-6">
                {/* Custom Attributes */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Custom Attributes</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attribute Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Color, Size, Material"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attribute Value
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Red, Large, Cotton"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Attribute
                    </Button>
                  </div>
                </div>

                {/* Properties */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-4">Product Properties</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Property Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Weight, Dimensions, Warranty"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Property Value
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 2.5kg, 30x20x10cm, 2 years"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Property
                    </Button>
                  </div>
                </div>

                {/* Category Assignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Primary Category
                    </label>
                    <select
                      name="attributes.category_id"
                      value={formData.attributes?.category_id || ''}
                      onChange={onInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      name="attributes.tags"
                      value={formData.attributes?.tags?.join(', ') || ''}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                        onInputChange({
                          target: { name: 'attributes.tags', value: tags, type: 'text' }
                        } as any);
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter tags separated by commas"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Image URL
                  </label>
                  <input
                    type="url"
                    name="media.image_url"
                    value={formData.media?.image_url || ''}
                    onChange={onInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Image Preview */}
                {formData.media?.image_url && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Image Preview</h4>
                    <div className="w-full max-w-xs mx-auto">
                      <img
                        src={formData.media.image_url}
                        alt="Product preview"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Instructions */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Image Guidelines</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use high-quality images (minimum 800x800px)</li>
                    <li>• Supported formats: JPG, PNG, WebP</li>
                    <li>• Keep file size under 5MB for best performance</li>
                    <li>• Use clean, professional product photos</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Navigation */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                onClick={handlePrev}
                disabled={isFirstTab}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isFirstTab
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Previous
              </Button>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </Button>

                {isLastTab ? (
                  <Button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Create Product
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Products;
