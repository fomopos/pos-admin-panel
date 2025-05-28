import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, TagIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const Categories: React.FC = () => {
  const { currentTenant } = useTenantStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    color: '#3B82F6',
    status: 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Predefined color options
  const colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
  ];

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCategories([
        {
          id: '1',
          name: 'Electronics',
          description: 'Electronic devices and accessories',
          color: '#3B82F6',
          productCount: 45,
          status: 'active',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-15',
        },
        {
          id: '2',
          name: 'Clothing',
          description: 'Apparel and fashion items',
          color: '#10B981',
          productCount: 128,
          status: 'active',
          createdAt: '2024-01-08',
          updatedAt: '2024-01-12',
        },
        {
          id: '3',
          name: 'Food & Beverages',
          description: 'Food items and drinks',
          color: '#F59E0B',
          productCount: 67,
          status: 'active',
          createdAt: '2024-01-05',
          updatedAt: '2024-01-14',
        },
        {
          id: '4',
          name: 'Books',
          description: 'Books and educational materials',
          color: '#8B5CF6',
          productCount: 23,
          status: 'active',
          createdAt: '2024-01-03',
          updatedAt: '2024-01-10',
        },
        {
          id: '5',
          name: 'Home & Garden',
          description: 'Home improvement and gardening supplies',
          color: '#06B6D4',
          productCount: 34,
          status: 'inactive',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-08',
        },
      ]);
      
      setIsLoading(false);
    };

    fetchCategories();
  }, [currentTenant]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Category name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.color) newErrors.color = 'Color is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (editingCategory) {
        // Update existing category
        setCategories(prev => prev.map(c => 
          c.id === editingCategory.id 
            ? { 
                ...c, 
                ...formData,
                updatedAt: new Date().toISOString().split('T')[0]
              } as Category
            : c
        ));
      } else {
        // Add new category
        const newCategory: Category = {
          ...formData as Category,
          id: Date.now().toString(),
          productCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        setCategories(prev => [...prev, newCategory]);
      }
      
      handleCloseForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData(category);
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category.productCount > 0) {
      alert(`Cannot delete category "${category.name}" because it has ${category.productCount} products. Please move or delete the products first.`);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(c => c.id !== categoryId));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      status: 'active',
    });
    setErrors({});
  };

  const getStatusBadge = (status: Category['status']) => {
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
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500">
            {currentTenant ? `${currentTenant.name} - ` : ''}
            Organize your products into categories
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Export
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </button>
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-2xl mb-4">
                <TagIcon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Categories</p>
              <p className="text-3xl font-bold text-slate-900">{categories.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-2xl mb-4">
                <span className="text-green-600 font-semibold text-lg">A</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Active</p>
              <p className="text-3xl font-bold text-slate-900">
                {categories.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-2xl mb-4">
                <span className="text-red-600 font-semibold text-lg">I</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Inactive</p>
              <p className="text-3xl font-bold text-slate-900">
                {categories.filter(c => c.status === 'inactive').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-2xl mb-4">
                <span className="text-purple-600 font-semibold text-lg">#</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-slate-900">
                {categories.reduce((sum, c) => sum + c.productCount, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <TagIcon 
                    className="w-6 h-6" 
                    style={{ color: category.color }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {category.productCount} products
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="mt-3 text-sm text-slate-600">
              {category.description}
            </p>
            
            <div className="mt-4 flex items-center justify-between">
              {getStatusBadge(category.status)}
              <span className="text-xs text-slate-500">
                Updated {category.updatedAt}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-2xl bg-white border-slate-200">
            <Card className="border-0 shadow-none">
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-1">
                    {editingCategory ? 'Edit Category' : 'Add Category'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {editingCategory ? 'Update category information' : 'Create a new product category'}
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Category Name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    error={errors.name}
                    required
                    placeholder="Enter category name"
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      placeholder="Enter category description"
                      required
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-full border-2 ${
                            formData.color === color ? 'border-slate-900' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      name="color"
                      value={formData.color || '#3B82F6'}
                      onChange={handleInputChange}
                      className="w-16 h-8 rounded border border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <select
                      name="status"
                      value={formData.status || 'active'}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
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
                      {editingCategory ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      )}

      {categories.length === 0 && (
        <Card className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <TagIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">No categories yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            Get started by creating your first product category.
          </p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Categories;
