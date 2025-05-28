import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  TrashIcon,
  ListBulletIcon,
  LinkIcon,
  MinusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  costPrice: number;
  category: string;
  inventory: number;
  status: 'active' | 'inactive';
  image?: string;
  brand?: string;
}

const ProductEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    description: '',
    price: 0,
    costPrice: 0,
    category: '',
    inventory: 0,
    status: 'active',
    brand: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Mock data for editing - in real app, this would fetch from API
  useEffect(() => {
    if (isEditing && id) {
      // Simulate loading existing product data
      setFormData({
        id: id,
        name: 'Flörven',
        sku: '098327NT',
        description: 'Make a brew a right royal knees up and we all like figgy pudding a comely wench gutted its nicked pulled out the eating irons, ask your mother if on goggle box toasty the whole hog Sherlock rather, ar kid pennyboy naff superb pezzy little.',
        price: 252,
        costPrice: 12,
        category: 'Furniture',
        inventory: 50,
        status: 'active',
        brand: 'Luminaire',
      });
    }
  }, [isEditing, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'costPrice' || name === 'inventory' 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Saving product:', formData);
    setIsLoading(false);
    navigate('/products');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Deleting product:', id);
      setIsLoading(false);
      navigate('/products');
    }
  };

  const handleBack = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditing ? 'Edit product' : 'Create product'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white">
          {/* Basic Information Section */}
          <div className="px-6 py-8 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product name"
                />
              </div>

              {/* Product Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product code
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product code"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                
                {/* Rich Text Editor Toolbar */}
                <div className="border border-gray-300 rounded-t-md bg-gray-50 px-3 py-2 flex items-center space-x-1">
                  <button
                    type="button"
                    className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded font-bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded underline"
                  >
                    U
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded font-mono"
                  >
                    &lt;/&gt;
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button
                    type="button"
                    className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded font-mono"
                  >
                    99
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded font-bold"
                  >
                    H
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button
                    type="button"
                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                  >
                    <ListBulletIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                  >
                    1.
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button
                    type="button"
                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Text Area */}
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 border-t-0 rounded-b-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Enter product description"
                />
              </div>
            </div>
          </div>

          {/* Product Image Section */}
          <div className="px-6 py-8 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Image</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                {/* Left side - Image upload area */}
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-4">
                    Choose a product photo or simply drag and drop up to 5 photos here.
                  </p>
                  
                  {/* Image thumbnails */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {/* Sample images */}
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop" 
                        alt="Product" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop" 
                        alt="Product" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop" 
                        alt="Product" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <p className="text-xs text-gray-500">Drop your image here, or browse</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Image formats: .jpg, .jpeg, .png, preferred size: 1:1, file size is restricted to a maximum of 500kb.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attribute Section */}
          <div className="px-6 py-8 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Attribute</h2>
            
            <div className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Books">Books</option>
                  <option value="Home & Garden">Home & Garden</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    trend
                    <button type="button" className="ml-1 text-blue-600 hover:text-blue-800">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                </div>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter brand name"
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="px-6 py-8 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing</h2>
            
            <div className="space-y-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ''}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Cost Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice || ''}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </button>

            <div className="flex items-center space-x-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </button>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEdit;
