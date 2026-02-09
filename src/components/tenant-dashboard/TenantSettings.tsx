import React, { useState, useEffect } from 'react';
import {
  Widget,
  Button,
  InputTextField,
  DropdownSearch,
  PropertyCheckbox,
  Loading,
} from '../ui';
import { useTenantRole } from '../../hooks/useTenantRole';
import { useError } from '../../hooks/useError';
import { tenantSettingsService } from '../../services/tenant-dashboard/tenantDashboardService';
import type { TenantSettings as TenantSettingsType, UpdateTenantSettingsRequest } from '../../services/types/tenant-dashboard.types';
import {
  Cog6ToothIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  BellIcon,
  PaintBrushIcon,
} from '@heroicons/react/24/outline';

// Common timezone options
const timezoneOptions = [
  { id: 'America/New_York', label: 'Eastern Time (ET)', description: 'UTC-5' },
  { id: 'America/Chicago', label: 'Central Time (CT)', description: 'UTC-6' },
  { id: 'America/Denver', label: 'Mountain Time (MT)', description: 'UTC-7' },
  { id: 'America/Los_Angeles', label: 'Pacific Time (PT)', description: 'UTC-8' },
  { id: 'America/Anchorage', label: 'Alaska Time (AKT)', description: 'UTC-9' },
  { id: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', description: 'UTC-10' },
  { id: 'Europe/London', label: 'London (GMT)', description: 'UTC+0' },
  { id: 'Europe/Paris', label: 'Paris (CET)', description: 'UTC+1' },
  { id: 'Europe/Berlin', label: 'Berlin (CET)', description: 'UTC+1' },
  { id: 'Asia/Kolkata', label: 'India (IST)', description: 'UTC+5:30' },
  { id: 'Asia/Tokyo', label: 'Tokyo (JST)', description: 'UTC+9' },
  { id: 'Asia/Shanghai', label: 'Shanghai (CST)', description: 'UTC+8' },
  { id: 'Asia/Dubai', label: 'Dubai (GST)', description: 'UTC+4' },
  { id: 'Australia/Sydney', label: 'Sydney (AEST)', description: 'UTC+10' },
];

const currencyOptions = [
  { id: 'USD', label: 'USD', description: 'US Dollar' },
  { id: 'EUR', label: 'EUR', description: 'Euro' },
  { id: 'GBP', label: 'GBP', description: 'British Pound' },
  { id: 'INR', label: 'INR', description: 'Indian Rupee' },
  { id: 'JPY', label: 'JPY', description: 'Japanese Yen' },
  { id: 'CAD', label: 'CAD', description: 'Canadian Dollar' },
  { id: 'AUD', label: 'AUD', description: 'Australian Dollar' },
  { id: 'AED', label: 'AED', description: 'UAE Dirham' },
  { id: 'SGD', label: 'SGD', description: 'Singapore Dollar' },
  { id: 'CHF', label: 'CHF', description: 'Swiss Franc' },
];

const TenantSettingsComponent: React.FC = () => {
  const { can } = useTenantRole();
  const { showError, showInfo } = useError();

  const [settings, setSettings] = useState<TenantSettingsType | null>(null);
  const [originalSettings, setOriginalSettings] = useState<TenantSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canManageSettings = can('canManageSettings');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await tenantSettingsService.getSettings();
      setSettings(data);
      setOriginalSettings(data);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const hasChanges = settings && originalSettings
    ? JSON.stringify(settings) !== JSON.stringify(originalSettings)
    : false;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!settings?.name.trim()) {
      newErrors.name = 'Tenant name is required';
    } else if (settings.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (settings.name.length > 100) {
      newErrors.name = 'Name must not exceed 100 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!settings || !validateForm()) return;

    try {
      setSaving(true);
      const updateData: UpdateTenantSettingsRequest = {
        name: settings.name,
        default_currency: settings.default_currency,
        default_timezone: settings.default_timezone,
        notification_preferences: settings.notification_preferences,
        branding: settings.branding,
      };

      const updated = await tenantSettingsService.updateSettings(updateData);
      setSettings(updated);
      setOriginalSettings(updated);
      showInfo('Tenant settings saved successfully!');
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalSettings) {
      setSettings({ ...originalSettings });
      setErrors({});
    }
  };

  if (loading) {
    return <Loading title="Loading Settings" description="Fetching tenant settings..." />;
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <Cog6ToothIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Unable to load tenant settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-6"
      >
        {/* Basic Information */}
        <Widget
          title="Organization Information"
          description="Basic details about your organization"
          icon={BuildingOfficeIcon}
          variant="default"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputTextField
              label="Tenant Name"
              required
              value={settings.name}
              onChange={(value) => {
                setSettings((prev) => prev ? { ...prev, name: value } : prev);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="Your organization name"
              error={errors.name}
              disabled={!canManageSettings || saving}
            />
            <InputTextField
              label="Tenant ID"
              value={settings.tenant_id}
              onChange={() => {}}
              disabled
              helperText="Unique identifier — cannot be changed"
            />
          </div>
        </Widget>

        {/* Branding */}
        <Widget
          title="Branding"
          description="Customize your organization's visual identity"
          icon={PaintBrushIcon}
          variant="default"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputTextField
              label="Logo URL"
              value={settings.logo_url || ''}
              onChange={(value) => setSettings((prev) => prev ? { ...prev, logo_url: value } : prev)}
              placeholder="https://example.com/logo.png"
              helperText="URL to your organization's logo image"
              disabled={!canManageSettings || saving}
            />
            <InputTextField
              label="Primary Brand Color"
              value={settings.branding?.primary_color || ''}
              onChange={(value) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        branding: { ...prev.branding, primary_color: value },
                      }
                    : prev
                )
              }
              placeholder="#3b82f6"
              helperText="Hex color code for your brand"
              disabled={!canManageSettings || saving}
            />
          </div>
          {settings.logo_url && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Logo Preview:</p>
              <img
                src={settings.logo_url}
                alt="Tenant logo"
                className="h-12 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </Widget>

        {/* Regional Settings */}
        <Widget
          title="Regional Settings"
          description="Default currency and timezone for your organization"
          icon={GlobeAltIcon}
          variant="default"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DropdownSearch
              label="Default Currency"
              value={settings.default_currency}
              options={currencyOptions}
              onSelect={(option) =>
                setSettings((prev) =>
                  prev ? { ...prev, default_currency: option?.id || 'USD' } : prev
                )
              }
              placeholder="Select currency"
              disabled={!canManageSettings || saving}
            />
            <DropdownSearch
              label="Default Timezone"
              value={settings.default_timezone}
              options={timezoneOptions}
              onSelect={(option) =>
                setSettings((prev) =>
                  prev ? { ...prev, default_timezone: option?.id || 'America/New_York' } : prev
                )
              }
              placeholder="Select timezone"
              disabled={!canManageSettings || saving}
            />
          </div>
        </Widget>

        {/* Notification Preferences */}
        <Widget
          title="Notification Preferences"
          description="Control which emails and alerts you receive"
          icon={BellIcon}
          variant="default"
        >
          <div className="space-y-4">
            <PropertyCheckbox
              title="Billing Emails"
              description="Receive email notifications about invoices, payment confirmations, and billing changes"
              checked={settings.notification_preferences.billing_emails}
              onChange={(checked) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          billing_emails: checked,
                        },
                      }
                    : prev
                )
              }
              disabled={!canManageSettings || saving}
            />
            <PropertyCheckbox
              title="User Activity Emails"
              description="Get notified when users are invited, removed, or have role changes"
              checked={settings.notification_preferences.user_activity_emails}
              onChange={(checked) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          user_activity_emails: checked,
                        },
                      }
                    : prev
                )
              }
              disabled={!canManageSettings || saving}
            />
            <PropertyCheckbox
              title="Store Alerts"
              description="Receive alerts about store status changes and important store events"
              checked={settings.notification_preferences.store_alerts}
              onChange={(checked) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          store_alerts: checked,
                        },
                      }
                    : prev
                )
              }
              disabled={!canManageSettings || saving}
            />
            <PropertyCheckbox
              title="Marketing Emails"
              description="Receive product updates, feature announcements, and tips"
              checked={settings.notification_preferences.marketing_emails}
              onChange={(checked) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          marketing_emails: checked,
                        },
                      }
                    : prev
                )
              }
              disabled={!canManageSettings || saving}
            />
          </div>
        </Widget>

        {/* Save / Cancel Actions */}
        {canManageSettings && hasChanges && (
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button variant="outline" type="button" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={saving} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default TenantSettingsComponent;
