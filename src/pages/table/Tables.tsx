import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  PlusIcon, 
  BuildingOfficeIcon,
  TableCellsIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { tableApiService } from '../../services/table';
import { 
  PageHeader, 
  Button, 
  ConfirmDialog, 
  DataTable, 
  AdvancedSearchFilter, 
  Loading, 
  PageContainer 
} from '../../components/ui';
import type { FilterConfig, ViewMode, Column } from '../../components/ui';
import type { EnhancedTable, EnhancedZone, EnhancedReservation, TableStatus, ReservationStatus } from '../../types/table';
import useTenantStore from '../../tenants/tenantStore';
import { useDeleteConfirmDialog } from '../../hooks/useConfirmDialog';
import { useError } from '../../hooks/useError';

const Tables: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentTenant, currentStore } = useTenantStore();
  const { showError, showSuccess } = useError();
  
  // Data state
  const [tables, setTables] = useState<EnhancedTable[]>([]);
  const [zones, setZones] = useState<EnhancedZone[]>([]);
  const [reservations, setReservations] = useState<EnhancedReservation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'tables' | 'zones' | 'reservations'>('tables');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Filter state - Tables
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedTableStatus, setSelectedTableStatus] = useState('');
  
  // Filter state - Zones
  const [zoneSearchTerm, setZoneSearchTerm] = useState('');
  const [selectedZoneStatus, setSelectedZoneStatus] = useState('');
  
  // Filter state - Reservations
  const [reservationSearchTerm, setReservationSearchTerm] = useState('');
  const [selectedReservationStatus, setSelectedReservationStatus] = useState('');

  // Dialog hooks
  const deleteDialog = useDeleteConfirmDialog();

  useEffect(() => {
    loadAllData();
  }, [currentTenant?.id, currentStore?.store_id]);

  const loadAllData = async () => {
    if (!currentTenant?.id || !currentStore?.store_id) {
      return;
    }

    try {
      setLoading(true);
      const context = {
        tenant_id: currentTenant.id,
        store_id: currentStore.store_id,
      };

      const [tablesData, zonesData, reservationsData, statusesData] = await Promise.all([
        tableApiService.getTables(context),
        tableApiService.getZones(context),
        tableApiService.getReservations(context),
        tableApiService.getTableStatuses(context)
      ]);

      // Create a map of table statuses by table ID for quick lookup
      const statusMap = new Map(statusesData.map(status => [status.tbl_id, status]));

      // Merge status data into tables
      const tablesWithStatus = tablesData.map(table => {
        const status = statusMap.get(table.table_id);
        if (status) {
          return {
            ...table,
            status: status.status,
            is_combined: status.is_combined,
            merged_tables: status.combined_with,
          };
        }
        return table;
      });

      setTables(tablesWithStatus);
      setZones(zonesData);
      setReservations(reservationsData);
    } catch (error) {
      console.error('Failed to load table data:', error);
      showError(t('tables.errors.loadFailed'));
      setTables([]);
      setZones([]);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    const table = tables.find(t => t.table_id === tableId);
    if (!table) return;

    deleteDialog.openDeleteDialog(
      table.table_number,
      async () => {
        try {
          await tableApiService.deleteTable(tableId, {
            tenant_id: currentTenant?.id,
            store_id: currentStore?.store_id,
          });
          showSuccess(t('tables.table.deleteSuccess', { name: table.table_number }));
          await loadAllData();
        } catch (error) {
          showError(t('tables.table.deleteError'));
        }
      }
    );
  };

  const handleDeleteZone = async (zoneId: string) => {
    const zone = zones.find(z => z.zone_id === zoneId);
    if (!zone) return;

    deleteDialog.openDeleteDialog(
      zone.zone_name,
      async () => {
        try {
          await tableApiService.deleteZone(zoneId, {
            tenant_id: currentTenant?.id,
            store_id: currentStore?.store_id,
          });
          showSuccess(t('tables.zones.deleteSuccess', { name: zone.zone_name }));
          await loadAllData();
        } catch (error: any) {
          // Handle 409 Conflict - zone has tables assigned
          if (error.code === 409 || error.code === 4007) {
            showError(t('tables.zones.deleteErrorHasTables'));
          } else {
            showError(t('tables.zones.deleteError'));
          }
        }
      }
    );
  };

  const handleTableStatusChange = async (tableId: string, status: TableStatus) => {
    try {
      await tableApiService.updateTableStatus(tableId, { status }, {
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      });
      showSuccess(t('tables.statusUpdateSuccess'));
      await loadAllData();
    } catch (error) {
      console.error('Failed to update table status:', error);
      showError(t('tables.statusUpdateError'));
    }
  };

  // === Filter Configurations ===
  const tableFilterConfigs: FilterConfig[] = [
    {
      key: 'zone',
      label: t('tables.filters.zone'),
      type: 'dropdown',
      options: [
        ...zones.map(zone => ({ id: zone.zone_id, label: zone.zone_name }))
      ],
      value: selectedZone
    },
    {
      key: 'status',
      label: t('tables.filters.status'),
      type: 'dropdown',
      options: [
        { id: 'available', label: t('tables.status.available') },
        { id: 'occupied', label: t('tables.status.occupied') },
        { id: 'reserved', label: t('tables.status.reserved') },
        { id: 'cleaning', label: t('tables.status.cleaning') },
        { id: 'blocked', label: t('tables.status.blocked') }
      ],
      value: selectedTableStatus
    }
  ];

  const zoneFilterConfigs: FilterConfig[] = [
    {
      key: 'status',
      label: t('common.status'),
      type: 'dropdown',
      options: [
        { id: 'active', label: t('common.active') },
        { id: 'inactive', label: t('common.inactive') }
      ],
      value: selectedZoneStatus
    }
  ];

  const reservationFilterConfigs: FilterConfig[] = [
    {
      key: 'status',
      label: t('common.status'),
      type: 'dropdown',
      options: [
        { id: 'confirmed', label: t('tables.reservations.status.confirmed') },
        { id: 'pending', label: t('tables.reservations.status.pending') },
        { id: 'seated', label: t('tables.reservations.status.seated') },
        { id: 'cancelled', label: t('tables.reservations.status.cancelled') },
        { id: 'no_show', label: t('tables.reservations.status.noShow') }
      ],
      value: selectedReservationStatus
    }
  ];

  // === Filter Change Handlers ===
  const handleTableFilterChange = (key: string, value: string | number | boolean) => {
    if (key === 'zone') setSelectedZone(value as string);
    else if (key === 'status') setSelectedTableStatus(value as string);
  };

  const handleZoneFilterChange = (key: string, value: string | number | boolean) => {
    if (key === 'status') setSelectedZoneStatus(value as string);
  };

  const handleReservationFilterChange = (key: string, value: string | number | boolean) => {
    if (key === 'status') setSelectedReservationStatus(value as string);
  };

  // === Active Filters ===
  const getTableActiveFilters = () => {
    const filters: Array<{ key: string; label: string; value: string; onRemove: () => void }> = [];
    
    if (tableSearchTerm) {
      filters.push({
        key: 'search',
        label: t('common.search'),
        value: tableSearchTerm,
        onRemove: () => setTableSearchTerm('')
      });
    }
    
    if (selectedZone) {
      const zoneName = zones.find(z => z.zone_id === selectedZone)?.zone_name || selectedZone;
      filters.push({
        key: 'zone',
        label: t('tables.filters.zone'),
        value: zoneName,
        onRemove: () => setSelectedZone('')
      });
    }
    
    if (selectedTableStatus) {
      filters.push({
        key: 'status',
        label: t('tables.filters.status'),
        value: t(`tables.status.${selectedTableStatus}`),
        onRemove: () => setSelectedTableStatus('')
      });
    }
    
    return filters;
  };

  const getZoneActiveFilters = () => {
    const filters: Array<{ key: string; label: string; value: string; onRemove: () => void }> = [];
    
    if (zoneSearchTerm) {
      filters.push({
        key: 'search',
        label: t('common.search'),
        value: zoneSearchTerm,
        onRemove: () => setZoneSearchTerm('')
      });
    }
    
    if (selectedZoneStatus) {
      filters.push({
        key: 'status',
        label: t('common.status'),
        value: selectedZoneStatus === 'active' ? t('common.active') : t('common.inactive'),
        onRemove: () => setSelectedZoneStatus('')
      });
    }
    
    return filters;
  };

  const getReservationActiveFilters = () => {
    const filters: Array<{ key: string; label: string; value: string; onRemove: () => void }> = [];
    
    if (reservationSearchTerm) {
      filters.push({
        key: 'search',
        label: t('common.search'),
        value: reservationSearchTerm,
        onRemove: () => setReservationSearchTerm('')
      });
    }
    
    if (selectedReservationStatus) {
      filters.push({
        key: 'status',
        label: t('common.status'),
        value: t(`tables.reservations.status.${selectedReservationStatus}`),
        onRemove: () => setSelectedReservationStatus('')
      });
    }
    
    return filters;
  };

  // === Filtered Data ===
  const filteredTables = tables.filter(table => {
    const matchesSearch = (table.table_number || '').toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
                         (table.table_id || '').toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
                         (table.zone_name && table.zone_name.toLowerCase().includes(tableSearchTerm.toLowerCase()));
    const matchesZone = !selectedZone || table.zone_id === selectedZone;
    const matchesStatus = !selectedTableStatus || table.status === selectedTableStatus;
    return matchesSearch && matchesZone && matchesStatus;
  });

  const filteredZones = zones.filter(zone => {
    const matchesSearch = (zone.zone_name || '').toLowerCase().includes(zoneSearchTerm.toLowerCase()) ||
                         (zone.description && zone.description.toLowerCase().includes(zoneSearchTerm.toLowerCase()));
    const matchesStatus = !selectedZoneStatus || zone.status === selectedZoneStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = (reservation.customer_name || '').toLowerCase().includes(reservationSearchTerm.toLowerCase()) ||
                         (reservation.contact || '').toLowerCase().includes(reservationSearchTerm.toLowerCase()) ||
                         (reservation.table_name && reservation.table_name.toLowerCase().includes(reservationSearchTerm.toLowerCase()));
    const matchesStatus = !selectedReservationStatus || reservation.status === selectedReservationStatus;
    return matchesSearch && matchesStatus;
  });

  // === Clear Filters ===
  const handleClearTableFilters = () => {
    setTableSearchTerm('');
    setSelectedZone('');
    setSelectedTableStatus('');
  };

  const handleClearZoneFilters = () => {
    setZoneSearchTerm('');
    setSelectedZoneStatus('');
  };

  const handleClearReservationFilters = () => {
    setReservationSearchTerm('');
    setSelectedReservationStatus('');
  };

  // === Status Badges ===
  const getTableStatusBadge = (status: TableStatus) => {
    const statusStyles: Record<TableStatus, string> = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      reserved: 'bg-blue-100 text-blue-800',
      cleaning: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {t(`tables.status.${status}`)}
      </span>
    );
  };

  const getReservationStatusBadge = (status: ReservationStatus) => {
    const statusStyles: Record<ReservationStatus, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      seated: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {t(`tables.reservations.status.${status}`)}
      </span>
    );
  };

  // Table columns definition
  const tableColumns: Column<EnhancedTable>[] = [
    {
      key: 'name',
      title: t('tables.columns.tableName'),
      sortable: true,
      render: (_, table) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
            <TableCellsIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{table.table_number}</div>
            <div className="text-sm text-gray-500">{table.table_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'zone_name',
      title: t('tables.columns.zone'),
      sortable: true,
      render: (_, table) => (
        <span className="text-sm text-gray-900">{table.zone_name || t('tables.noZone')}</span>
      ),
    },
    {
      key: 'capacity',
      title: t('tables.columns.capacity'),
      sortable: true,
      render: (_, table) => (
        <div className="flex items-center">
          <UserGroupIcon className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-900">{table.capacity}</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: t('tables.columns.status'),
      sortable: true,
      render: (_, table) => (
        <div className="flex flex-col gap-1">
          {getTableStatusBadge(table.status)}
          {table.is_combined && (
            <div className="flex items-center text-xs text-purple-600">
              <LinkIcon className="h-3 w-3 mr-1" />
              <span>{t('tables.merge.merged')}</span>
              {table.merged_tables && table.merged_tables.length > 0 && (
                <span className="ml-1 text-gray-500">
                  ({table.merged_tables.length})
                </span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'table_id',
      title: t('common.actions'),
      sortable: false,
      render: (_, table) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/tables/${table.table_id}`); }}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title={t('common.view')}
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/tables/edit/${table.table_id}`); }}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title={t('common.edit')}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/tables/assign/${table.table_id}`); }}
            className="text-purple-600 hover:text-purple-900 transition-colors"
            title={t('tables.assignServer')}
          >
            <UserGroupIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteTable(table.table_id); }}
            className="text-red-600 hover:text-red-900 transition-colors"
            title={t('common.delete')}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'text-right'
    },
  ];

  // Zone columns definition
  const zoneColumns: Column<EnhancedZone>[] = [
    {
      key: 'zone_name',
      title: t('tables.zones.columns.zoneName'),
      sortable: true,
      render: (_, zone) => (
        <div className="flex items-center">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
            style={{ backgroundColor: zone.color || '#6B7280' }}
          >
            <BuildingOfficeIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{zone.zone_name}</div>
            {zone.description && (
              <div className="text-sm text-gray-500 line-clamp-1">{zone.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'table_count',
      title: t('tables.zones.columns.tables'),
      sortable: true,
      render: (_, zone) => (
        <div className="text-sm text-gray-900">
          {zone.table_count || 0} {t('tables.tabs.tables').toLowerCase()}
        </div>
      ),
    },
    {
      key: 'capacity',
      title: t('tables.zones.columns.capacity'),
      sortable: true,
      render: (_, zone) => (
        <span className="text-sm text-gray-900">{zone.capacity || '-'}</span>
      ),
    },
    {
      key: 'display_order',
      title: t('tables.zones.columns.displayOrder'),
      sortable: true,
      render: (_, zone) => (
        <span className="text-sm text-gray-500">{zone.display_order}</span>
      ),
    },
    {
      key: 'status',
      title: t('common.status'),
      sortable: true,
      render: (_, zone) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          zone.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {zone.status === 'active' ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
    {
      key: 'zone_id',
      title: t('common.actions'),
      sortable: false,
      render: (_, zone) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/zones/edit/${zone.zone_id}`); }}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title={t('common.edit')}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteZone(zone.zone_id); }}
            className="text-red-600 hover:text-red-900 transition-colors"
            title={t('common.delete')}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'text-right'
    },
  ];

  // Reservation columns definition
  const reservationColumns: Column<EnhancedReservation>[] = [
    {
      key: 'customer_name',
      title: t('tables.reservations.columns.customer'),
      sortable: true,
      render: (_, reservation) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{reservation.customer_name}</div>
          <div className="text-sm text-gray-500">{reservation.contact}</div>
        </div>
      ),
    },
    {
      key: 'table_name',
      title: t('tables.reservations.columns.table'),
      sortable: true,
      render: (_, reservation) => (
        <span className="text-sm text-gray-900">{reservation.table_name}</span>
      ),
    },
    {
      key: 'reservation_time',
      title: t('tables.reservations.columns.dateTime'),
      sortable: true,
      render: (_, reservation) => {
        const date = new Date(reservation.reservation_time);
        return (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {date.toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-500">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        );
      },
    },
    {
      key: 'number_of_guests',
      title: t('tables.reservations.columns.guests'),
      sortable: true,
      render: (_, reservation) => (
        <div className="flex items-center">
          <UserGroupIcon className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-900">{reservation.number_of_guests}</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: t('common.status'),
      sortable: true,
      render: (_, reservation) => getReservationStatusBadge(reservation.status),
    },
    {
      key: 'reservation_id',
      title: t('common.actions'),
      sortable: false,
      render: (_, reservation) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/reservations/edit/${reservation.reservation_id}`); }}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title={t('common.edit')}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'text-right'
    },
  ];

  // === Card Components ===
  const TableCard: React.FC<{ table: EnhancedTable }> = ({ table }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              table.is_combined ? 'bg-purple-100' : 'bg-blue-100'
            }`}>
              {table.is_combined ? (
                <LinkIcon className="w-5 h-5 text-purple-600" />
              ) : (
                <TableCellsIcon className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{table.table_number}</h3>
              {table.zone_name && (
                <p className="text-sm text-gray-500">{table.zone_name}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/tables/${table.table_id}`)}
              className="text-gray-400 hover:text-gray-600"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/tables/edit/${table.table_id}`)}
              className="text-blue-600 hover:text-blue-800"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteTable(table.table_id)}
              className="text-red-600 hover:text-red-800"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <UserGroupIcon className="w-4 h-4 mr-1" />
          <span>{t('tables.columns.capacity')}: {table.capacity}</span>
        </div>

        {/* Merged Tables Info */}
        {table.is_combined && table.merged_tables && table.merged_tables.length > 0 && (
          <div className="mb-3 p-2 bg-purple-50 rounded-lg">
            <div className="flex items-center text-xs text-purple-700">
              <LinkIcon className="w-3 h-3 mr-1" />
              <span className="font-medium">{t('tables.merge.merged')}</span>
            </div>
            <p className="text-xs text-purple-600 mt-1">
              {t('tables.merge.mergedWith')}: {table.merged_tables.map(id => {
                const mergedTable = tables.find(t => t.table_id === id);
                return mergedTable?.table_number || id;
              }).join(', ')}
            </p>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <select
            value={table.status}
            onChange={(e) => handleTableStatusChange(table.table_id, e.target.value as TableStatus)}
            onClick={(e) => e.stopPropagation()}
            className="text-xs rounded-full border border-gray-200 px-3 py-1 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="available">{t('tables.status.available')}</option>
            <option value="occupied">{t('tables.status.occupied')}</option>
            <option value="reserved">{t('tables.status.reserved')}</option>
            <option value="cleaning">{t('tables.status.cleaning')}</option>
            <option value="blocked">{t('tables.status.blocked')}</option>
          </select>
          <span className={`px-2 py-1 text-xs rounded-full ${
            table.is_combinable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {table.is_combinable ? t('tables.table.combinable') : t('tables.table.nonCombinable')}
          </span>
        </div>
      </div>
    </div>
  );

  const ZoneCard: React.FC<{ zone: EnhancedZone }> = ({ zone }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: zone.color || '#6B7280' }}
            >
              <BuildingOfficeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{zone.zone_name}</h3>
              {zone.description && (
                <p className="text-sm text-gray-500 line-clamp-1">{zone.description}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/zones/edit/${zone.zone_id}`)}
              className="text-blue-600 hover:text-blue-800"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteZone(zone.zone_id)}
              className="text-red-600 hover:text-red-800"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
          <div>
            <span className="text-gray-500">{t('tables.zones.columns.tables')}:</span>
            <span className="ml-1 font-medium">{zone.table_count || 0}</span>
          </div>
          {zone.capacity && (
            <div>
              <span className="text-gray-500">{t('tables.zones.columns.capacity')}:</span>
              <span className="ml-1 font-medium">{zone.capacity}</span>
            </div>
          )}
          {zone.available_tables !== undefined && (
            <div className="text-green-600">
              <span>{zone.available_tables} {t('tables.status.available').toLowerCase()}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div 
            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: zone.color || '#6B7280' }}
            title={`Color: ${zone.color || '#6B7280'}`}
          />
          <span className={`px-2 py-1 text-xs rounded-full ${
            zone.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {zone.status === 'active' ? t('common.active') : t('common.inactive')}
          </span>
        </div>
      </div>
    </div>
  );

  const ReservationCard: React.FC<{ reservation: EnhancedReservation }> = ({ reservation }) => {
    const date = new Date(reservation.reservation_time);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{reservation.customer_name}</h3>
                <p className="text-sm text-gray-500">{reservation.contact}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/reservations/edit/${reservation.reservation_id}`)}
                className="text-blue-600 hover:text-blue-800"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <TableCellsIcon className="w-4 h-4 mr-2" />
              <span>{reservation.table_name}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CalendarDaysIcon className="w-4 h-4 mr-2" />
              <span>{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <UserGroupIcon className="w-4 h-4 mr-2" />
              <span>{reservation.number_of_guests} {t('tables.reservations.columns.guests').toLowerCase()}</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            {getReservationStatusBadge(reservation.status)}
          </div>
        </div>
      </div>
    );
  };

  // === Loading State ===
  if (loading) {
    return (
      <PageContainer variant="default" spacing="md">
        <Loading
          title={t('tables.loading')}
          description={t('tables.loadingDescription')}
          fullScreen={false}
          size="lg"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="default" spacing="md">
      {/* Header */}
      <PageHeader
        title={t('tables.title')}
        description={t('tables.description')}
      >
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/zones/new')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <BuildingOfficeIcon className="w-5 h-5" />
            <span>{t('tables.addZone')}</span>
          </Button>
          <Button
            onClick={() => navigate('/tables/merge')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>{t('tables.mergeTables')}</span>
          </Button>
          <Button
            onClick={() => navigate('/tables/edit/new')}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusIcon className="w-5 h-5" />
            <span>{t('tables.addTable')}</span>
          </Button>
          <Button
            onClick={() => navigate('/reservations/new')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <CalendarDaysIcon className="w-5 h-5" />
            <span>{t('tables.newReservation')}</span>
          </Button>
        </div>
      </PageHeader>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('tables')}
            className={`${
              activeTab === 'tables'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <TableCellsIcon className="h-4 w-4" />
            <span>{t('tables.tabs.tables')}</span>
            <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {tables.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`${
              activeTab === 'zones'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <BuildingOfficeIcon className="h-4 w-4" />
            <span>{t('tables.tabs.zones')}</span>
            <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {zones.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`${
              activeTab === 'reservations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <CalendarDaysIcon className="h-4 w-4" />
            <span>{t('tables.tabs.reservations')}</span>
            <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {reservations.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'tables' && (
        <>
          <AdvancedSearchFilter
            searchValue={tableSearchTerm}
            onSearchChange={setTableSearchTerm}
            searchLabel={t('tables.search.label')}
            searchPlaceholder={t('tables.searchPlaceholder')}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            enabledViews={['grid', 'list']}
            filters={tableFilterConfigs}
            onFilterChange={handleTableFilterChange}
            activeFilters={getTableActiveFilters()}
            totalResults={tables.length}
            filteredResults={filteredTables.length}
            showResultsCount={true}
            onClearAll={handleClearTableFilters}
            className="mb-6"
          />

          {viewMode === 'grid' ? (
            filteredTables.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTables.map(table => (
                  <TableCard key={table.table_id} table={table} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {tableSearchTerm || selectedZone || selectedTableStatus ? t('tables.noResults') : t('tables.empty.title')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {tableSearchTerm || selectedZone || selectedTableStatus 
                    ? t('tables.adjustFilters') 
                    : t('tables.empty.description')}
                </p>
                {!tableSearchTerm && !selectedZone && !selectedTableStatus && (
                  <div className="mt-6">
                    <Button onClick={() => navigate('/tables/edit/new')}>
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                      {t('tables.addTable')}
                    </Button>
                  </div>
                )}
              </div>
            )
          ) : (
            <DataTable
              data={filteredTables}
              columns={tableColumns}
              loading={false}
              searchable={false}
              pagination={true}
              pageSize={25}
              pageSizeOptions={[10, 25, 50, 100]}
              onRowClick={(table) => navigate(`/tables/${table.table_id}`)}
              defaultSort={{ key: 'name', direction: 'asc' }}
              emptyState={
                <div className="text-slate-500">
                  <div className="text-lg font-medium mb-1">{t('tables.empty.title')}</div>
                  <div className="text-sm">{t('tables.empty.description')}</div>
                </div>
              }
            />
          )}
        </>
      )}

      {activeTab === 'zones' && (
        <>
          <AdvancedSearchFilter
            searchValue={zoneSearchTerm}
            onSearchChange={setZoneSearchTerm}
            searchLabel={t('tables.zones.search.label')}
            searchPlaceholder={t('tables.zones.searchPlaceholder')}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            enabledViews={['grid', 'list']}
            filters={zoneFilterConfigs}
            onFilterChange={handleZoneFilterChange}
            activeFilters={getZoneActiveFilters()}
            totalResults={zones.length}
            filteredResults={filteredZones.length}
            showResultsCount={true}
            onClearAll={handleClearZoneFilters}
            className="mb-6"
          />

          {viewMode === 'grid' ? (
            filteredZones.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredZones.map(zone => (
                  <ZoneCard key={zone.zone_id} zone={zone} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {zoneSearchTerm || selectedZoneStatus ? t('tables.zones.noResults') : t('tables.zones.empty.title')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {zoneSearchTerm || selectedZoneStatus 
                    ? t('tables.adjustFilters') 
                    : t('tables.zones.empty.description')}
                </p>
                {!zoneSearchTerm && !selectedZoneStatus && (
                  <div className="mt-6">
                    <Button onClick={() => navigate('/zones/new')}>
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                      {t('tables.addZone')}
                    </Button>
                  </div>
                )}
              </div>
            )
          ) : (
            <DataTable
              data={filteredZones}
              columns={zoneColumns}
              loading={false}
              searchable={false}
              pagination={true}
              pageSize={25}
              pageSizeOptions={[10, 25, 50, 100]}
              onRowClick={(zone) => navigate(`/zones/edit/${zone.zone_id}`)}
              defaultSort={{ key: 'display_order', direction: 'asc' }}
              emptyState={
                <div className="text-slate-500">
                  <div className="text-lg font-medium mb-1">{t('tables.zones.empty.title')}</div>
                  <div className="text-sm">{t('tables.zones.empty.description')}</div>
                </div>
              }
            />
          )}
        </>
      )}

      {activeTab === 'reservations' && (
        <>
          <AdvancedSearchFilter
            searchValue={reservationSearchTerm}
            onSearchChange={setReservationSearchTerm}
            searchLabel={t('tables.reservations.search.label')}
            searchPlaceholder={t('tables.reservations.searchPlaceholder')}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            enabledViews={['grid', 'list']}
            filters={reservationFilterConfigs}
            onFilterChange={handleReservationFilterChange}
            activeFilters={getReservationActiveFilters()}
            totalResults={reservations.length}
            filteredResults={filteredReservations.length}
            showResultsCount={true}
            onClearAll={handleClearReservationFilters}
            className="mb-6"
          />

          {viewMode === 'grid' ? (
            filteredReservations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReservations.map(reservation => (
                  <ReservationCard key={reservation.reservation_id} reservation={reservation} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {reservationSearchTerm || selectedReservationStatus ? t('tables.reservations.noResults') : t('tables.reservations.empty.title')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {reservationSearchTerm || selectedReservationStatus 
                    ? t('tables.adjustFilters') 
                    : t('tables.reservations.empty.description')}
                </p>
                {!reservationSearchTerm && !selectedReservationStatus && (
                  <div className="mt-6">
                    <Button onClick={() => navigate('/reservations/new')}>
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                      {t('tables.newReservation')}
                    </Button>
                  </div>
                )}
              </div>
            )
          ) : (
            <DataTable
              data={filteredReservations}
              columns={reservationColumns}
              loading={false}
              searchable={false}
              pagination={true}
              pageSize={25}
              pageSizeOptions={[10, 25, 50, 100]}
              onRowClick={(reservation) => navigate(`/reservations/edit/${reservation.reservation_id}`)}
              defaultSort={{ key: 'reservation_time', direction: 'desc' }}
              emptyState={
                <div className="text-slate-500">
                  <div className="text-lg font-medium mb-1">{t('tables.reservations.empty.title')}</div>
                  <div className="text-sm">{t('tables.reservations.empty.description')}</div>
                </div>
              }
            />
          )}
        </>
      )}

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
    </PageContainer>
  );
};

export default Tables;