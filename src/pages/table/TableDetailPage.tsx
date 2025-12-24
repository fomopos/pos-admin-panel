import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  TableCellsIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  UserIcon,
  ClockIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { tableApiService } from '../../services/table';
import { 
  PageHeader, 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent
} from '../../components/ui';
import type { 
  EnhancedTable, 
  ServerAssignment,
  EnhancedReservation
} from '../../types/table';
import useTenantStore from '../../tenants/tenantStore';

const TableDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { tableId } = useParams<{ tableId: string }>();

  const [loading, setLoading] = useState(false);
  const [table, setTable] = useState<EnhancedTable | null>(null);
  const [serverAssignment, setServerAssignment] = useState<ServerAssignment | null>(null);
  const [reservations, setReservations] = useState<EnhancedReservation[]>([]);
  const { currentTenant, currentStore } = useTenantStore();

  useEffect(() => {
    if (tableId) {
      loadTableDetails();
    }
  }, [tableId]);

  const loadTableDetails = async () => {
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

      // Load server assignment
      const assignment = await tableApiService.getTableServer(tableId, context);
      setServerAssignment(assignment);

      // Load reservations for this table
      const reservationsData = await tableApiService.getReservations(context, { table_id: tableId });
      setReservations(reservationsData);
    } catch (error) {
      console.error('Failed to load table details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'text-green-600 bg-green-100',
      occupied: 'text-red-600 bg-red-100',
      reserved: 'text-yellow-600 bg-yellow-100',
      out_of_order: 'text-gray-600 bg-gray-100',
      cleaning: 'text-blue-600 bg-blue-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getReservationStatusColor = (status: string) => {
    const colors = {
      confirmed: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      seated: 'text-blue-600 bg-blue-100',
      cancelled: 'text-red-600 bg-red-100',
      no_show: 'text-gray-600 bg-gray-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading table details...</p>
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

  const todayReservations = reservations.filter(r => r.is_today);
  const upcomingReservations = reservations.filter(r => r.is_upcoming && !r.is_today);

  return (
    <div className="p-6">
      {/* Header */}
      <PageHeader
        title={`Table ${table.table_number}`}
        description={`Details and management for table ${table.table_number} in ${table.zone_name || 'no zone'}`}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/tables')}
          >
            <XMarkIcon className="w-5 h-5 mr-2" />
            Back to Tables
          </Button>
          <Button
            onClick={() => navigate(`/tables/edit/${table.table_id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PencilIcon className="w-5 h-5 mr-2" />
            Edit Table
          </Button>
        </div>
      </PageHeader>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TableCellsIcon className="h-6 w-6 mr-2" />
                  Table Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Table Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Table ID:</span>
                        <div className="font-medium">{table.table_id}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Table Number:</span>
                        <div className="font-medium">{table.table_number}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Zone:</span>
                        <div className="font-medium">{table.zone_name || 'No zone assigned'}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Capacity:</span>
                        <div className="font-medium flex items-center">
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          {table.capacity} guests
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Status & Position</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Status:</span>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(table.status)}`}>
                          {table.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Combinable:</span>
                        <div className="font-medium">{table.is_combinable ? 'Yes' : 'No'}</div>
                      </div>
                      {(table.position_x !== undefined || table.position_y !== undefined) && (
                        <div>
                          <span className="text-sm text-gray-600">Position:</span>
                          <div className="font-medium">
                            X: {table.position_x || 0}, Y: {table.position_y || 0}
                          </div>
                        </div>
                      )}
                      {(table.width || table.height) && (
                        <div>
                          <span className="text-sm text-gray-600">Dimensions:</span>
                          <div className="font-medium">
                            {table.width || 100} × {table.height || 100}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Server Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserIcon className="h-6 w-6 mr-2" />
                    Server Assignment
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/tables/assign/${table.table_id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {serverAssignment ? 'Reassign' : 'Assign'} Server
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {serverAssignment ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-green-600 text-sm">Server Name:</span>
                        <div className="font-medium">{serverAssignment.server_name}</div>
                      </div>
                      <div>
                        <span className="text-green-600 text-sm">Assigned At:</span>
                        <div className="font-medium">
                          {new Date(serverAssignment.assigned_at).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-green-600 text-sm">Assigned By:</span>
                        <div className="font-medium">{serverAssignment.assigned_by}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No server assigned to this table</p>
                    <p className="text-sm">Click "Assign Server" to assign a server</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reservations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-6 w-6 mr-2" />
                    Reservations
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/reservations/new?table=${table.table_id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    New Reservation
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reservations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarDaysIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No reservations for this table</p>
                    <p className="text-sm">Click "New Reservation" to make a reservation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Today's Reservations */}
                    {todayReservations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Today's Reservations</h4>
                        <div className="space-y-2">
                          {todayReservations.map((reservation) => (
                            <div
                              key={reservation.reservation_id}
                              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <ClockIcon className="h-5 w-5 text-blue-600" />
                                <div>
                                  <div className="font-medium">{reservation.customer_name}</div>
                                  <div className="text-sm text-gray-600">
                                    {new Date(reservation.reservation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                                    {reservation.number_of_guests} guests
                                  </div>
                                </div>
                              </div>
                              <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getReservationStatusColor(reservation.status)}`}>
                                {reservation.status.replace('_', ' ').toUpperCase()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upcoming Reservations */}
                    {upcomingReservations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Upcoming Reservations</h4>
                        <div className="space-y-2">
                          {upcomingReservations.slice(0, 3).map((reservation) => (
                            <div
                              key={reservation.reservation_id}
                              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <CalendarDaysIcon className="h-5 w-5 text-gray-600" />
                                <div>
                                  <div className="font-medium">{reservation.customer_name}</div>
                                  <div className="text-sm text-gray-600">
                                    {new Date(reservation.reservation_time).toLocaleDateString()} • 
                                    {new Date(reservation.reservation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                              <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getReservationStatusColor(reservation.status)}`}>
                                {reservation.status.replace('_', ' ').toUpperCase()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => navigate(`/tables/edit/${table.table_id}`)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Table
                </Button>
                <Button
                  onClick={() => navigate(`/tables/assign/${table.table_id}`)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  {serverAssignment ? 'Reassign' : 'Assign'} Server
                </Button>
                <Button
                  onClick={() => navigate(`/reservations/new?table=${table.table_id}`)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <CalendarDaysIcon className="h-4 w-4 mr-2" />
                  New Reservation
                </Button>
                <Button
                  onClick={() => navigate('/tables/merge')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <TableCellsIcon className="h-4 w-4 mr-2" />
                  Merge Tables
                </Button>
              </CardContent>
            </Card>

            {/* Table Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Table Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{reservations.length}</div>
                  <div className="text-sm text-gray-600">Total Reservations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{todayReservations.length}</div>
                  <div className="text-sm text-gray-600">Today's Reservations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {reservations.filter(r => r.status === 'confirmed').length}
                  </div>
                  <div className="text-sm text-gray-600">Confirmed Reservations</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDetailPage;