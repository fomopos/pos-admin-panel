import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  BuildingOfficeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { tableApiService } from '../../services/table';
import { 
  PageHeader, 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Input
} from '../../components/ui';
import type { 
  CreateZoneRequest, 
  UpdateZoneRequest
} from '../../types/table';
import useTenantStore from '../../tenants/tenantStore';

const ZoneEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { zoneId } = useParams<{ zoneId: string }>();
  const isEditing = zoneId !== 'new';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { currentTenant, currentStore } = useTenantStore();

  const [formData, setFormData] = useState<CreateZoneRequest & UpdateZoneRequest>({
    zone_id: '',
    name: '',
    description: '',
    color: '#3B82F6',
    active: true,
    sort_order: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Color presets for quick selection
  const colorPresets = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Gray', value: '#6B7280' },
  ];

  useEffect(() => {
    if (isEditing && zoneId) {
      loadZoneData();
    }
  }, [zoneId]);

  const loadZoneData = async () => {
    try {
      setLoading(true);
      
      const context = {
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      };

      const zoneData = await tableApiService.getZone(zoneId!, context);
      setFormData({
        zone_id: zoneData.zone_id,
        name: zoneData.name,
        description: zoneData.description || '',
        color: zoneData.color || '#3B82F6',
        active: zoneData.active,
        sort_order: zoneData.sort_order || 1,
      });
    } catch (error) {
      console.error('Failed to load zone data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Zone name is required';
    }

    if (formData.sort_order !== undefined && formData.sort_order < 0) {
      newErrors.sort_order = 'Sort order must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      const context = {
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      };

      if (isEditing && zoneId) {
        await tableApiService.updateZone(zoneId, formData, context);
      } else {
        await tableApiService.createZone(formData, context);
      }

      navigate('/tables?tab=zones');
    } catch (error) {
      console.error('Failed to save zone:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading zone data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <PageHeader
        title={isEditing ? 'Edit Zone' : 'Create Zone'}
        description={isEditing ? 'Update zone information' : 'Add a new zone to organize your tables'}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/tables?tab=zones')}
          >
            <XMarkIcon className="w-5 h-5 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? 'Saving...' : (isEditing ? 'Update Zone' : 'Create Zone')}
          </Button>
        </div>
      </PageHeader>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BuildingOfficeIcon className="h-6 w-6 mr-2" />
              Zone Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Dining Room, Patio, Bar Area"
                  error={errors.name}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone ID
                </label>
                <Input
                  value={formData.zone_id}
                  onChange={(e) => handleInputChange('zone_id', e.target.value)}
                  placeholder="Auto-generated if empty"
                  disabled={isEditing}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {isEditing ? 'Cannot be changed after creation' : 'Leave empty for auto-generation'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of this zone..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone Color
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  ></div>
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-16 h-8 p-0 border-0"
                  />
                  <Input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="#3B82F6"
                    className="w-24"
                  />
                </div>
              </div>
              
              {/* Color Presets */}
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Quick colors:</p>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleInputChange('color', preset.value)}
                      className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                        formData.color === preset.value ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Color used to identify this zone in visual layouts and reports
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <Input
                type="number"
                min="0"
                value={formData.sort_order}
                onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                placeholder="1"
                error={errors.sort_order}
              />
              {errors.sort_order && (
                <p className="mt-1 text-sm text-red-600">{errors.sort_order}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Lower numbers appear first in zone lists
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Zone is active and can have tables assigned to it
              </label>
            </div>

            {/* Preview */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: formData.color }}
                ></div>
                <div>
                  <p className="font-medium text-gray-900">
                    {formData.name || 'Zone Name'}
                  </p>
                  {formData.description && (
                    <p className="text-sm text-gray-600">{formData.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Sort order: {formData.sort_order || 1} • 
                    Status: {formData.active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ZoneEditPage;