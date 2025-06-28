import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowsPointingOutIcon,
  XMarkIcon,
  TrashIcon,
  TableCellsIcon
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
  TableMergeRequest,
  EnhancedTable,
  DropdownSearchOption 
} from '../../types/table';
import useTenantStore from '../../tenants/tenantStore';

const TableMergeUnmergePage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tables, setTables] = useState<EnhancedTable[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const { currentTenant, currentStore } = useTenantStore();

  const [formData, setFormData] = useState<TableMergeRequest>({
    new_table_id: '',
    merged_table_ids: [],
    name: '',
    capacity: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    // Update form data when selected tables change
    if (selectedTables.length > 0) {
      const selectedTableObjects = tables.filter(t => selectedTables.includes(t.table_id));
      const totalCapacity = selectedTableObjects.reduce((sum, table) => sum + table.capacity, 0);
      const mergedName = selectedTableObjects.map(t => t.name).join('+');
      
      setFormData(prev => ({
        ...prev,
        merged_table_ids: selectedTables,
        capacity: totalCapacity,
        name: mergedName,
      }));
    }
  }, [selectedTables, tables]);

  const loadTables = async () => {
    try {
      setLoading(true);
      
      const context = {
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      };

      const tablesData = await tableApiService.getTables(context, { 
        status: 'available' // Only show available tables for merging
      });
      setTables(tablesData);
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedTables.length < 2) {
      newErrors.tables = 'Select at least 2 tables to merge';
    }

    if (!formData.new_table_id.trim()) {
      newErrors.new_table_id = 'New table ID is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Merged table name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMerge = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      const context = {
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      };

      await tableApiService.mergeTables(formData, context);
      navigate('/tables');
    } catch (error) {
      console.error('Failed to merge tables:', error);
    } finally {
      setSaving(false);
    }
  };

  const getAvailableTableOptions = (): DropdownSearchOption[] => {
    return tables
      .filter(table => !selectedTables.includes(table.table_id))
      .map(table => ({
        id: table.table_id,
        label: table.name,
        description: `Zone: ${table.zone_name || 'No zone'} • Capacity: ${table.capacity}`,
      }));
  };

  const handleTableSelect = (option: DropdownSearchOption | null) => {
    if (option && !selectedTables.includes(option.id)) {
      setSelectedTables(prev => [...prev, option.id]);
    }
  };

  const removeSelectedTable = (tableId: string) => {
    setSelectedTables(prev => prev.filter(id => id !== tableId));
  };

  const getSelectedTableDetails = () => {
    return tables.filter(t => selectedTables.includes(t.table_id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tables for merging...</p>
        </div>
      </div>
    );
  }

  const selectedTableDetails = getSelectedTableDetails();

  return (
    <div className="p-6">
      {/* Header */}
      <PageHeader
        title="Merge Tables"
        description="Combine multiple tables into a single larger table for parties"
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
            onClick={handleMerge}
            disabled={saving || selectedTables.length < 2}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? 'Merging...' : 'Merge Tables'}
          </Button>
        </div>
      </PageHeader>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Table Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TableCellsIcon className="h-6 w-6 mr-2" />
                Select Tables to Merge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Table Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Table to Merge
                </label>
                <DropdownSearch
                  label="Table Selection"
                  value=""
                  options={getAvailableTableOptions()}
                  onSelect={handleTableSelect}
                  displayValue={() => 'Select a table to add...'}
                  placeholder="Choose table..."
                  searchPlaceholder="Search tables..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Only available tables can be merged
                </p>
              </div>

              {/* Selected Tables List */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selected Tables ({selectedTables.length})
                </label>
                {selectedTables.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <TableCellsIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No tables selected for merging</p>
                    <p className="text-sm">Select at least 2 tables to merge</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedTableDetails.map((table, index) => (
                      <div
                        key={table.table_id}
                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{table.name}</div>
                            <div className="text-sm text-gray-600">
                              {table.zone_name || 'No zone'} • Capacity: {table.capacity}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeSelectedTable(table.table_id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.tables && (
                  <p className="mt-1 text-sm text-red-600">{errors.tables}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Merge Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowsPointingOutIcon className="h-6 w-6 mr-2" />
                Merged Table Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* New Table ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Table ID *
                </label>
                <Input
                  value={formData.new_table_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, new_table_id: e.target.value }))}
                  placeholder="e.g., TBL_MERGED_01"
                  error={errors.new_table_id}
                />
                {errors.new_table_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.new_table_id}</p>
                )}
              </div>

              {/* Merged Table Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Merged Table Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Tables 1+2+3"
                  error={errors.name}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Total Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Capacity
                </label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  disabled
                />
                <p className="mt-1 text-sm text-gray-500">
                  Automatically calculated from selected tables
                </p>
              </div>

              {/* Merge Summary */}
              {selectedTables.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-3">Merge Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Tables to merge:</span>
                      <span className="font-medium">{selectedTables.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Total capacity:</span>
                      <span className="font-medium">{formData.capacity} guests</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">New table name:</span>
                      <span className="font-medium">{formData.name || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Merge Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Selected tables will be temporarily unavailable during merge</li>
                  <li>• The merged table will appear as a single unit</li>
                  <li>• You can unmerge tables later if needed</li>
                  <li>• All original table properties will be preserved for unmerging</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TableMergeUnmergePage;