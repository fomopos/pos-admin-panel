import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ArchiveBoxIcon,
  Squares2X2Icon,
  ListBulletIcon,
  EllipsisVerticalIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid 
} from '@heroicons/react/24/solid';
import { useTenantStore } from '../tenants/tenantStore';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const handleEdit = (product: Product) => {
    // Navigate to dedicated edit page instead of showing modal
    navigate(`/products/edit/${product.id}`);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
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
              onClick={() => navigate('/products/new')}
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

export default Products;
