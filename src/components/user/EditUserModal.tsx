import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import { InputTextField } from '../ui';
import type { StoreUser, UpdateUserRequest, Department } from '../../services/types/user.types';

interface EditUserModalProps {
  isOpen: boolean;
  user: StoreUser | null;
  onClose: () => void;
  onSubmit: (userData: UpdateUserRequest) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, user, onClose, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<UpdateUserRequest>({});

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        role: user.role || '',
        role_name: user.role_name || '',
        status: user.status || 'active',
        employee_id: user.employee_id || '',
        department: user.department || 'Sales',
        pin_code: '',
        two_factor_enabled: user.two_factor_enabled || false
      });
      setErrors({});
    }
  }, [user]);

  const handleInputChange = (field: keyof UpdateUserRequest, value: any) => {
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

    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.pin_code && (formData.pin_code.length < 4 || formData.pin_code.length > 8)) {
      newErrors.pin_code = 'PIN code must be 4-8 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Remove empty pin_code if not provided
      const submitData = { ...formData };
      if (!submitData.pin_code?.trim()) {
        delete submitData.pin_code;
      }
      
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Failed to update user:', error);
      setErrors({ general: 'Failed to update user. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const departments: Department[] = [
    'Management', 'Sales', 'Customer Service', 'Inventory', 
    'Security', 'Maintenance', 'Finance', 'Marketing'
  ];

  const predefinedRoles = [
    { value: 'admin', name: 'Administrator' },
    { value: 'manager', name: 'Store Manager' },
    { value: 'cashier', name: 'Cashier' },
    { value: 'sales_associate', name: 'Sales Associate' },
    { value: 'inventory_clerk', name: 'Inventory Clerk' },
    { value: 'customer_service', name: 'Customer Service' }
  ];

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserIcon className="h-6 w-6 mr-3" />
              <h2 className="text-xl font-semibold">Edit User</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {errors.general}
              </div>
            )}

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputTextField
                label="First Name"
                required
                value={formData.first_name}
                onChange={(value) => handleInputChange('first_name', value)}
                placeholder="Enter first name"
                error={errors.first_name}
              />

              <InputTextField
                label="Last Name"
                required
                value={formData.last_name}
                onChange={(value) => handleInputChange('last_name', value)}
                placeholder="Enter last name"
                error={errors.last_name}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputTextField
                type="email"
                label="Email Address"
                required
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                placeholder="Enter email address"
                error={errors.email}
              />

              <InputTextField
                type="tel"
                label="Phone Number"
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
                placeholder="Enter phone number"
              />
            </div>

            {/* Employment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputTextField
                label="Employee ID"
                value={formData.employee_id}
                onChange={(value) => handleInputChange('employee_id', value)}
                placeholder="Enter employee ID"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive' | 'suspended')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Role and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role || ''}
                  onChange={(e) => {
                    const selectedRole = predefinedRoles.find(r => r.value === e.target.value);
                    handleInputChange('role', e.target.value);
                    if (selectedRole) {
                      handleInputChange('role_name', selectedRole.name);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a role</option>
                  {predefinedRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={formData.department || 'Sales'}
                  onChange={(e) => handleInputChange('department', e.target.value as Department)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Security */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New PIN Code (4-8 digits, leave blank to keep current)
              </label>
              <input
                type="text"
                value={formData.pin_code || ''}
                onChange={(e) => {
                  // Only allow numbers and limit length
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
                  handleInputChange('pin_code', value);
                }}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.pin_code ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Enter new PIN code"
              />
              {errors.pin_code && (
                <p className="mt-1 text-sm text-red-600">{errors.pin_code}</p>
              )}
            </div>

            {/* Two-Factor Authentication */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="twoFactorEnabled"
                checked={formData.two_factor_enabled || false}
                onChange={(e) => handleInputChange('two_factor_enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="twoFactorEnabled" className="ml-2 text-sm text-gray-700">
                Enable two-factor authentication
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
