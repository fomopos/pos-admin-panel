import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  BuildingOfficeIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  InformationCircleIcon,
  SwatchIcon,
  Cog6ToothIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { tableApiService } from '../../services/table';
import { 
  PageHeader, 
  Button, 
  Widget,
  InputTextField,
  InputTextArea,
  PropertyCheckbox,
  Loading,
  ConfirmDialog
} from '../../components/ui';
import { useError } from '../../hooks/useError';
import { useDeleteConfirmDialog } from '../../hooks/useConfirmDialog';
import type { ZoneStatus } from '../../types/table';
import useTenantStore from '../../tenants/tenantStore';

const ZoneEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { zoneId } = useParams<{ zoneId: string }>();
  const isEditing = zoneId !== 'new' && zoneId !== undefined;
  const { showError, showSuccess } = useError();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { currentTenant, currentStore } = useTenantStore();

  // Dialog hooks
  const deleteDialog = useDeleteConfirmDialog();

  const [originalData, setOriginalData] = useState<typeof formData | null>(null);
  const [formData, setFormData] = useState({
    zone_id: '',
    zone_name: '',
    description: '',
    color: '#3B82F6',
    capacity: undefined as number | undefined,
    display_order: 1,
    status: 'active' as ZoneStatus,
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

  // Track changes
  useEffect(() => {
    if (!isEditing) {
      const hasData = formData.zone_name.trim() !== '';
      setHasChanges(hasData);
    } else if (originalData) {
      const hasChanged = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(hasChanged);
    }
  }, [formData, originalData, isEditing]);

  const loadZoneData = async () => {
    try {
      setLoading(true);
      
      const context = {
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      };

      const zoneData = await tableApiService.getZone(zoneId!, context);
      const loadedData = {
        zone_id: zoneData.zone_id,
        zone_name: zoneData.zone_name,
        description: zoneData.description || '',
        color: zoneData.color || '#3B82F6',
        capacity: zoneData.capacity,
        display_order: zoneData.display_order || 1,
        status: zoneData.status || 'active',
      };
      setFormData(loadedData);
      setOriginalData(loadedData);
    } catch (error) {
      console.error('Failed to load zone data:', error);
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.zone_name.trim()) {
      newErrors.zone_name = 'Zone name is required';
    }

    if (formData.display_order !== undefined && formData.display_order < 0) {
      newErrors.display_order = 'Display order must be 0 or greater';
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
        zone_id: formData.zone_id || undefined,
        zone_name: formData.zone_name,
        description: formData.description || undefined,
        color: formData.color,
        capacity: formData.capacity,
        display_order: formData.display_order,
        status: formData.status,
      };

      if (isEditing && zoneId) {
        await tableApiService.updateZone(zoneId, requestData, context);
        showSuccess(t('tables.zones.updateSuccess'));
        setHasChanges(false);
      } else {
        await tableApiService.createZone(requestData, context);
        showSuccess(t('tables.zones.createSuccess'));
        setHasChanges(false);
        setTimeout(() => navigate('/tables?tab=zones'), 1500);
      }
    } catch (error) {
      console.error('Failed to save zone:', error);
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!zoneId) return;

    deleteDialog.openDeleteDialog(
      formData.zone_name,
      async () => {
        try {
          const context = {
            tenant_id: currentTenant?.id,
            store_id: currentStore?.store_id,
          };
          await tableApiService.deleteZone(zoneId, context);
          showSuccess(t('tables.zones.deleteSuccess', { name: formData.zone_name }));
          navigate('/tables?tab=zones');
        } catch (error: any) {
          if (error.code === 409 || error.code === 4007) {
            showError(t('tables.zones.deleteErrorHasTables'));
          } else {
            showError(t('tables.zones.deleteError'));
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

  if (loading) {
    return (
      <Loading 
        title={isEditing ? t('tables.zones.loading') : t('tables.zones.preparingForm')}
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
        title={isEditing ? t('tables.zones.edit') : t('tables.zones.create')}
        description={isEditing ? t('tables.zones.editDescription') : t('tables.zones.createDescription')}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/tables?tab=zones')}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>{t('tables.zones.backToZones')}</span>
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
                  <span>{isEditing ? t('tables.zones.updateZone') : t('tables.zones.createZone')}</span>
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
          title={t('tables.zones.basicInfo')}
          description={t('tables.zones.basicInfoDescription')}
          icon={InformationCircleIcon}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputTextField
              label={t('tables.zones.zoneName')}
              required
              value={formData.zone_name}
              onChange={(value) => handleInputChange('zone_name', value)}
              placeholder={t('tables.zones.zoneNamePlaceholder')}
              error={errors.zone_name}
            />

            <InputTextField
              label={t('tables.zones.zoneId')}
              value={formData.zone_id}
              onChange={(value) => handleInputChange('zone_id', value)}
              placeholder={t('tables.zones.zoneIdPlaceholder')}
              disabled={isEditing}
              helperText={isEditing ? t('tables.zones.zoneIdCannotChange') : t('tables.zones.zoneIdAutoGenerate')}
            />
          </div>

          <div className="mt-6">
            <InputTextArea
              label={t('tables.zones.description')}
              value={formData.description}
              onChange={(value) => handleInputChange('description', value)}
              placeholder={t('tables.zones.descriptionPlaceholder')}
              rows={3}
            />
          </div>
        </Widget>

        {/* Appearance Widget */}
        <Widget
          title={t('tables.zones.appearance')}
          description={t('tables.zones.appearanceDescription')}
          icon={SwatchIcon}
        >
          <div className="space-y-6">
            {/* Color Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('tables.zones.color')}
              </label>
              <div className="flex items-center space-x-4">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: formData.color }}
                ></div>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-12 h-10 p-1 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="#3B82F6"
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Color Presets */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">{t('tables.zones.quickColors')}</p>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleInputChange('color', preset.value)}
                      className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                        formData.color === preset.value ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-400' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                {t('tables.zones.colorHelpText')}
              </p>
            </div>

            {/* Preview */}
            <div className="border-t pt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('tables.zones.preview')}</h4>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: formData.color }}
                >
                  <BuildingOfficeIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {formData.zone_name || t('tables.zones.zoneName')}
                  </p>
                  {formData.description && (
                    <p className="text-sm text-gray-600 line-clamp-1">{formData.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Widget>

        {/* Settings Widget */}
        <Widget
          title={t('tables.zones.settings')}
          description={t('tables.zones.settingsDescription')}
          icon={Cog6ToothIcon}
        >
          <div className="space-y-6">
            <InputTextField
              label={t('tables.zones.capacity')}
              type="number"
              min={1}
              value={formData.capacity || ''}
              onChange={(value) => handleInputChange('capacity', value ? parseInt(value) : undefined)}
              placeholder={t('tables.zones.capacityPlaceholder')}
              helperText={t('tables.zones.capacityHelpText')}
            />

            <InputTextField
              label={t('tables.zones.displayOrder')}
              type="number"
              min={0}
              value={formData.display_order}
              onChange={(value) => handleInputChange('display_order', parseInt(value) || 0)}
              placeholder="1"
              error={errors.display_order}
              helperText={t('tables.zones.displayOrderHelpText')}
            />

            <div className="border-t pt-6">
              <PropertyCheckbox
                title={t('tables.zones.activeZone')}
                description={t('tables.zones.activeZoneDescription')}
                checked={formData.status === 'active'}
                onChange={(checked) => handleInputChange('status', checked ? 'active' : 'inactive')}
              />
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

export default ZoneEditPage;