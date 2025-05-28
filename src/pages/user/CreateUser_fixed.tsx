import React, { useState } from 'react';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  ShieldCheckIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { userService } from '../../services/user';
import type { CreateUserRequest, Department } from '../../services/types/user.types';
import type { Permission } from '../../services/types/store.types';
import { DEPARTMENTS } from '../../services/types/user.types';

interface CreateUserProps {
  storeId: string;
  onBack: () => void;
  onSave: () => void;
}

const CreateUser: React.FC<CreateUserProps> = ({ storeId, onBack, onSave }) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    store_id: storeId,
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: '',
    role_name: '',
    permissions: [],
    employee_id: '',
    department: 'Sales',
    pin_code: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (field: keyof CreateUserRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.role?.trim()) {
      newErrors.role = 'Role is required';
    }

    if (!formData.role_name?.trim()) {
      newErrors.role_name = 'Role name is required';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.pin_code && !/^\d{4,6}$/.test(formData.pin_code)) {
      newErrors.pin_code = 'PIN must be 4-6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getDefaultPermissions = (role: string): Permission[] => {
    switch (role) {
      case 'admin':
        return [
          'sales_create', 'sales_read', 'sales_update', 'sales_delete', 'sales_void', 'sales_refund',
          'products_create', 'products_read', 'products_update', 'products_delete',
          'users_create', 'users_read', 'users_update', 'users_delete',
          'settings_store', 'settings_users', 'manager_functions'
        ];
      case 'manager':
        return [
          'sales_create', 'sales_read', 'sales_update', 'sales_void', 'sales_refund',
          'products_read', 'products_update',
          'users_read', 'reports_sales', 'manager_functions'
        ];
      case 'cashier':
        return [
          'sales_create', 'sales_read', 'products_read', 'customers_read'
        ];
      case 'inventory':
        return [
          'products_read', 'products_update', 'inventory_read', 'inventory_update', 'inventory_adjust'
        ];
      case 'sales':
        return [
          'sales_create', 'sales_read', 'products_read', 'customers_create', 'customers_read', 'customers_update'
        ];
      default:
        return ['sales_read', 'products_read'];
    }
  };

  const handleRoleChange = (role: string) => {
    const permissions = getDefaultPermissions(role);
    setFormData(prev => ({
      ...prev,
      role,
      permissions
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await userService.createUser(formData);
      setSuccessMessage('User created successfully');
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (error) {
      setErrors({ submit: 'Failed to create user. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Users
                </Button>
                <div className="border-l border-gray-300 pl-4">
                  <h1 className="text-2xl font-semibold text-gray-900">Create New User</h1>
                  <p className="text-sm text-gray-600 mt-1">Add a new user to your store with proper roles and permissions</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <Card className="border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          className={`input-base ${
                            errors.first_name ? 'border-red-300 focus:ring-red-500' : ''
                          }`}
                          placeholder="Enter first name"
                        />
                        {errors.first_name && (
                          <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          className={`input-base ${
                            errors.last_name ? 'border-red-300 focus:ring-red-500' : ''
                          }`}
                          placeholder="Enter last name"
                        />
                        {errors.last_name && (
                          <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`input-base pl-10 ${
                            errors.email ? 'border-red-300 focus:ring-red-500' : ''
                          }`}
                          placeholder="Enter email address"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`input-base pl-10 ${
                            errors.phone ? 'border-red-300 focus:ring-red-500' : ''
                          }`}
                          placeholder="Enter phone number"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID
                      </label>
                      <div className="relative">
                        <KeyIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.employee_id}
                          onChange={(e) => handleInputChange('employee_id', e.target.value)}
                          className="input-base pl-10"
                          placeholder="Enter employee ID"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Role & Permissions */}
              <Card className="border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <ShieldCheckIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Role & Permissions</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className={`input-base ${
                          errors.role ? 'border-red-300 focus:ring-red-500' : ''
                        }`}
                      >
                        <option value="">Select role</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="cashier">Cashier</option>
                        <option value="inventory">Inventory</option>
                        <option value="sales">Sales</option>
                      </select>
                      {errors.role && (
                        <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role Name *
                      </label>
                      <input
                        type="text"
                        value={formData.role_name}
                        onChange={(e) => handleInputChange('role_name', e.target.value)}
                        className={`input-base ${
                          errors.role_name ? 'border-red-300 focus:ring-red-500' : ''
                        }`}
                        placeholder="Enter role name"
                      />
                      {errors.role_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.role_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value as Department)}
                        className="input-base"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PIN Code
                      </label>
                      <input
                        type="password"
                        value={formData.pin_code}
                        onChange={(e) => handleInputChange('pin_code', e.target.value)}
                        className={`input-base ${
                          errors.pin_code ? 'border-red-300 focus:ring-red-500' : ''
                        }`}
                        placeholder="Enter 4-6 digit PIN"
                        maxLength={6}
                      />
                      {errors.pin_code && (
                        <p className="mt-1 text-sm text-red-600">{errors.pin_code}</p>
                      )}
                    </div>

                    {/* Permissions Preview */}
                    {formData.permissions.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assigned Permissions
                        </label>
                        <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <div className="grid grid-cols-1 gap-1 text-xs">
                            {formData.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded ring-1 ring-primary-600/20"
                              >
                                {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Permissions are automatically assigned based on the selected role
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Actions */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary-600 hover:bg-primary-700 flex items-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <PlusIcon className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="bg-white border border-green-200 shadow-sm rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
              </div>
            )}

            {Object.keys(errors).length > 0 && (
              <div className="bg-white border border-red-200 shadow-sm rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    {Object.values(errors).map((error, index) => (
                      <p key={index} className="text-sm text-red-800">{error}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
