import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeftIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  TableCellsIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { tableApiService } from '../../services/table';
import { 
  PageHeader, 
  Button, 
  Widget,
  Alert,
  Loading,
  InputTextField
} from '../../components/ui';
import { useError } from '../../hooks/useError';
import type { 
  TableMergeRequest,
  EnhancedTable,
  EnhancedZone
} from '../../types/table';
import useTenantStore from '../../tenants/tenantStore';

const TableMergeUnmergePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showError, showSuccess } = useError();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tables, setTables] = useState<EnhancedTable[]>([]);
  const [zones, setZones] = useState<EnhancedZone[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentTenant, currentStore } = useTenantStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  // Track changes
  useEffect(() => {
    setHasChanges(selectedTables.length >= 2);
  }, [selectedTables]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const context = {
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      };

      // Load tables that are combinable
      const [tablesData, zonesData] = await Promise.all([
        tableApiService.getTables(context, { is_combinable: true }),
        tableApiService.getZones(context)
      ]);
      
      setTables(tablesData);
      setZones(zonesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedTables.length < 2) {
      newErrors.tables = t('tables.merge.errors.minTables');
    }

    // Check if all selected tables are combinable
    const nonCombinableTables = selectedTables.filter(tableId => {
      const table = tables.find(t => t.table_id === tableId);
      return table && !table.is_combinable;
    });

    if (nonCombinableTables.length > 0) {
      newErrors.tables = t('tables.merge.errors.notCombinable');
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

      const mergeRequest: TableMergeRequest = {
        tbl_ids: selectedTables,
      };

      await tableApiService.mergeTables(mergeRequest, context);
      showSuccess(t('tables.merge.success'));
      setHasChanges(false);
      setTimeout(() => navigate('/tables'), 1500);
    } catch (error: any) {
      console.error('Failed to merge tables:', error);
      if (error.code === 400) {
        showError(t('tables.merge.errors.mergeFailedNotCombinable'));
      } else {
        showError(error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTableToggle = (tableId: string) => {
    setSelectedTables(prev => {
      if (prev.includes(tableId)) {
        return prev.filter(id => id !== tableId);
      } else {
        return [...prev, tableId];
      }
    });
    
    // Clear error when user selects tables
    if (errors.tables) {
      setErrors(prev => ({ ...prev, tables: '' }));
    }
  };

  const getSelectedTableDetails = () => {
    return tables.filter(t => selectedTables.includes(t.table_id));
  };

  const getTotalCapacity = () => {
    return getSelectedTableDetails().reduce((sum, table) => sum + table.capacity, 0);
  };

  const getZoneName = (zoneId: string | null | undefined): string => {
    if (!zoneId) return t('tables.table.noZone');
    const zone = zones.find(z => z.zone_id === zoneId);
    return zone?.zone_name || t('tables.table.unknownZone');
  };

  // Filter tables based on search term
  const getFilteredTables = () => {
    if (!searchTerm.trim()) return tables;
    
    const lowerSearch = searchTerm.toLowerCase().trim();
    return tables.filter(table => {
      const tableNumber = table.table_number?.toLowerCase() || '';
      const zoneName = getZoneName(table.zone_id).toLowerCase();
      const capacity = table.capacity?.toString() || '';
      
      return tableNumber.includes(lowerSearch) ||
             zoneName.includes(lowerSearch) ||
             capacity.includes(lowerSearch);
    });
  };

  // Get tables grouped by zone for better organization
  const getTablesByZone = () => {
    const filteredTables = getFilteredTables();
    const grouped: Record<string, EnhancedTable[]> = {};
    
    // Add unzoned group
    grouped['__unzoned__'] = [];
    
    filteredTables.forEach(table => {
      if (!table.zone_id) {
        grouped['__unzoned__'].push(table);
      } else {
        if (!grouped[table.zone_id]) {
          grouped[table.zone_id] = [];
        }
        grouped[table.zone_id].push(table);
      }
    });

    return grouped;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cleaning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Loading 
        title={t('tables.merge.loading')}
        description={t('common.loadingDescription')}
        size="lg"
        fullScreen={true}
      />
    );
  }

  const selectedTableDetails = getSelectedTableDetails();
  const tablesByZone = getTablesByZone();

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <PageHeader
        title={t('tables.merge.title')}
        description={t('tables.merge.description')}
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
              onClick={handleMerge}
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
                  <span>{t('tables.merge.mergeButton')}</span>
                </>
              )}
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Instructions Alert */}
      <Alert variant="info">
        <div className="flex items-start space-x-3">
          <div>
            <p className="font-medium text-blue-900">{t('tables.merge.instructionsTitle')}</p>
            <p className="text-sm text-blue-700 mt-1">{t('tables.merge.instructionsText')}</p>
          </div>
        </div>
      </Alert>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Selection Widget - Takes 2 columns */}
        <Widget
          title={t('tables.merge.selectTables')}
          description={t('tables.merge.selectTablesDescription')}
          icon={TableCellsIcon}
          className="lg:col-span-2"
        >
          {tables.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TableCellsIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">{t('tables.merge.noTablesAvailable')}</p>
              <p className="text-sm mt-1">{t('tables.merge.noTablesAvailableDesc')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search Input */}
              <div className="relative">
                <InputTextField
                  label=""
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder={t('tables.merge.searchPlaceholder')}
                  prefixIcon={MagnifyingGlassIcon}
                  inputClassName="h-11"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Results count */}
              {searchTerm && (
                <p className="text-sm text-gray-500">
                  {t('tables.merge.searchResults', { 
                    count: getFilteredTables().length, 
                    total: tables.length 
                  })}
                </p>
              )}

              {/* No search results state */}
              {searchTerm && getFilteredTables().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">{t('tables.merge.noSearchResults')}</p>
                  <p className="text-sm mt-1">{t('tables.merge.tryDifferentSearch')}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="mt-4"
                  >
                    {t('common.clearSearch')}
                  </Button>
                </div>
              )}

              {/* Zone-grouped tables (only show when there are results) */}
              {(!searchTerm || getFilteredTables().length > 0) && Object.entries(tablesByZone).map(([zoneId, zoneTables]) => {
                if (zoneTables.length === 0) return null;
                
                const zoneName = zoneId === '__unzoned__' 
                  ? t('tables.table.noZone')
                  : getZoneName(zoneId);

                return (
                  <div key={zoneId}>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs mr-2">
                        {zoneName}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {zoneTables.length} {t('tables.merge.tablesInZone')}
                      </span>
                    </h4>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {zoneTables.map((table) => {
                        const isSelected = selectedTables.includes(table.table_id);
                        const isDisabled = table.status !== 'available' || !table.is_combinable;
                        
                        return (
                          <button
                            key={table.table_id}
                            onClick={() => !isDisabled && handleTableToggle(table.table_id)}
                            disabled={isDisabled}
                            className={`
                              relative p-4 rounded-lg border-2 transition-all duration-200 text-left
                              ${isSelected 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                                : isDisabled
                                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer'
                              }
                            `}
                          >
                            {/* Selection indicator */}
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                              </div>
                            )}

                            {/* Merged indicator */}
                            {table.is_combined && !isSelected && (
                              <div className="absolute top-2 right-2" title={t('tables.merge.alreadyMerged')}>
                                <LinkIcon className="h-4 w-4 text-purple-500" />
                              </div>
                            )}
                            
                            {/* Table number */}
                            <div className={`font-semibold text-lg ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                              {table.table_number}
                            </div>
                            
                            {/* Capacity */}
                            <div className="text-sm text-gray-500 mt-1">
                              {t('tables.table.capacity')}: {table.capacity}
                            </div>
                            
                            {/* Status badge */}
                            <div className={`
                              inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium border
                              ${getStatusColor(table.status)}
                            `}>
                              {t(`tables.status.${table.status}`)}
                            </div>
                            
                            {/* Merged badge */}
                            {table.is_combined && (
                              <div className="mt-2 text-xs text-purple-600 flex items-center bg-purple-50 px-2 py-0.5 rounded-full w-fit">
                                <LinkIcon className="h-3 w-3 mr-1" />
                                {t('tables.merge.merged')}
                              </div>
                            )}

                            {/* Not combinable warning */}
                            {!table.is_combinable && (
                              <div className="mt-2 text-xs text-amber-600 flex items-center">
                                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                {t('tables.merge.notCombinable')}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {errors.tables && (
            <p className="mt-4 text-sm text-red-600">{errors.tables}</p>
          )}
        </Widget>

        {/* Merge Summary Widget */}
        <Widget
          title={t('tables.merge.summary')}
          description={t('tables.merge.summaryDescription')}
          icon={ArrowsPointingOutIcon}
        >
          {selectedTables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ArrowsPointingInIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">{t('tables.merge.noTablesSelected')}</p>
              <p className="text-sm mt-1">{t('tables.merge.selectAtLeastTwo')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Tables List */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('tables.merge.selectedTables')} ({selectedTables.length})
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
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
                          <div className="font-medium text-gray-900">{table.table_number}</div>
                          <div className="text-sm text-gray-600">
                            {getZoneName(table.zone_id)} • {t('tables.table.capacity')}: {table.capacity}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTableToggle(table.table_id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Stats */}
              {selectedTables.length >= 2 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-3">{t('tables.merge.mergeSummary')}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">{t('tables.merge.tablesToMerge')}:</span>
                      <span className="font-medium text-green-900">{selectedTables.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">{t('tables.merge.totalCapacity')}:</span>
                      <span className="font-medium text-green-900">{getTotalCapacity()} {t('tables.merge.guests')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">{t('tables.merge.mergedTableName')}:</span>
                      <span className="font-medium text-green-900">
                        {selectedTableDetails.map(t => t.table_number).join('+')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Important Notes */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-2">{t('tables.merge.importantNotes')}</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• {t('tables.merge.note1')}</li>
                  <li>• {t('tables.merge.note2')}</li>
                  <li>• {t('tables.merge.note3')}</li>
                </ul>
              </div>
            </div>
          )}
        </Widget>
      </div>
    </div>
  );
};

export default TableMergeUnmergePage;