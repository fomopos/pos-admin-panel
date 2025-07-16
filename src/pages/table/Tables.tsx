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
  TrashIcon
} from '@heroicons/react/24/outline';
import { tableApiService } from '../../services/table';
import { PageHeader, Button, ConfirmDialog, DataTable } from '../../components/ui';
import type { EnhancedTable, EnhancedZone, EnhancedReservation, TableStatus } from '../../types/table';
import useTenantStore from '../../tenants/tenantStore';
import { useDeleteConfirmDialog } from '../../hooks/useConfirmDialog';

const Tables: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [tables, setTables] = useState<EnhancedTable[]>([]);
  const [zones, setZones] = useState<EnhancedZone[]>([]);
  const [reservations, setReservations] = useState<EnhancedReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tables');
  const { currentTenant, currentStore } = useTenantStore();

  // Dialog hooks
  const deleteDialog = useDeleteConfirmDialog();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const context = {
        tenant_id: currentTenant?.id || 'mock-tenant',
        store_id: currentStore?.store_id || 'mock-store',
      };

      console.log('Loading table data with context:', context);

      const [tablesData, zonesData, reservationsData] = await Promise.all([
        tableApiService.getTables(context),
        tableApiService.getZones(context),
        tableApiService.getReservations(context)
      ]);

      console.log('Loaded data:', { tablesData, zonesData, reservationsData });

      setTables(tablesData);
      setZones(zonesData);
      setReservations(reservationsData);
    } catch (error) {
      console.error('Failed to load table data:', error);
      // For development, provide fallback data
      if (process.env.NODE_ENV === 'development') {
        console.log('Using fallback mock data');
        setTables([]);
        setZones([]);
        setReservations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    const table = tables.find(t => t.table_id === tableId);
    if (!table) return;

    deleteDialog.openDeleteDialog(
      table.name,
      async () => {
        await tableApiService.deleteTable(tableId, {
          tenant_id: currentTenant?.id,
          store_id: currentStore?.store_id,
        });
        await loadAllData();
      }
    );
  };

  const handleDeleteZone = async (zoneId: string) => {
    const zone = zones.find(z => z.zone_id === zoneId);
    if (!zone) return;

    deleteDialog.openDeleteDialog(
      zone.name,
      async () => {
        await tableApiService.deleteZone(zoneId, {
          tenant_id: currentTenant?.id,
          store_id: currentStore?.store_id,
        });
        await loadAllData();
      }
    );
  };

  const handleTableStatusChange = async (tableId: string, status: TableStatus) => {
    try {
      await tableApiService.updateTableStatus(tableId, { status }, {
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      });
      await loadAllData();
    } catch (error) {
      console.error('Failed to update table status:', error);
    }
  };

  const getReservationStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      seated: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  // Table columns definition
  const tableColumns = [
    {
      key: 'name',
      title: t('tables.columns.tableName'),
      sortable: true,
      render: (value: string, table: EnhancedTable) => (
        <div className="flex items-center">
          <TableCellsIcon className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{table.table_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'zone_name',
      title: t('tables.columns.zone'),
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-900">{value || t('tables.noZone')}</span>
      ),
    },
    {
      key: 'capacity',
      title: t('tables.columns.capacity'),
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center">
          <UserGroupIcon className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: t('tables.columns.status'),
      sortable: true,
      render: (value: TableStatus, table: EnhancedTable) => (
        <select
          value={value}
          onChange={(e) => handleTableStatusChange(table.table_id, e.target.value as TableStatus)}
          className="text-xs rounded-full border-0 px-3 py-1 font-medium focus:ring-2 focus:ring-blue-500"
        >
          <option value="available">{t('tables.status.available')}</option>
          <option value="occupied">{t('tables.status.occupied')}</option>
          <option value="reserved">{t('tables.status.reserved')}</option>
          <option value="out_of_order">{t('tables.status.outOfOrder')}</option>
          <option value="cleaning">{t('tables.status.cleaning')}</option>
        </select>
      ),
    },
    {
      key: 'actions',
      title: t('common.actions'),
      render: (_value: any, table: EnhancedTable) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/tables/${table.table_id}`)}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/tables/edit/${table.table_id}`)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/tables/assign/${table.table_id}`)}
            title={t('tables.assignServer')}
          >
            <UserGroupIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteTable(table.table_id)}
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Zone columns definition
  const zoneColumns = [
    {
      key: 'name',
      title: t('tables.zones.columns.zoneName'),
      sortable: true,
      render: (value: string, zone: EnhancedZone) => (
        <div className="flex items-center">
          <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{zone.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'table_count',
      title: t('tables.zones.columns.tables'),
      sortable: true,
      render: (value: number, zone: EnhancedZone) => (
        <div className="text-sm text-gray-900">
          {t('tables.zones.tableCount', { 
            count: value, 
            available: zone.available_tables, 
            occupied: zone.occupied_tables 
          })}
        </div>
      ),
    },
    {
      key: 'color',
      title: t('tables.zones.columns.color'),
      render: (value: string) => (
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: value || '#gray' }}
          ></div>
          <span className="text-sm text-gray-900">{value || t('tables.zones.noColor')}</span>
        </div>
      ),
    },
    {
      key: 'active',
      title: t('common.status'),
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: t('common.actions'),
      render: (_value: any, zone: EnhancedZone) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/zones/edit/${zone.zone_id}`)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteZone(zone.zone_id)}
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Reservation columns definition
  const reservationColumns = [
    {
      key: 'customer_name',
      title: t('tables.reservations.columns.customer'),
      sortable: true,
      render: (value: string, reservation: EnhancedReservation) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{reservation.contact}</div>
        </div>
      ),
    },
    {
      key: 'table_name',
      title: t('tables.reservations.columns.table'),
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-900">{value}</span>
      ),
    },
    {
      key: 'reservation_time',
      title: t('tables.reservations.columns.dateTime'),
      sortable: true,
      render: (value: string) => {
        const date = new Date(value);
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
      render: (value: number) => (
        <div className="flex items-center">
          <UserGroupIcon className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: t('common.status'),
      sortable: true,
      render: (value: string) => getReservationStatusBadge(value),
    },
    {
      key: 'actions',
      title: t('common.actions'),
      render: (_value: any, reservation: EnhancedReservation) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/reservations/edit/${reservation.reservation_id}`)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('tables.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
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
            onClick={() => navigate('/tables/new')}
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <TableCellsIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('tables.stats.totalTables')}</p>
              <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('tables.stats.activeZones')}</p>
              <p className="text-2xl font-bold text-gray-900">{zones.filter(z => z.active).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('tables.stats.todayReservations')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {reservations.filter(r => r.is_today).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('tables.stats.availableTables')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {tables.filter(t => t.status === 'available').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('tables')}
            className={`${
              activeTab === 'tables'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <TableCellsIcon className="h-4 w-4" />
            <span>{t('tables.tabs.tables')}</span>
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`${
              activeTab === 'zones'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <BuildingOfficeIcon className="h-4 w-4" />
            <span>{t('tables.tabs.zones')}</span>
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`${
              activeTab === 'reservations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <CalendarDaysIcon className="h-4 w-4" />
            <span>{t('tables.tabs.reservations')}</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'tables' && (
        <DataTable
          data={tables}
          columns={tableColumns}
          searchable={true}
          searchPlaceholder={t('tables.searchPlaceholder')}
          searchFields={['name', 'table_id', 'zone_name']}
          pagination={true}
          pageSize={10}
          defaultSort={{ key: 'name', direction: 'asc' }}
          onRowClick={(table) => navigate(`/tables/${table.table_id}`)}
        />
      )}

      {activeTab === 'zones' && (
        <DataTable
          data={zones}
          columns={zoneColumns}
          searchable={true}
          searchPlaceholder={t('tables.zones.searchPlaceholder')}
          searchFields={['name', 'description']}
          pagination={true}
          pageSize={10}
          defaultSort={{ key: 'sort_order', direction: 'asc' }}
        />
      )}

      {activeTab === 'reservations' && (
        <DataTable
          data={reservations}
          columns={reservationColumns}
          searchable={true}
          searchPlaceholder={t('tables.reservations.searchPlaceholder')}
          searchFields={['customer_name', 'contact', 'table_name']}
          pagination={true}
          pageSize={10}
          defaultSort={{ key: 'reservation_time', direction: 'desc' }}
        />
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
      />
    </div>
  );
};

export default Tables;