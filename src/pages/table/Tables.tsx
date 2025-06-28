import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        tenant_id: currentTenant?.id,
        store_id: currentStore?.store_id,
      };

      const [tablesData, zonesData, reservationsData] = await Promise.all([
        tableApiService.getTables(context),
        tableApiService.getZones(context),
        tableApiService.getReservations(context)
      ]);

      setTables(tablesData);
      setZones(zonesData);
      setReservations(reservationsData);
    } catch (error) {
      console.error('Failed to load table data:', error);
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
      title: 'Table Name',
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
      title: 'Zone',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-900">{value || 'No Zone'}</span>
      ),
    },
    {
      key: 'capacity',
      title: 'Capacity',
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
      title: 'Status',
      sortable: true,
      render: (value: TableStatus, table: EnhancedTable) => (
        <select
          value={value}
          onChange={(e) => handleTableStatusChange(table.table_id, e.target.value as TableStatus)}
          className="text-xs rounded-full border-0 px-3 py-1 font-medium focus:ring-2 focus:ring-blue-500"
        >
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="reserved">Reserved</option>
          <option value="out_of_order">Out of Order</option>
          <option value="cleaning">Cleaning</option>
        </select>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
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
      title: 'Zone Name',
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
      title: 'Tables',
      sortable: true,
      render: (value: number, zone: EnhancedZone) => (
        <div className="text-sm text-gray-900">
          {value} tables ({zone.available_tables} available, {zone.occupied_tables} occupied)
        </div>
      ),
    },
    {
      key: 'color',
      title: 'Color',
      render: (value: string) => (
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: value || '#gray' }}
          ></div>
          <span className="text-sm text-gray-900">{value || 'No color'}</span>
        </div>
      ),
    },
    {
      key: 'active',
      title: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
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
      title: 'Customer',
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
      title: 'Table',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-900">{value}</span>
      ),
    },
    {
      key: 'reservation_time',
      title: 'Date & Time',
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
      title: 'Guests',
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
      title: 'Status',
      sortable: true,
      render: (value: string) => getReservationStatusBadge(value),
    },
    {
      key: 'actions',
      title: 'Actions',
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
          <p className="mt-4 text-gray-600">Loading table management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <PageHeader
        title="Table Management"
        description="Manage tables, zones, and reservations for your restaurant"
      >
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/zones/new')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <BuildingOfficeIcon className="w-5 h-5" />
            <span>Add Zone</span>
          </Button>
          <Button
            onClick={() => navigate('/tables/new')}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Table</span>
          </Button>
          <Button
            onClick={() => navigate('/reservations/new')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <CalendarDaysIcon className="w-5 h-5" />
            <span>New Reservation</span>
          </Button>
        </div>
      </PageHeader>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <TableCellsIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tables</p>
              <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Zones</p>
              <p className="text-2xl font-bold text-gray-900">{zones.filter(z => z.active).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Reservations</p>
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
              <p className="text-sm font-medium text-gray-600">Available Tables</p>
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
            <span>Tables</span>
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
            <span>Zones</span>
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
            <span>Reservations</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'tables' && (
        <DataTable
          data={tables}
          columns={tableColumns}
          searchable={true}
          searchPlaceholder="Search tables..."
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
          searchPlaceholder="Search zones..."
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
          searchPlaceholder="Search reservations..."
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