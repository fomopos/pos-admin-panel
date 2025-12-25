import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeftIcon,
  CloudArrowUpIcon,
  InformationCircleIcon,
  MapPinIcon,
  TrashIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { tableApiService } from '../../services/table';
import { 
  PageHeader, 
  Button, 
  Widget,
  InputTextField,
  InputTextArea,
  DropdownSearch,
  PropertyCheckbox,
  Loading,
  ConfirmDialog
} from '../../components/ui';
import { useError } from '../../hooks/useError';
import { useDeleteConfirmDialog } from '../../hooks/useConfirmDialog';
import type { 
  EnhancedZone,
  TableStatus,
  TableShape,
  DropdownSearchOption 
} from '../../types/table';
import useTenantStore from '../../tenants/tenantStore';

const TableEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tableId } = useParams<{ tableId: string }>();
  const isEditing = tableId !== 'new' && tableId !== undefined;
  const { showError, showSuccess } = useError();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [zones, setZones] = useState<EnhancedZone[]>([]);
  const { currentTenant, currentStore } = useTenantStore();

  // Dialog hooks
  const deleteDialog = useDeleteConfirmDialog();

  const [originalData, setOriginalData] = useState<typeof formData | null>(null);
  const [formData, setFormData] = useState({
    table_id: '',
    table_number: '',
    description: '',
    zone_id: '' as string | undefined,
    floor_plan_id: '' as string | undefined,
    capacity: 4,
    min_capacity: 1,
    max_capacity: 8,
    shape: 'square' as TableShape,
    position_x: 0,
    position_y: 0,
    width: 80,
    height: 80,
    rotation: 0,
    is_combinable: true,
    status: 'available' as TableStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Shape options for table visualization
  const shapeOptions: DropdownSearchOption[] = [
    { id: 'round', label: t('tables.table.shapes.round') },
    { id: 'square', label: t('tables.table.shapes.square') },
    { id: 'rectangle', label: t('tables.table.shapes.rectangle') },
    { id: 'oval', label: t('tables.table.shapes.oval') },
  ];

  // Status options
  const statusOptions: DropdownSearchOption[] = [
    { id: 'available', label: t('tables.status.available'), description: t('tables.table.statusDesc.available') },
    { id: 'occupied', label: t('tables.status.occupied'), description: t('tables.table.statusDesc.occupied') },
    { id: 'reserved', label: t('tables.status.reserved'), description: t('tables.table.statusDesc.reserved') },
    { id: 'out_of_order', label: t('tables.status.outOfOrder'), description: t('tables.table.statusDesc.outOfOrder') },
    { id: 'cleaning', label: t('tables.status.cleaning'), description: t('tables.table.statusDesc.cleaning') },
  ];

  useEffect(() => {
    loadInitialData();
  }, [tableId]);

  // Track changes
  useEffect(() => {
    if (!isEditing) {
      const hasData = formData.table_number.trim() !== '';
      setHasChanges(hasData);
    } else if (originalData) {
      const hasChanged = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(hasChanged);
    }
  }, [formData, originalData, isEditing]);

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
        const loadedData = {
          table_id: tableData.table_id,
          table_number: tableData.table_number || '',
          description: tableData.description || '',
          zone_id: tableData.zone_id || undefined,
          floor_plan_id: tableData.floor_plan_id || undefined,
          capacity: tableData.capacity || 4,
          min_capacity: tableData.min_capacity || 1,
          max_capacity: tableData.max_capacity || 8,
          shape: (tableData.shape || 'square') as TableShape,
          position_x: tableData.position_x || 0,
          position_y: tableData.position_y || 0,
          width: tableData.width || 80,
          height: tableData.height || 80,
          rotation: tableData.rotation || 0,
          is_combinable: tableData.is_combinable ?? true,
          status: tableData.status || 'available',
        };
        setFormData(loadedData);
        setOriginalData(loadedData);
      }
    } catch (error) {
      console.error('Failed to load table data:', error);
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.table_number.trim()) {
      newErrors.table_number = t('tables.table.errors.tableNumberRequired');
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = t('tables.table.errors.capacityMin');
    }

    if (formData.capacity > 50) {
      newErrors.capacity = t('tables.table.errors.capacityMax');
    }

    if (formData.min_capacity && formData.max_capacity && formData.min_capacity > formData.max_capacity) {
      newErrors.min_capacity = t('tables.table.errors.minGreaterThanMax');
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

      // Map form data to API request format
      const requestData = {
        table_id: formData.table_id || undefined,
        table_number: formData.table_number,
        description: formData.description || undefined,
        zone_id: formData.zone_id || undefined,
        floor_plan_id: formData.floor_plan_id || undefined,
        capacity: formData.capacity,
        min_capacity: formData.min_capacity,
        max_capacity: formData.max_capacity,
        shape: formData.shape,
        position_x: formData.position_x,
        position_y: formData.position_y,
        width: formData.width,
        height: formData.height,
        rotation: formData.rotation,
        is_combinable: formData.is_combinable,
        status: formData.status,
      };

      if (isEditing && tableId) {
        await tableApiService.updateTable(tableId, requestData, context);
        showSuccess(t('tables.table.updateSuccess'));
        setHasChanges(false);
      } else {
        await tableApiService.createTable(requestData, context);
        showSuccess(t('tables.table.createSuccess'));
        setHasChanges(false);
        setTimeout(() => navigate('/tables'), 1500);
      }
    } catch (error) {
      console.error('Failed to save table:', error);
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!tableId) return;

    deleteDialog.openDeleteDialog(
      formData.table_number,
      async () => {
        try {
          const context = {
            tenant_id: currentTenant?.id,
            store_id: currentStore?.store_id,
          };
          await tableApiService.deleteTable(tableId, context);
          showSuccess(t('tables.table.deleteSuccess', { name: formData.table_number }));
          navigate('/tables');
        } catch (error: any) {
          if (error.code === 409) {
            showError(t('tables.table.deleteErrorHasReservations'));
          } else {
            showError(t('tables.table.deleteError'));
          }
        }
      }
    );
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
        label: t('tables.table.noZone'),
        description: t('tables.table.noZoneDescription'),
      }
    ];

    zones.filter(z => z.status === 'active').forEach(zone => {
      options.push({
        id: zone.zone_id,
        label: zone.zone_name,
        description: zone.description || t('tables.table.tableZone'),
      });
    });

    return options;
  };

  const getSelectedZoneName = (): string => {
    if (!formData.zone_id) return t('tables.table.noZone');
    const zone = zones.find(z => z.zone_id === formData.zone_id);
    return zone?.zone_name || t('tables.table.unknownZone');
  };

  if (loading) {
    return (
      <Loading 
        title={isEditing ? t('tables.table.loading') : t('tables.table.preparingForm')}
        description={t('common.loadingDescription')}
        size="lg"
        fullScreen={true}
      />
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <PageHeader
        title={isEditing ? t('tables.table.edit') : t('tables.table.create')}
        description={isEditing ? t('tables.table.editDescription') : t('tables.table.createDescription')}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/tables')}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>{t('tables.table.backToTables')}</span>
          </Button>
          
          {hasChanges && (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t('common.saving')}</span>
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="h-4 w-4" />
                  <span>{isEditing ? t('tables.table.updateTable') : t('tables.table.createTable')}</span>
                </>
              )}
            </Button>
          )}

          {isEditing && (
            <Button
              onClick={handleDelete}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {t('common.delete')}
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information Widget */}
        <Widget
          title={t('tables.table.basicInfo')}
          description={t('tables.table.basicInfoDescription')}
          icon={InformationCircleIcon}
          className="lg:col-span-2 overflow-visible"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputTextField
              label={t('tables.table.tableNumber')}
              required
              value={formData.table_number}
              onChange={(value) => handleInputChange('table_number', value)}
              placeholder={t('tables.table.tableNumberPlaceholder')}
              error={errors.table_number}
            />

            <InputTextField
              label={t('tables.table.tableId')}
              value={formData.table_id}
              onChange={(value) => handleInputChange('table_id', value)}
              placeholder={t('tables.table.tableIdPlaceholder')}
              disabled={isEditing}
              helperText={isEditing ? t('tables.table.tableIdCannotChange') : t('tables.table.tableIdAutoGenerate')}
            />

            <DropdownSearch
              label={t('tables.table.zoneAssignment')}
              value={formData.zone_id || ''}
              options={getZoneDropdownOptions()}
              onSelect={(option) => handleInputChange('zone_id', option?.id || undefined)}
              displayValue={() => getSelectedZoneName()}
              placeholder={t('tables.table.selectZone')}
              allowClear
              clearLabel={t('tables.table.noZone')}
            />

            <DropdownSearch
              label={t('tables.table.shape')}
              value={formData.shape}
              options={shapeOptions}
              onSelect={(option) => handleInputChange('shape', (option?.id || 'square') as TableShape)}
              displayValue={() => shapeOptions.find(s => s.id === formData.shape)?.label || t('tables.table.shapes.square')}
              placeholder={t('tables.table.selectShape')}
            />

            <div className="md:col-span-2">
              <InputTextArea
                label={t('tables.table.description')}
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                placeholder={t('tables.table.descriptionPlaceholder')}
                rows={3}
              />
            </div>
          </div>
        </Widget>

        {/* Capacity & Settings Widget */}
        <Widget
          title={t('tables.table.capacitySettings')}
          description={t('tables.table.capacitySettingsDescription')}
          icon={UserGroupIcon}
        >
          <div className="space-y-6">
            <InputTextField
              label={t('tables.table.capacity')}
              type="number"
              required
              min={1}
              max={50}
              value={formData.capacity}
              onChange={(value) => handleInputChange('capacity', parseInt(value) || 1)}
              placeholder="4"
              error={errors.capacity}
              helperText={t('tables.table.capacityHelpText')}
            />

            <div className="grid grid-cols-2 gap-4">
              <InputTextField
                label={t('tables.table.minCapacity')}
                type="number"
                min={1}
                value={formData.min_capacity}
                onChange={(value) => handleInputChange('min_capacity', parseInt(value) || 1)}
                placeholder="1"
                error={errors.min_capacity}
              />

              <InputTextField
                label={t('tables.table.maxCapacity')}
                type="number"
                min={1}
                value={formData.max_capacity}
                onChange={(value) => handleInputChange('max_capacity', parseInt(value) || 10)}
                placeholder="8"
              />
            </div>

            <p className="text-sm text-gray-500">
              {t('tables.table.capacityRangeHelpText')}
            </p>

            <div className="border-t pt-6">
              <DropdownSearch
                label={t('tables.table.status')}
                value={formData.status}
                options={statusOptions}
                onSelect={(option) => handleInputChange('status', (option?.id || 'available') as TableStatus)}
                displayValue={() => statusOptions.find(s => s.id === formData.status)?.label || t('tables.status.available')}
                placeholder={t('tables.table.selectStatus')}
              />
            </div>

            <PropertyCheckbox
              title={t('tables.table.combinable')}
              description={t('tables.table.combinableDescription')}
              checked={formData.is_combinable}
              onChange={(checked) => handleInputChange('is_combinable', checked)}
            />
          </div>
        </Widget>

        {/* Layout Position Widget */}
        <Widget
          title={t('tables.table.layoutPosition')}
          description={t('tables.table.layoutPositionDescription')}
          icon={MapPinIcon}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <InputTextField
                label={t('tables.table.positionX')}
                type="number"
                value={formData.position_x}
                onChange={(value) => handleInputChange('position_x', parseFloat(value) || 0)}
                placeholder="0"
              />

              <InputTextField
                label={t('tables.table.positionY')}
                type="number"
                value={formData.position_y}
                onChange={(value) => handleInputChange('position_y', parseFloat(value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputTextField
                label={t('tables.table.width')}
                type="number"
                min={20}
                value={formData.width}
                onChange={(value) => handleInputChange('width', parseFloat(value) || 80)}
                placeholder="80"
              />

              <InputTextField
                label={t('tables.table.height')}
                type="number"
                min={20}
                value={formData.height}
                onChange={(value) => handleInputChange('height', parseFloat(value) || 80)}
                placeholder="80"
              />
            </div>

            <InputTextField
              label={t('tables.table.rotation')}
              type="number"
              min={0}
              max={360}
              value={formData.rotation}
              onChange={(value) => handleInputChange('rotation', parseInt(value) || 0)}
              placeholder="0"
              helperText={t('tables.table.rotationHelpText')}
            />

            {/* Table Preview */}
            <div className="border-t pt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('tables.table.preview')}</h4>
              <div className="flex items-center justify-center p-6 bg-gray-100 rounded-lg border border-gray-200 min-h-[150px]">
                <div 
                  className="bg-blue-500 flex items-center justify-center text-white font-semibold shadow-lg transition-all"
                  style={{
                    width: `${Math.min(formData.width, 120)}px`,
                    height: `${Math.min(formData.height, 120)}px`,
                    borderRadius: formData.shape === 'round' || formData.shape === 'oval' ? '50%' : '8px',
                    transform: `rotate(${formData.rotation}deg)`,
                  }}
                >
                  {formData.table_number || 'T1'}
                </div>
              </div>
            </div>
          </div>
        </Widget>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.dialogState.isOpen}
        onClose={deleteDialog.closeDialog}
        onConfirm={deleteDialog.handleConfirm}
        title={deleteDialog.dialogState.title}
        message={deleteDialog.dialogState.message}
        confirmText={deleteDialog.dialogState.confirmText}
        cancelText={deleteDialog.dialogState.cancelText}
        variant={deleteDialog.dialogState.variant}
        isLoading={deleteDialog.dialogState.isLoading}
      />
    </div>
  );
};

export default TableEditPage;