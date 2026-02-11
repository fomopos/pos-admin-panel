import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CpuChipIcon,
  IdentificationIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useTenantStore } from '../tenants/tenantStore';
import type { Terminal } from '../tenants/tenantStore';
import { 
  Button, 
  Card, 
  PageHeader, 
  Alert, 
  ConfirmDialog,
  Loading,
  InputTextField,
  Modal
} from '../components/ui';
import { useDeleteConfirmDialog } from '../hooks/useConfirmDialog';

interface TerminalFormData {
  terminal_id: string;
  device_id: string;
  name: string;
  platform: string;
  model: string;
  arch: string;
  status: 'active' | 'inactive';
}

interface TerminalSettingsState {
  terminals: Record<string, Terminal>;
  isLoading: boolean;
  showForm: boolean;
  editingTerminal: Terminal | null;
  errors: Record<string, string>;
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive';
  refreshing: boolean;
}

const TerminalSettings: React.FC = () => {
  const { t } = useTranslation();
  const { currentStore, isLoading: storeLoading, currentTenant } = useTenantStore();
  
  const [state, setState] = useState<TerminalSettingsState>({
    terminals: {},
    isLoading: false,
    showForm: false,
    editingTerminal: null,
    errors: {},
    searchTerm: '',
    statusFilter: 'all',
    refreshing: false
  });

  const deleteDialog = useDeleteConfirmDialog();

  // Load terminals from current store
  useEffect(() => {
    if (currentStore) {
      setState(prev => ({
        ...prev,
        terminals: currentStore.terminals || {}
      }));
    }
  }, [currentStore]);
  
  // Refresh store data on mount to ensure we have fresh terminals
  useEffect(() => {
    const loadFreshData = async () => {
      if (currentStore && currentTenant) {
        try {
          const { storeServices } = await import('../services/store');
          const freshStoreDetails = await storeServices.store.getStoreDetails(currentStore.store_id);
          
          // Update local state with fresh terminals
          if (freshStoreDetails.terminals) {
            setState(prev => ({
              ...prev,
              terminals: freshStoreDetails.terminals || {}
            }));
          }
        } catch (error) {
          console.error('Failed to load fresh store details:', error);
        }
      }
    };
    
    loadFreshData();
  }, []); // Only run on mount

  const handleAddTerminal = () => {
    setState(prev => ({
      ...prev,
      showForm: true,
      editingTerminal: null,
      errors: {}
    }));
  };

  const handleEditTerminal = (terminal: Terminal) => {
    setState(prev => ({
      ...prev,
      showForm: true,
      editingTerminal: terminal,
      errors: {}
    }));
  };

  const handleDeleteTerminal = (terminalId: string) => {
    const terminal = state.terminals[terminalId];
    deleteDialog.openDeleteDialog(
      terminal?.name || terminalId,
      () => {
        // In a real implementation, this would make an API call
        setState(prev => {
          const { [terminalId]: deletedTerminal, ...remainingTerminals } = prev.terminals;
          return {
            ...prev,
            terminals: remainingTerminals
          };
        });
        deleteDialog.closeDialog();
      }
    );
  };

  const handleRefresh = async () => {
    setState(prev => ({ ...prev, refreshing: true }));
    
    try {
      if (currentStore && currentTenant) {
        const { storeServices } = await import('../services/store');
        const freshStoreDetails = await storeServices.store.getStoreDetails(currentStore.store_id);
        
        // Update local state with fresh terminals
        if (freshStoreDetails.terminals) {
          setState(prev => ({
            ...prev,
            terminals: freshStoreDetails.terminals || {}
          }));
        }
      }
    } catch (error) {
      console.error('Failed to refresh store details:', error);
    } finally {
      setState(prev => ({ ...prev, refreshing: false }));
    }
  };

  const handleToggleStatus = async (terminalId: string) => {
    const terminal = state.terminals[terminalId];
    if (!terminal) return;

    setState(prev => ({
      ...prev,
      terminals: {
        ...prev.terminals,
        [terminalId]: {
          ...terminal,
          status: terminal.status === 'active' ? 'inactive' : 'active'
        }
      }
    }));
  };

  const getStatusBadge = (status: 'active' | 'inactive') => {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        status === 'active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {status === 'active' ? (
          <CheckCircleIcon className="w-3 h-3 mr-1" />
        ) : (
          <XCircleIcon className="w-3 h-3 mr-1" />
        )}
        {t(`terminalSettings.status.${status}`)}
      </span>
    );
  };

  const getPlatformIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    
    // iOS
    if (platformLower.includes('ios') || platformLower.includes('iphone') || platformLower.includes('ipad')) {
      return (
        <div className="relative">
          <DevicePhoneMobileIcon className="w-5 h-5 text-slate-700" />
          <span className="absolute -bottom-0.5 -right-0.5 text-[8px]">🍎</span>
        </div>
      );
    }
    
    // Android
    if (platformLower.includes('android')) {
      return (
        <div className="relative">
          <DevicePhoneMobileIcon className="w-5 h-5 text-green-600" />
          <span className="absolute -bottom-0.5 -right-0.5 text-[8px]">🤖</span>
        </div>
      );
    }
    
    // macOS
    if (platformLower.includes('mac') || platformLower.includes('darwin')) {
      return (
        <div className="relative">
          <ComputerDesktopIcon className="w-5 h-5 text-slate-700" />
          <span className="absolute -bottom-0.5 -right-0.5 text-[8px]">🍎</span>
        </div>
      );
    }
    
    // Windows
    if (platformLower.includes('windows') || platformLower.includes('win32')) {
      return (
        <div className="relative">
          <ComputerDesktopIcon className="w-5 h-5 text-blue-600" />
          <span className="absolute -bottom-0.5 -right-0.5 text-[8px]">🪟</span>
        </div>
      );
    }
    
    // Linux
    if (platformLower.includes('linux')) {
      return (
        <div className="relative">
          <ComputerDesktopIcon className="w-5 h-5 text-orange-600" />
          <span className="absolute -bottom-0.5 -right-0.5 text-[8px]">🐧</span>
        </div>
      );
    }
    
    // Default fallback
    return <ComputerDesktopIcon className="w-5 h-5 text-slate-600" />;
  };

  const filteredTerminals = Object.values(state.terminals).filter(terminal => {
    if (!terminal) return false;
    
    const matchesSearch = (terminal.name || '').toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         (terminal.terminal_id || '').toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         (terminal.device_id || '').toLowerCase().includes(state.searchTerm.toLowerCase());
    
    const matchesStatus = state.statusFilter === 'all' || terminal.status === state.statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getTerminalStats = () => {
    const terminals = Object.values(state.terminals);
    const active = terminals.filter(t => t.status === 'active').length;
    const inactive = terminals.filter(t => t.status === 'inactive').length;
    const total = terminals.length;
    
    return { active, inactive, total };
  };

  const stats = getTerminalStats();

  if (storeLoading) {
    return (
      <Loading
        title={t('terminalSettings.loading.title')}
        description={t('terminalSettings.loading.description')}
        fullScreen={false}
        size="lg"
      />
    );
  }

  if (!currentStore) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('terminalSettings.title')}
          description={t('terminalSettings.description')}
        />
        <Alert variant="warning" className="max-w-2xl">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium">{t('terminalSettings.noStore.title')}</h3>
            <div className="mt-1 text-sm">
              {t('terminalSettings.noStore.description')}
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t('terminalSettings.title')}
        description={t('terminalSettings.descriptionWithStore', { storeName: currentStore.store_name })}
      >
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={state.refreshing}
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${state.refreshing ? 'animate-spin' : ''}`} />
            {t('terminalSettings.refresh')}
          </Button>
          <Button onClick={handleAddTerminal} size="sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('terminalSettings.addTerminal')}
          </Button>
        </div>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-blue-100">
              <ComputerDesktopIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">{t('terminalSettings.stats.totalTerminals')}</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">{t('terminalSettings.stats.activeTerminals')}</p>
              <p className="text-2xl font-bold text-green-900">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-red-100">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">{t('terminalSettings.stats.inactiveTerminals')}</p>
              <p className="text-2xl font-bold text-red-900">{stats.inactive}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t('terminalSettings.search.placeholder')}
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 pr-4 py-2 w-64 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <ComputerDesktopIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
            </div>
            
            <select
              value={state.statusFilter}
              onChange={(e) => setState(prev => ({ ...prev, statusFilter: e.target.value as any }))}
              className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('terminalSettings.filters.allStatus')}</option>
              <option value="active">{t('terminalSettings.filters.activeOnly')}</option>
              <option value="inactive">{t('terminalSettings.filters.inactiveOnly')}</option>
            </select>
          </div>

          <div className="text-sm text-slate-500">
            {t('terminalSettings.search.showing', { count: filteredTerminals.length, total: stats.total })}
          </div>
        </div>
      </Card>

      {/* Terminals List */}
      {filteredTerminals.length === 0 ? (
        <Card className="p-12 text-center">
          <ComputerDesktopIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {stats.total === 0 ? t('terminalSettings.empty.noTerminals') : t('terminalSettings.empty.noMatching')}
          </h3>
          <p className="text-slate-500 mb-4">
            {stats.total === 0 
              ? t('terminalSettings.empty.getStarted') 
              : t('terminalSettings.empty.adjustFilters')
            }
          </p>
          {stats.total === 0 && (
            <Button onClick={handleAddTerminal}>
              <PlusIcon className="w-4 h-4 mr-2" />
              {t('terminalSettings.addFirstTerminal')}
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTerminals.map((terminal) => (
            <Card key={terminal.terminal_id} className="p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    terminal.status === 'active' ? 'bg-green-100' : 'bg-slate-100'
                  }`}>
                    {getPlatformIcon(terminal.platform)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{terminal.name}</h3>
                    <p className="text-sm text-slate-500">{terminal.terminal_id}</p>
                  </div>
                </div>
                {getStatusBadge(terminal.status)}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm">
                  <IdentificationIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{t('terminalSettings.details.deviceId')}</span>
                  <span className="font-mono text-slate-900">{terminal.device_id}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <CpuChipIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{t('terminalSettings.details.platform')}</span>
                  <span className="text-slate-900">{terminal.platform}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <ComputerDesktopIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{t('terminalSettings.details.model')}</span>
                  <span className="text-slate-900">{terminal.model}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <BoltIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{t('terminalSettings.details.architecture')}</span>
                  <span className="text-slate-900">{terminal.arch}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleToggleStatus(terminal.terminal_id)}
                    variant="outline"
                    size="sm"
                    className={terminal.status === 'active' ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-green-300 text-green-600 hover:bg-green-50'}
                  >
                    {terminal.status === 'active' ? t('terminalSettings.status.deactivate') : t('terminalSettings.status.activate')}
                  </Button>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    onClick={() => handleEditTerminal(terminal)}
                    variant="outline"
                    size="sm"
                    className="p-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteTerminal(terminal.terminal_id)}
                    variant="outline"
                    size="sm"
                    className="p-2 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Terminal Form Modal */}
      <TerminalFormModal
        isOpen={state.showForm}
        terminal={state.editingTerminal}
        onClose={() => setState(prev => ({ ...prev, showForm: false, editingTerminal: null }))}
        onSave={(terminalData) => {
          const isEditing = state.editingTerminal !== null;
          const terminalId = isEditing ? state.editingTerminal!.terminal_id : terminalData.terminal_id;
          
          setState(prev => ({
            ...prev,
            terminals: {
              ...prev.terminals,
              [terminalId]: {
                ...terminalData,
                terminal_id: terminalId
              }
            },
            showForm: false,
            editingTerminal: null
          }));
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.dialogState.isOpen}
        title={deleteDialog.dialogState.title}
        message={deleteDialog.dialogState.message}
        onConfirm={deleteDialog.handleConfirm}
        onClose={deleteDialog.closeDialog}
        variant={deleteDialog.dialogState.variant}
        confirmText={deleteDialog.dialogState.confirmText}
        cancelText={deleteDialog.dialogState.cancelText}
        isLoading={deleteDialog.dialogState.isLoading}
      />
    </div>
  );
};

// Terminal Form Modal Component
interface TerminalFormModalProps {
  isOpen: boolean;
  terminal: Terminal | null;
  onClose: () => void;
  onSave: (terminal: Terminal) => void;
}

const TerminalFormModal: React.FC<TerminalFormModalProps> = ({
  isOpen,
  terminal,
  onClose,
  onSave
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<TerminalFormData>({
    terminal_id: '',
    device_id: '',
    name: '',
    platform: '',
    model: '',
    arch: '',
    status: 'active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = terminal !== null;

  useEffect(() => {
    if (terminal) {
      setFormData({
        terminal_id: terminal.terminal_id,
        device_id: terminal.device_id,
        name: terminal.name,
        platform: terminal.platform,
        model: terminal.model,
        arch: terminal.arch,
        status: terminal.status
      });
    } else {
      setFormData({
        terminal_id: '',
        device_id: '',
        name: '',
        platform: '',
        model: '',
        arch: '',
        status: 'active'
      });
    }
    setErrors({});
  }, [terminal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.terminal_id.trim()) newErrors.terminal_id = t('terminalSettings.form.errors.terminalIdRequired');
    if (!formData.device_id.trim()) newErrors.device_id = t('terminalSettings.form.errors.deviceIdRequired');
    if (!formData.name.trim()) newErrors.name = t('terminalSettings.form.errors.nameRequired');
    if (!formData.platform.trim()) newErrors.platform = t('terminalSettings.form.errors.platformRequired');
    if (!formData.model.trim()) newErrors.model = t('terminalSettings.form.errors.modelRequired');
    if (!formData.arch.trim()) newErrors.arch = t('terminalSettings.form.errors.archRequired');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave({
        terminal_id: formData.terminal_id,
        device_id: formData.device_id,
        name: formData.name,
        platform: formData.platform,
        model: formData.model,
        arch: formData.arch,
        status: formData.status
      });
    } catch (error) {
      setErrors({ general: t('terminalSettings.form.errors.saveFailed') });
    } finally {
      setIsLoading(false);
    }
  };

  const platformOptions = [
    { value: 'Android', label: t('terminalSettings.platforms.android') },
    { value: 'iOS', label: t('terminalSettings.platforms.ios') },
    { value: 'macOS', label: t('terminalSettings.platforms.macos') },
    { value: 'Windows', label: t('terminalSettings.platforms.windows') },
    { value: 'Linux', label: t('terminalSettings.platforms.linux') },
    { value: 'Web', label: t('terminalSettings.platforms.web') }
  ];

  const archOptions = [
    { value: 'arm64', label: t('terminalSettings.architectures.arm64') },
    { value: 'x86_64', label: t('terminalSettings.architectures.x86_64') },
    { value: 'x86', label: t('terminalSettings.architectures.x86') },
    { value: 'armv7', label: t('terminalSettings.architectures.armv7') }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t('terminalSettings.editTerminal') : t('terminalSettings.addTerminal')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <Alert variant="error">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <div className="ml-3">
              <p className="text-sm">{errors.general}</p>
            </div>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputTextField
            label={t('terminalSettings.form.terminalId')}
            value={formData.terminal_id}
            onChange={(value) => setFormData(prev => ({ ...prev, terminal_id: value }))}
            error={errors.terminal_id}
            placeholder={t('terminalSettings.form.placeholders.terminalId')}
            disabled={isEditing}
            required
          />

          <InputTextField
            label={t('terminalSettings.form.deviceId')}
            value={formData.device_id}
            onChange={(value) => setFormData(prev => ({ ...prev, device_id: value }))}
            error={errors.device_id}
            placeholder={t('terminalSettings.form.placeholders.deviceId')}
            required
          />

          <InputTextField
            label={t('terminalSettings.form.terminalName')}
            value={formData.name}
            onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            error={errors.name}
            placeholder={t('terminalSettings.form.placeholders.terminalName')}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('terminalSettings.form.platform')} *
            </label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.platform ? 'border-red-300' : 'border-slate-300'
              }`}
              required
            >
              <option value="">{t('terminalSettings.form.selectPlatform')}</option>
              {platformOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.platform && (
              <p className="mt-1 text-sm text-red-600">{errors.platform}</p>
            )}
          </div>

          <InputTextField
            label={t('terminalSettings.form.model')}
            value={formData.model}
            onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
            error={errors.model}
            placeholder={t('terminalSettings.form.placeholders.model')}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('terminalSettings.form.architecture')} *
            </label>
            <select
              value={formData.arch}
              onChange={(e) => setFormData(prev => ({ ...prev, arch: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.arch ? 'border-red-300' : 'border-slate-300'
              }`}
              required
            >
              <option value="">{t('terminalSettings.form.selectArchitecture')}</option>
              {archOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.arch && (
              <p className="mt-1 text-sm text-red-600">{errors.arch}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('terminalSettings.form.status')}
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">{t('terminalSettings.status.active')}</option>
            <option value="inactive">{t('terminalSettings.status.inactive')}</option>
          </select>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('terminalSettings.actions.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('terminalSettings.actions.saving') : (isEditing ? t('terminalSettings.actions.updateTerminal') : t('terminalSettings.actions.addTerminal'))}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TerminalSettings;
