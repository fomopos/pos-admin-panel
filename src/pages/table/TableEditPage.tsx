import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  TableCellsIcon,
  UserGroupIcon,
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
  Input,
  DropdownSearch
} from '../../components/ui';
import type { 
  CreateTableRequest, 
  UpdateTableRequest, 
  EnhancedZone,
  TableStatus,
  DropdownSearchOption 
} from '../../types/table';
import useTenantStore from '../../tenants/tenantStore';

const TableEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { tableId } = useParams<{ tableId: string }>();
  const isEditing = tableId !== 'new';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [zones, setZones] = useState<EnhancedZone[]>([]);
  const { currentTenant, currentStore } = useTenantStore();

  const [formData, setFormData] = useState<CreateTableRequest & UpdateTableRequest>({
    table_id: '',
    name: '',
    capacity: 4,
    zone_id: '',
    status: 'available',
    active: true,
    position_x: 0,
    position_y: 0,
    width: 100,
    height: 100,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInitialData();
  }, [tableId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const context = {
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      };

      // Load zones first
      const zonesData = await tableApiService.getZones(context);
      setZones(zonesData);

      // If editing, load table data
      if (isEditing && tableId) {
        const tableData = await tableApiService.getTable(tableId, context);
        setFormData({
          table_id: tableData.table_id,
          name: tableData.name,
          capacity: tableData.capacity,
          zone_id: tableData.zone_id || '',
          status: tableData.status,
          active: tableData.active,
          position_x: tableData.position_x || 0,
          position_y: tableData.position_y || 0,
          width: tableData.width || 100,
          height: tableData.height || 100,
        });
      }
    } catch (error) {
      console.error('Failed to load table data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Table name is required';
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    if (formData.capacity > 50) {
      newErrors.capacity = 'Capacity cannot exceed 50';
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

      if (isEditing && tableId) {
        await tableApiService.updateTable(tableId, formData, context);
      } else {
        await tableApiService.createTable(formData, context);
      }

      navigate('/tables');
    } catch (error) {
      console.error('Failed to save table:', error);
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

  const getZoneDropdownOptions = (): DropdownSearchOption[] => {
    const options: DropdownSearchOption[] = [
      {
        id: '',
        label: 'No Zone (Unassigned)',
        description: 'Table will not be assigned to any zone',
      }
    ];

    zones.forEach(zone => {
      options.push({
        id: zone.zone_id,
        label: zone.name,
        description: zone.description || 'Table zone',
      });
    });

    return options;
  };

  const getZoneDisplayValue = (): string => {
    if (!formData.zone_id) return 'No Zone (Unassigned)';
    
    const zone = zones.find(z => z.zone_id === formData.zone_id);
    return zone ? zone.name : 'Unknown Zone';
  };

  const handleZoneSelect = (option: DropdownSearchOption | null) => {
    handleInputChange('zone_id', option?.id || '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading table data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <PageHeader
        title={isEditing ? 'Edit Table' : 'Create Table'}
        description={isEditing ? 'Update table information' : 'Add a new table to your restaurant'}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/tables')}
          >
            <XMarkIcon className="w-5 h-5 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? 'Saving...' : (isEditing ? 'Update Table' : 'Create Table')}
          </Button>
        </div>
      </PageHeader>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TableCellsIcon className="h-6 w-6 mr-2" />
              Table Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Table Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., T1, Table 1, Window Table"
                  error={errors.name}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Table ID
                </label>
                <Input
                  value={formData.table_id}
                  onChange={(e) => handleInputChange('table_id', e.target.value)}
                  placeholder="Auto-generated if empty"
                  disabled={isEditing}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {isEditing ? 'Cannot be changed after creation' : 'Leave empty for auto-generation'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <div className="relative">
                  <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                    className="pl-10"
                    error={errors.capacity}
                  />
                </div>
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as TableStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="out_of_order">Out of Order</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>
            </div>

            {/* Zone Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone Assignment
              </label>
              <DropdownSearch
                label="Zone Assignment"
                value={formData.zone_id}
                options={getZoneDropdownOptions()}
                onSelect={handleZoneSelect}
                displayValue={() => getZoneDisplayValue()}
                placeholder="Select a zone..."
                allowClear={true}
                clearLabel="No Zone"
              />
              <p className="mt-1 text-sm text-gray-500">
                Assign this table to a zone for better organization
              </p>
            </div>

            {/* Position and Dimensions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Layout Position (Optional)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    X Position
                  </label>
                  <Input
                    type="number"
                    value={formData.position_x}
                    onChange={(e) => handleInputChange('position_x', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Y Position
                  </label>
                  <Input
                    type="number"
                    value={formData.position_y}
                    onChange={(e) => handleInputChange('position_y', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width
                  </label>
                  <Input
                    type="number"
                    value={formData.width}
                    onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 100)}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 100)}
                    placeholder="100"
                  />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Position and dimensions for visual layout in restaurant floor plan
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
                Table is active and available for use
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TableEditPage;