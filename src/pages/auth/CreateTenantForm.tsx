import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button, Alert } from '../../components/ui';
import { InputTextField } from '../../components/ui';
import { tenantAccessService, type CreateTenantRequest } from '../../services/tenant/tenantAccessService';
import { useTenantStore } from '../../tenants/tenantStore';
import { authService } from '../../auth/authService';
import { handleApiError, type ValidationErrors } from '../../utils/errorHandler';

interface CreateTenantFormProps {
  onSuccess?: (tenantId: string) => void;
  onCancel?: () => void;
}

const CreateTenantForm: React.FC<CreateTenantFormProps> = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { fetchTenants } = useTenantStore();
  
  const [formData, setFormData] = useState<CreateTenantRequest>({
    name: '',
    contact_email: '',
    contact_phone: ''
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertState, setAlertState] = useState<{
    type: 'success' | 'error' | 'warning' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate organization name
    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Organization name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Organization name must be less than 100 characters';
    }

    // Validate contact email
    if (!formData.contact_email.trim()) {
      newErrors.contact_email = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    // Validate contact phone
    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = 'Contact phone is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateTenantRequest, value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlertState({
        type: 'error',
        message: 'Please fix the errors below and try again.'
      });
      return;
    }

    setIsSubmitting(true);
    setAlertState({ type: null, message: '' });

    try {
      console.log('🏢 Creating new tenant:', formData);
      
      // Create the tenant
      const newTenant = await tenantAccessService.createTenant(formData);
      
      console.log('✅ Tenant created successfully:', newTenant);
      
      // Show success message
      setAlertState({
        type: 'success',
        message: `Organization "${newTenant.name}" created successfully!`
      });

      // Refresh tenants list after creation
      try {
        const user = await authService.getCurrentUser();
        if (user?.email) {
          await fetchTenants(user.email, true);
        }
      } catch (refreshError) {
        console.warn('⚠️ Could not refresh tenants list:', refreshError);
      }

      // Call success callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(newTenant.id);
        }, 1500);
      } else {
        // Navigate to tenant selection after a brief delay
        setTimeout(() => {
          navigate('/tenant-store-selection');
        }, 1500);
      }

    } catch (error: any) {
      console.error('❌ Error creating organization:', error);
      
      // Use centralized error handling
      const { errorMessage, fieldErrors } = handleApiError(
        error,
        'Failed to create organization. Please try again.'
      );
      
      // Apply field-specific errors if any
      if (fieldErrors) {
        setErrors(fieldErrors);
      }
      
      setAlertState({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
          <BuildingOfficeIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create New Organization</h2>
        <p className="text-slate-600">
          Set up a new organization to get started with your POS system
        </p>
      </div>

      {/* Alert */}
      {alertState.type && (
        <div className="mb-6">
          <Alert 
            variant={alertState.type} 
            onClose={() => setAlertState({ type: null, message: '' })}
          >
            {alertState.message}
          </Alert>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tenant Name */}
        <InputTextField
          label="Organization Name"
          required
          value={formData.name}
          onChange={(value) => handleInputChange('name', value)}
          placeholder="e.g., Pocket Terminal LLC"
          error={errors.name}
          disabled={isSubmitting}
        />

        {/* Contact Email */}
        <InputTextField
          label="Contact Email"
          type="email"
          required
          value={formData.contact_email}
          onChange={(value) => handleInputChange('contact_email', value)}
          placeholder="e.g., admin@pocketterminal.com"
          error={errors.contact_email}
          disabled={isSubmitting}
        />

        {/* Contact Phone */}
        <InputTextField
          label="Contact Phone"
          type="tel"
          required
          value={formData.contact_phone}
          onChange={(value) => handleInputChange('contact_phone', value)}
          placeholder="e.g., +971508308957"
          error={errors.contact_phone}
          disabled={isSubmitting}
        />

        {/* Submit Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="bg-white/70 border-slate-200 hover:bg-white/90"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ${
              !onCancel ? 'w-full' : 'ml-auto'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Organization...
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Organization
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50/80 backdrop-blur-xl border border-blue-200/50 shadow-lg rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-2">What happens after creation?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your organization will be created with a basic plan</li>
              <li>• You'll be able to create stores under this organization</li>
              <li>• You can invite other users to join your organization</li>
              <li>• All your POS data will be organized under this organization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTenantForm;
