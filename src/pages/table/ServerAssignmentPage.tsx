import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  UserIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { tableApiService } from '../../services/table';
import { 
  PageHeader, 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  DropdownSearch
} from '../../components/ui';
import type { 
  ServerAssignmentRequest, 
  ServerAssignment,
  EnhancedTable,
  DropdownSearchOption 
} from '../../types/table';
import useTenantStore from '../../tenants/tenantStore';

const ServerAssignmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { tableId } = useParams<{ tableId: string }>();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [table, setTable] = useState<EnhancedTable | null>(null);
  const [currentAssignment, setCurrentAssignment] = useState<ServerAssignment | null>(null);
  const { currentTenant, currentStore } = useTenantStore();

  const [formData, setFormData] = useState<ServerAssignmentRequest>({
    table_id: tableId || '',
    server_id: '',
    server_name: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock server data - in real app, this would come from a servers API
  const mockServers = [
    { id: 'SERVER01', name: 'Alice Smith', shift: 'Morning' },
    { id: 'SERVER02', name: 'Bob Johnson', shift: 'Evening' },
    { id: 'SERVER03', name: 'Carol Wilson', shift: 'Morning' },
    { id: 'SERVER04', name: 'David Brown', shift: 'Night' },
    { id: 'SERVER05', name: 'Emma Davis', shift: 'Evening' },
  ];

  useEffect(() => {
    if (tableId) {
      loadTableData();
    }
  }, [tableId]);

  const loadTableData = async () => {
    if (!tableId) return;

    try {
      setLoading(true);
      
      const context = {
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      };

      // Load table data
      const tableData = await tableApiService.getTable(tableId, context);
      setTable(tableData);

      // Load current server assignment
      const assignment = await tableApiService.getTableServer(tableId, context);
      setCurrentAssignment(assignment);

      if (assignment) {
        setFormData({
          table_id: tableId,
          server_id: assignment.server_id,
          server_name: assignment.server_name,
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

    if (!formData.server_id) {
      newErrors.server_id = 'Server selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAssign = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      const context = {
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      };

      await tableApiService.assignServer(formData, context);
      navigate('/tables');
    } catch (error) {
      console.error('Failed to assign server:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUnassign = async () => {
    // In a real implementation, there would be an unassign API endpoint
    try {
      setSaving(true);
      
      // For now, just navigate back
      navigate('/tables');
    } catch (error) {
      console.error('Failed to unassign server:', error);
    } finally {
      setSaving(false);
    }
  };

  const getServerDropdownOptions = (): DropdownSearchOption[] => {
    return mockServers.map(server => ({
      id: server.id,
      label: server.name,
      description: `Shift: ${server.shift}`,
    }));
  };

  const getServerDisplayValue = (): string => {
    if (!formData.server_id) return 'Select a server...';
    
    const server = mockServers.find(s => s.id === formData.server_id);
    return server ? server.name : 'Unknown Server';
  };

  const handleServerSelect = (option: DropdownSearchOption | null) => {
    if (option) {
      const server = mockServers.find(s => s.id === option.id);
      setFormData({
        ...formData,
        server_id: option.id,
        server_name: server?.name || '',
      });
    } else {
      setFormData({
        ...formData,
        server_id: '',
        server_name: '',
      });
    }
    
    // Clear error when user makes selection
    if (errors.server_id) {
      setErrors(prev => ({ ...prev, server_id: '' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading server assignment data...</p>
        </div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Table not found</p>
          <Button onClick={() => navigate('/tables')} className="mt-4">
            Back to Tables
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <PageHeader
        title={`Server Assignment - ${table.table_number}`}
        description={`Assign or reassign a server to table ${table.table_number} in ${table.zone_name || 'no zone'}`}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/tables')}
          >
            <XMarkIcon className="w-5 h-5 mr-2" />
            Cancel
          </Button>
          {currentAssignment && (
            <Button
              variant="outline"
              onClick={handleUnassign}
              disabled={saving}
              className="text-red-600 hover:text-red-700"
            >
              Unassign Server
            </Button>
          )}
          <Button
            onClick={handleAssign}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? 'Saving...' : (currentAssignment ? 'Reassign Server' : 'Assign Server')}
          </Button>
        </div>
      </PageHeader>

      <div className="max-w-4xl mx-auto">
        {/* Current Assignment Info */}
        {currentAssignment && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClockIcon className="h-6 w-6 mr-2" />
                Current Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-blue-600 text-sm">Server:</span>
                    <div className="font-medium">{currentAssignment.server_name}</div>
                  </div>
                  <div>
                    <span className="text-blue-600 text-sm">Assigned At:</span>
                    <div className="font-medium">
                      {new Date(currentAssignment.assigned_at).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-600 text-sm">Assigned By:</span>
                    <div className="font-medium">{currentAssignment.assigned_by}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assignment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-6 w-6 mr-2" />
              {currentAssignment ? 'Reassign Server' : 'Assign Server'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Table Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Table Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">Table Number:</span>
                  <div className="font-medium">{table.table_number}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Zone:</span>
                  <div className="font-medium">{table.zone_name || 'No zone'}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Capacity:</span>
                  <div className="font-medium">{table.capacity} guests</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Status:</span>
                  <div className="font-medium capitalize">{table.status.replace('_', ' ')}</div>
                </div>
              </div>
            </div>

            {/* Server Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Server *
              </label>
              <DropdownSearch
                label="Server Selection"
                value={formData.server_id}
                options={getServerDropdownOptions()}
                onSelect={handleServerSelect}
                displayValue={() => getServerDisplayValue()}
                placeholder="Select a server..."
                searchPlaceholder="Search servers..."
                error={errors.server_id}
              />
              {errors.server_id && (
                <p className="mt-1 text-sm text-red-600">{errors.server_id}</p>
              )}
              
              {/* Selected Server Info */}
              {formData.server_id && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">Selected Server Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-green-600">Name:</span>
                      <div className="font-medium">{formData.server_name}</div>
                    </div>
                    <div>
                      <span className="text-green-600">Shift:</span>
                      <div className="font-medium">
                        {mockServers.find(s => s.id === formData.server_id)?.shift}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Assignment Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Assignment Notes</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• The server will be responsible for taking orders and serving this table</li>
                <li>• Assignment will be recorded with timestamp for reporting purposes</li>
                <li>• You can reassign or unassign servers at any time</li>
                {currentAssignment && (
                  <li>• This will replace the current assignment with {currentAssignment.server_name}</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServerAssignmentPage;