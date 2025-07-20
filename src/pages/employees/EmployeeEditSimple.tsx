import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import {
  PageHeader,
  Widget,
  Button,
  Alert,
  InputTextField,
  PropertyCheckbox,
  Loading,
  Card
} from '../../components/ui';
import { useTenantStore } from '../../tenants/tenantStore';
import { userService } from '../../services/user';
import type { CreateUserRequest, UpdateUserRequest } from '../../services/types/user.types';
import { DEPARTMENTS } from '../../services/types/user.types';

interface EmployeeFormData {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  role_name: string;
  employee_id: string;
  department: string;
  hire_date: string;
  pin_code: string;
  status: 'active' | 'inactive' | 'suspended';
  two_factor_enabled: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

const EmployeeEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentStore } = useTenantStore();
  const isEdit = Boolean(id);

  // State management
  const [formData, setFormData] = useState<EmployeeFormData>({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: '',
    role_name: '',
    employee_id: '',
    department: 'Sales',
    hire_date: '',
    pin_code: '',
    status: 'active',
    two_factor_enabled: false
  });

  const [originalData, setOriginalData] = useState<EmployeeFormData | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [alertState, setAlertState] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Change tracking
  const hasChanges = originalData ? 
    JSON.stringify(formData) !== JSON.stringify(originalData) : 
    Object.values(formData).some(value => 
      typeof value === 'string' ? value.trim() !== '' : value !== false
    );

  // Smart button visibility
  const showSaveButton = hasChanges && !saving;
  const showDiscardButton = hasChanges && !saving;
  const showCancelButton = !hasChanges || saving;

  // Data fetching
  const fetchEmployee = async () => {
    if (!id || !currentStore?.store_id) return;
    
    try {
      setLoading(true);
      const response = await userService.getUserById(id);
      const data: EmployeeFormData = {
        email: response.email,
        first_name: response.first_name,
        last_name: response.last_name,
        phone: response.phone || '',
        role: response.role,
        role_name: response.role_name,
        employee_id: response.employee_id || '',
        department: response.department || 'Sales',
        hire_date: response.hire_date ? response.hire_date.split('T')[0] : '',
        pin_code: response.pin_code || '',
        status: response.status,
        two_factor_enabled: response.two_factor_enabled
      };
      setFormData(data);
      setOriginalData(data);
    } catch (error) {
      console.error('Failed to load employee:', error);
      setAlertState({
        type: 'error',
        message: 'Failed to load employee data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (currentStore?.store_id && isEdit) {
      fetchEmployee();
    }
  }, [id, isEdit, currentStore?.store_id]);

  // Clear field-specific errors when user starts typing
  useEffect(() => {
    Object.keys(formData).forEach(field => {
      if (errors[field] && formData[field as keyof EmployeeFormData]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    });
  }, [formData, errors]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Required field validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.length > 50) {
      newErrors.first_name = 'First name must not exceed 50 characters';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.length > 50) {
      newErrors.last_name = 'Last name must not exceed 50 characters';
    }

    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.employee_id && formData.employee_id.length > 20) {
      newErrors.employee_id = 'Employee ID must not exceed 20 characters';
    }

    if (formData.pin_code && (formData.pin_code.length < 4 || formData.pin_code.length > 6)) {
      newErrors.pin_code = 'PIN code must be 4-6 digits';
    }

    if (formData.pin_code && !/^\d+$/.test(formData.pin_code)) {
      newErrors.pin_code = 'PIN code must contain only numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form handlers
  const handleInputChange = (field: keyof EmployeeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear alert when user makes changes
    if (alertState.type) {
      setAlertState({ type: null, message: '' });
    }
  };

  const saveAllChanges = async () => {
    if (!validateForm() || !currentStore?.store_id) return;

    try {
      setSaving(true);
      setAlertState({ type: null, message: '' });

      const requestData = {
        ...formData,
        store_id: currentStore.store_id,
        hire_date: formData.hire_date || undefined,
        phone: formData.phone || undefined,
        pin_code: formData.pin_code || undefined,
        employee_id: formData.employee_id || undefined,
        permissions: [] // Default empty permissions array
      };

      if (isEdit && id) {
        await userService.updateUser(id, requestData as UpdateUserRequest);
        setAlertState({
          type: 'success',
          message: 'Employee updated successfully!'
        });
      } else {
        await userService.createUser(requestData as CreateUserRequest);
        setAlertState({
          type: 'success',
          message: 'Employee created successfully!'
        });
        // Navigate to edit mode for the new employee
        setTimeout(() => {
          navigate('/employees');
        }, 1500);
      }

      setOriginalData(formData);
    } catch (error: any) {
      console.error('Failed to save employee:', error);
      setAlertState({
        type: 'error',
        message: error.response?.data?.message || 'Failed to save employee. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    if (originalData) {
      setFormData(originalData);
    } else {
      // Reset to empty form for new employee
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: '',
        role_name: '',
        employee_id: '',
        department: 'Sales',
        hire_date: '',
        pin_code: '',
        status: 'active',
        two_factor_enabled: false
      });
    }
    setErrors({});
    setAlertState({ type: null, message: '' });
  };

  if (loading) {
    return (
      <Loading
        title={`Loading Employee ${isEdit ? 'Details' : 'Form'}`}
        description="Please wait while we fetch the employee information..."
      />
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <PageHeader
        title={isEdit ? 'Edit Employee' : 'Add New Employee'}
        description={isEdit 
          ? `Update ${formData.first_name} ${formData.last_name}'s information and settings`
          : 'Create a new employee account and configure their access'
        }
      >
        <div className="flex items-center space-x-3">
          {showCancelButton && (
            <Button
              variant="outline"
              onClick={() => navigate('/employees')}
              disabled={saving}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              {isEdit ? 'Back to Employees' : 'Cancel'}
            </Button>
          )}
          
          {showDiscardButton && (
            <Button
              variant="outline"
              onClick={discardChanges}
              disabled={saving}
            >
              Discard Changes
            </Button>
          )}
          
          {showSaveButton && (
            <Button
              onClick={saveAllChanges}
              disabled={saving}
            >
              {saving 
                ? (isEdit ? 'Updating...' : 'Creating...') 
                : (isEdit ? 'Update Employee' : 'Create Employee')
              }
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Alert Messages */}
      {alertState.type && (
        <Alert 
          variant={alertState.type} 
          onClose={() => setAlertState({ type: null, message: '' })}
        >
          {alertState.message}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Widget
            title="Basic Information"
            description="Employee personal details and contact information"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField
                label="First Name"
                value={formData.first_name}
                onChange={(value) => handleInputChange('first_name', value)}
                error={errors.first_name}
                placeholder="Enter first name"
                required
                maxLength={50}
              />
              
              <InputTextField
                label="Last Name"
                value={formData.last_name}
                onChange={(value) => handleInputChange('last_name', value)}
                error={errors.last_name}
                placeholder="Enter last name"
                required
                maxLength={50}
              />
              
              <InputTextField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                error={errors.email}
                placeholder="employee@company.com"
                required
              />
              
              <InputTextField
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
                error={errors.phone}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </Widget>

          {/* Employment Details */}
          <Widget
            title="Employment Details"
            description="Role, department, and work-related information"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputTextField
                label="Employee ID"
                value={formData.employee_id}
                onChange={(value) => handleInputChange('employee_id', value)}
                error={errors.employee_id}
                placeholder="EMP001 (optional)"
                maxLength={20}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              
              <InputTextField
                label="Role Name"
                value={formData.role_name}
                onChange={(value) => handleInputChange('role_name', value)}
                error={errors.role_name}
                placeholder="Enter role name"
              />
              
              <InputTextField
                label="Hire Date"
                type="text"
                value={formData.hire_date}
                onChange={(value) => handleInputChange('hire_date', value)}
                error={errors.hire_date}
                placeholder="YYYY-MM-DD"
              />
            </div>
          </Widget>

          {/* Security Settings */}
          <Widget
            title="Security Settings"
            description="Login credentials and access control"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputTextField
                  label="PIN Code (4-6 digits)"
                  type="password"
                  value={formData.pin_code}
                  onChange={(value) => handleInputChange('pin_code', value)}
                  error={errors.pin_code}
                  placeholder="Enter PIN for POS access"
                  maxLength={6}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              
              <PropertyCheckbox
                title="Enable Two-Factor Authentication"
                description="Require SMS or app-based verification for enhanced security"
                checked={formData.two_factor_enabled}
                onChange={(checked) => handleInputChange('two_factor_enabled', checked)}
              />
            </div>
          </Widget>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Employee Summary */}
          {(formData.first_name || formData.last_name) && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Summary</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Name:</span>
                  <p className="font-medium">{`${formData.first_name} ${formData.last_name}`.trim() || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="font-medium">{formData.email || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Department:</span>
                  <p className="font-medium">{formData.department || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Role:</span>
                  <p className="font-medium">{formData.role_name || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <p className="font-medium capitalize">{formData.status}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/employees')}
                className="w-full justify-start"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Employee List
              </Button>
            </div>
          </Card>

          {/* Help & Tips */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Tips</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• Employee ID is optional but helps with identification</p>
              <p>• PIN code is used for quick POS system access</p>
              <p>• Two-factor authentication adds extra security</p>
              <p>• Department assignment affects default permissions</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeEdit;
