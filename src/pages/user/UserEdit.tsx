import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  UserIcon,
  ShieldCheckIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Button, Card, PageHeader, Loading, InputTextField } from '../../components/ui';
import { userService } from '../../services/user';
import { roleService } from '../../services/role';
import type { StoreUser, UpdateUserRequest, Department } from '../../services/types/user.types';
import type { UserRole } from '../../services/types/store.types';
import { DEPARTMENTS } from '../../services/types/user.types';

interface UserEditProps {
  userId: string;
  onBack: () => void;
  onSave: () => void;
}

const UserEdit: React.FC<UserEditProps> = ({ userId, onBack, onSave }) => {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [formData, setFormData] = useState<UpdateUserRequest>({});
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
    loadAvailableRoles();
  }, [userId]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const userData = await userService.getUserById(userId);
      setUser(userData);
      
      // Initialize form data
      setFormData({
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone: userData.phone || '',
        role: userData.role || '',
        role_name: userData.role_name || '',
        status: userData.status || 'active',
        employee_id: userData.employee_id || '',
        department: userData.department || 'Sales',
        pin_code: '',
        two_factor_enabled: userData.two_factor_enabled || false
      });
    } catch (err) {
      setErrors({ load: 'Failed to load user details' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableRoles = async () => {
    try {
      setIsLoadingRoles(true);
      const rolesResponse = await roleService.getRoles(user?.store_id || '');
      setAvailableRoles(rolesResponse.roles);
    } catch (error) {
      console.error('Failed to load roles:', error);
      setErrors(prev => ({ ...prev, roles: 'Failed to load available roles' }));
    } finally {
      setIsLoadingRoles(false);
    }
  };

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

  const handleRoleChange = (roleId: string) => {
    const selectedRole = availableRoles.find(role => role.role_id === roleId);
    if (selectedRole) {
      setFormData(prev => ({
        ...prev,
        role: roleId,
        role_name: selectedRole.role_name,
        permissions: selectedRole.permissions as any[] // Type casting for compatibility
      }));
    } else {
      // Allow manual role entry for backwards compatibility
      setFormData(prev => ({
        ...prev,
        role: roleId
      }));
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      await userService.updateUser(userId, formData);
      setSuccessMessage('User updated successfully');
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (error) {
      setErrors({ submit: 'Failed to update user. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Loading
        title="Loading User Details"
        description="Please wait while we fetch the user information for editing..."
        fullScreen={true}
        size="lg"
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Not Found</h3>
              <p className="text-gray-600 mb-6">The user you're looking for doesn't exist or has been removed.</p>
              <Button onClick={onBack} className="bg-primary-600 hover:bg-primary-700">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <PageHeader
            title={`Edit User: ${user.first_name} ${user.last_name}`}
            description="Update user information and settings"
            className="bg-white border border-gray-200 shadow-sm rounded-lg p-6"
          >
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
          </PageHeader>

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
                      error={errors.phone}
                    />

                    <InputTextField
                      label="Employee ID"
                      value={formData.employee_id}
                      onChange={(value) => handleInputChange('employee_id', value)}
                      placeholder="Enter employee ID"
                    />
                  </div>
                </div>
              </Card>

              {/* Role & Status */}
              <Card className="border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <ShieldCheckIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Role & Settings</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status *
                      </label>
                      <select
                        value={formData.status || 'active'}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="input-base"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role *
                      </label>
                      <select
                        value={formData.role || ''}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className={`input-base ${
                          errors.role ? 'border-red-300 focus:ring-red-500' : ''
                        }`}
                        disabled={isLoadingRoles}
                      >
                        <option value="">
                          {isLoadingRoles ? 'Loading roles...' : 'Select role'}
                        </option>
                        {availableRoles.map((role) => (
                          <option key={role.role_id} value={role.role_id}>
                            {role.role_name}
                          </option>
                        ))}
                      </select>
                      {errors.role && (
                        <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                      )}
                    </div>

                    <InputTextField
                      label="Role Name"
                      required
                      value={formData.role_name || ''}
                      onChange={(value) => handleInputChange('role_name', value)}
                      placeholder={formData.role && availableRoles.some(r => r.role_id === formData.role) 
                        ? 'Role name (auto-filled)' 
                        : 'Enter role name'}
                      error={errors.role_name}
                      disabled={!!formData.role && availableRoles.some(r => r.role_id === formData.role)}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        value={formData.department || 'Sales'}
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

                    <InputTextField
                      type="password"
                      label="PIN Code"
                      value={formData.pin_code}
                      onChange={(value) => handleInputChange('pin_code', value)}
                      placeholder="Enter new PIN (leave empty to keep current)"
                      maxLength={6}
                      helperText="Leave empty to keep the current PIN"
                    />

                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.two_factor_enabled || false}
                          onChange={(e) => handleInputChange('two_factor_enabled', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Enable Two-Factor Authentication
                        </span>
                      </label>
                    </div>
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
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary-600 hover:bg-primary-700 flex items-center"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckIcon className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
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

export default UserEdit;
