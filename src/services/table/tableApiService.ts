// Table API service for backend integration
import { apiClient, ApiError, USE_MOCK_DATA } from '../api';
import type {
  Table,
  TableZone,
  Reservation,
  ServerAssignment,
  TableMerge,
  CreateTableRequest,
  UpdateTableRequest,
  CreateZoneRequest,
  UpdateZoneRequest,
  CreateReservationRequest,
  UpdateReservationRequest,
  ServerAssignmentRequest,
  TableMergeRequest,
  TableUnmergeRequest,
  UpdateTableStatusRequest,
  TablesApiResponse,
  ZonesApiResponse,
  ReservationsApiResponse,
  TableQueryParams,
  ReservationQueryParams,
  ZoneQueryParams,
  EnhancedTable,
  EnhancedZone,
  EnhancedReservation
} from '../../types/table';

export interface ApiContext {
  tenant_id?: string;
  store_id?: string;
}

class TableApiService {
  private basePath = '/v1/tenant';

  private getPath(tenantId: string, storeId: string, endpoint: string): string {
    return `${this.basePath}/${tenantId}/store/${storeId}${endpoint}`;
  }

  // ===== TABLE OPERATIONS =====

  async getTables(context: ApiContext, params?: TableQueryParams): Promise<EnhancedTable[]> {
    if (USE_MOCK_DATA) {
      return this.getMockTables(params);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, '/table');
      const response = await apiClient.get<TablesApiResponse>(path, { params });
      
      // Enhance tables with additional information
      return this.enhanceTables(response.data.tables);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getTable(tableId: string, context: ApiContext): Promise<EnhancedTable> {
    if (USE_MOCK_DATA) {
      const tables = await this.getMockTables();
      const table = tables.find(t => t.table_id === tableId);
      if (!table) {
        throw new ApiError('Table not found', 404);
      }
      return table;
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, `/table/${tableId}`);
      const response = await apiClient.get<Table>(path);
      
      return this.enhanceTable(response.data);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async createTable(tableData: CreateTableRequest, context: ApiContext): Promise<Table> {
    if (USE_MOCK_DATA) {
      return this.createMockTable(tableData);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, '/table');
      const response = await apiClient.post<Table>(path, tableData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async updateTable(tableId: string, tableData: UpdateTableRequest, context: ApiContext): Promise<Table> {
    if (USE_MOCK_DATA) {
      return this.updateMockTable(tableId, tableData);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, `/table/${tableId}`);
      const response = await apiClient.put<Table>(path, tableData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async deleteTable(tableId: string, context: ApiContext): Promise<void> {
    if (USE_MOCK_DATA) {
      return this.deleteMockTable(tableId);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, `/table/${tableId}`);
      await apiClient.delete(path);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async updateTableStatus(tableId: string, statusData: UpdateTableStatusRequest, context: ApiContext): Promise<Table> {
    if (USE_MOCK_DATA) {
      return this.updateMockTableStatus(tableId, statusData);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, `/table/${tableId}/status`);
      const response = await apiClient.patch<Table>(path, statusData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // ===== ZONE OPERATIONS =====

  async getZones(context: ApiContext, params?: ZoneQueryParams): Promise<EnhancedZone[]> {
    if (USE_MOCK_DATA) {
      return this.getMockZones(params);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, '/zone');
      const response = await apiClient.get<ZonesApiResponse>(path, { params });
      
      return this.enhanceZones(response.data.zones);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getZone(zoneId: string, context: ApiContext): Promise<EnhancedZone> {
    if (USE_MOCK_DATA) {
      const zones = await this.getMockZones();
      const zone = zones.find(z => z.zone_id === zoneId);
      if (!zone) {
        throw new ApiError('Zone not found', 404);
      }
      return zone;
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, `/zone/${zoneId}`);
      const response = await apiClient.get<TableZone>(path);
      
      return this.enhanceZone(response.data);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async createZone(zoneData: CreateZoneRequest, context: ApiContext): Promise<TableZone> {
    if (USE_MOCK_DATA) {
      return this.createMockZone(zoneData);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, '/zone');
      const response = await apiClient.post<TableZone>(path, zoneData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async updateZone(zoneId: string, zoneData: UpdateZoneRequest, context: ApiContext): Promise<TableZone> {
    if (USE_MOCK_DATA) {
      return this.updateMockZone(zoneId, zoneData);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, `/zone/${zoneId}`);
      const response = await apiClient.put<TableZone>(path, zoneData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async deleteZone(zoneId: string, context: ApiContext): Promise<void> {
    if (USE_MOCK_DATA) {
      return this.deleteMockZone(zoneId);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, `/zone/${zoneId}`);
      await apiClient.delete(path);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getTablesByZone(zoneId: string, context: ApiContext): Promise<EnhancedTable[]> {
    if (USE_MOCK_DATA) {
      const tables = await this.getMockTables();
      return tables.filter(t => t.zone_id === zoneId);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, `/zone/${zoneId}/table`);
      const response = await apiClient.get<TablesApiResponse>(path);
      
      return this.enhanceTables(response.data.tables);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // ===== RESERVATION OPERATIONS =====

  async getReservations(context: ApiContext, params?: ReservationQueryParams): Promise<EnhancedReservation[]> {
    if (USE_MOCK_DATA) {
      return this.getMockReservations(params);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, '/reservation');
      const response = await apiClient.get<ReservationsApiResponse>(path, { params });
      
      return this.enhanceReservations(response.data.reservations);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async createReservation(reservationData: CreateReservationRequest, context: ApiContext): Promise<Reservation> {
    if (USE_MOCK_DATA) {
      return this.createMockReservation(reservationData);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, '/reservation');
      const response = await apiClient.post<Reservation>(path, reservationData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async updateReservation(reservationId: string, reservationData: UpdateReservationRequest, context: ApiContext): Promise<Reservation> {
    if (USE_MOCK_DATA) {
      return this.updateMockReservation(reservationId, reservationData);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, `/reservation/${reservationId}`);
      const response = await apiClient.put<Reservation>(path, reservationData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // ===== SERVER ASSIGNMENT OPERATIONS =====

  async assignServer(assignmentData: ServerAssignmentRequest, context: ApiContext): Promise<ServerAssignment> {
    if (USE_MOCK_DATA) {
      return this.createMockServerAssignment(assignmentData);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, '/server/assign');
      const response = await apiClient.post<ServerAssignment>(path, assignmentData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getTableServer(tableId: string, context: ApiContext): Promise<ServerAssignment | null> {
    if (USE_MOCK_DATA) {
      return this.getMockTableServer(tableId);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, `/table/${tableId}/server`);
      const response = await apiClient.get<ServerAssignment>(path);
      
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.code === 404) {
        return null;
      }
      throw this.handleApiError(error);
    }
  }

  // ===== TABLE MERGE/UNMERGE OPERATIONS =====

  async mergeTables(mergeData: TableMergeRequest, context: ApiContext): Promise<TableMerge> {
    if (USE_MOCK_DATA) {
      return this.createMockTableMerge(mergeData);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, '/table/merge');
      const response = await apiClient.post<TableMerge>(path, mergeData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async unmergeTables(unmergeData: TableUnmergeRequest, context: ApiContext): Promise<void> {
    if (USE_MOCK_DATA) {
      return this.deleteMockTableMerge(unmergeData.merged_table_id);
    }

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(tenant_id, store_id, '/table/unmerge');
      await apiClient.post(path, unmergeData);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private enhanceTables(tables: Table[]): EnhancedTable[] {
    return tables.map(table => this.enhanceTable(table));
  }

  private enhanceTable(table: Table): EnhancedTable {
    return {
      ...table,
      zone_name: this.getZoneNameForTable(table.zone_id),
      // Additional enhancement logic would go here
    };
  }

  private enhanceZones(zones: TableZone[]): EnhancedZone[] {
    return zones.map(zone => this.enhanceZone(zone));
  }

  private enhanceZone(zone: TableZone): EnhancedZone {
    return {
      ...zone,
      table_count: 0, // Would be calculated from actual table data
      available_tables: 0,
      occupied_tables: 0,
    };
  }

  private enhanceReservations(reservations: Reservation[]): EnhancedReservation[] {
    return reservations.map(reservation => this.enhanceReservation(reservation));
  }

  private enhanceReservation(reservation: Reservation): EnhancedReservation {
    const reservationTime = new Date(reservation.reservation_time);
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      ...reservation,
      table_name: this.getTableNameForReservation(reservation.table_id),
      is_today: reservationTime >= today && reservationTime < new Date(today.getTime() + 24 * 60 * 60 * 1000),
      is_upcoming: reservationTime > now,
    };
  }

  private getZoneNameForTable(zoneId: string | null): string | undefined {
    // This would typically look up zone name from cached zone data
    return zoneId ? `Zone ${zoneId}` : undefined;
  }

  private getTableNameForReservation(tableId: string): string | undefined {
    // This would typically look up table name from cached table data
    return `Table ${tableId}`;
  }

  private handleApiError(error: any): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    
    if (error.response) {
      const { status, data } = error.response;
      return new ApiError(
        data.message || 'An error occurred',
        status,
        data.slug,
        data.details
      );
    }
    
    return new ApiError('Network error occurred');
  }

  // ===== MOCK DATA METHODS =====

  private async getMockTables(params?: TableQueryParams): Promise<EnhancedTable[]> {
    const mockTables: EnhancedTable[] = [
      {
        table_id: 'TBL001',
        zone_id: 'ZONE01',
        zone_name: 'Dining Room',
        name: 'T1',
        capacity: 4,
        status: 'available',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        create_user_id: 'user1',
        update_user_id: null,
      },
      {
        table_id: 'TBL002',
        zone_id: 'ZONE01',
        zone_name: 'Dining Room',
        name: 'T2',
        capacity: 6,
        status: 'occupied',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        create_user_id: 'user1',
        update_user_id: null,
      },
      {
        table_id: 'TBL003',
        zone_id: 'ZONE02',
        zone_name: 'Patio',
        name: 'P1',
        capacity: 2,
        status: 'reserved',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        create_user_id: 'user1',
        update_user_id: null,
      },
    ];

    let filtered = mockTables;

    if (params?.zone_id) {
      filtered = filtered.filter(t => t.zone_id === params.zone_id);
    }

    if (params?.status) {
      filtered = filtered.filter(t => t.status === params.status);
    }

    if (params?.active !== undefined) {
      filtered = filtered.filter(t => t.active === params.active);
    }

    return filtered;
  }

  private async getMockZones(params?: ZoneQueryParams): Promise<EnhancedZone[]> {
    const mockZones: EnhancedZone[] = [
      {
        zone_id: 'ZONE01',
        name: 'Dining Room',
        description: 'Main dining area',
        color: '#3B82F6',
        active: true,
        sort_order: 1,
        table_count: 8,
        available_tables: 4,
        occupied_tables: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        create_user_id: 'user1',
        update_user_id: null,
      },
      {
        zone_id: 'ZONE02',
        name: 'Patio',
        description: 'Outdoor seating area',
        color: '#10B981',
        active: true,
        sort_order: 2,
        table_count: 6,
        available_tables: 5,
        occupied_tables: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        create_user_id: 'user1',
        update_user_id: null,
      },
    ];

    let filtered = mockZones;

    if (params?.active !== undefined) {
      filtered = filtered.filter(z => z.active === params.active);
    }

    return filtered;
  }

  private async getMockReservations(params?: ReservationQueryParams): Promise<EnhancedReservation[]> {
    const now = new Date();
    const today = new Date();
    today.setHours(19, 0, 0, 0);

    const mockReservations: EnhancedReservation[] = [
      {
        reservation_id: 'RSV10001',
        table_id: 'TBL001',
        table_name: 'T1',
        customer_name: 'John Doe',
        contact: '+1234567890',
        reservation_time: today.toISOString(),
        number_of_guests: 4,
        notes: 'Birthday dinner',
        status: 'confirmed',
        is_today: true,
        is_upcoming: today > now,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        create_user_id: 'user1',
        update_user_id: null,
      },
    ];

    let filtered = mockReservations;

    if (params?.date) {
      const filterDate = new Date(params.date);
      filtered = filtered.filter(r => {
        const reservationDate = new Date(r.reservation_time);
        return reservationDate.toDateString() === filterDate.toDateString();
      });
    }

    if (params?.status) {
      filtered = filtered.filter(r => r.status === params.status);
    }

    if (params?.table_id) {
      filtered = filtered.filter(r => r.table_id === params.table_id);
    }

    return filtered;
  }

  private createMockTable(tableData: CreateTableRequest): Table {
    return {
      table_id: tableData.table_id || `TBL${Date.now()}`,
      zone_id: tableData.zone_id || null,
      name: tableData.name,
      capacity: tableData.capacity,
      status: tableData.status || 'available',
      active: tableData.active !== false,
      position_x: tableData.position_x,
      position_y: tableData.position_y,
      width: tableData.width,
      height: tableData.height,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      create_user_id: 'mock_user',
      update_user_id: null,
    };
  }

  private updateMockTable(tableId: string, tableData: UpdateTableRequest): Table {
    // In a real implementation, this would update the stored data
    return {
      table_id: tableId,
      zone_id: tableData.zone_id || null,
      name: tableData.name || `Table ${tableId}`,
      capacity: tableData.capacity || 4,
      status: tableData.status || 'available',
      active: tableData.active !== false,
      position_x: tableData.position_x,
      position_y: tableData.position_y,
      width: tableData.width,
      height: tableData.height,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      create_user_id: 'mock_user',
      update_user_id: 'mock_user',
    };
  }

  private deleteMockTable(tableId: string): void {
    // In a real implementation, this would remove the table from storage
    console.log(`Mock: Deleted table ${tableId}`);
  }

  private updateMockTableStatus(tableId: string, statusData: UpdateTableStatusRequest): Table {
    return {
      table_id: tableId,
      zone_id: null,
      name: `Table ${tableId}`,
      capacity: 4,
      status: statusData.status,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      create_user_id: 'mock_user',
      update_user_id: 'mock_user',
    };
  }

  private createMockZone(zoneData: CreateZoneRequest): TableZone {
    return {
      zone_id: zoneData.zone_id || `ZONE${Date.now()}`,
      name: zoneData.name,
      description: zoneData.description,
      color: zoneData.color,
      active: zoneData.active !== false,
      sort_order: zoneData.sort_order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      create_user_id: 'mock_user',
      update_user_id: null,
    };
  }

  private updateMockZone(zoneId: string, zoneData: UpdateZoneRequest): TableZone {
    return {
      zone_id: zoneId,
      name: zoneData.name || `Zone ${zoneId}`,
      description: zoneData.description,
      color: zoneData.color,
      active: zoneData.active !== false,
      sort_order: zoneData.sort_order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      create_user_id: 'mock_user',
      update_user_id: 'mock_user',
    };
  }

  private deleteMockZone(zoneId: string): void {
    console.log(`Mock: Deleted zone ${zoneId}`);
  }

  private createMockReservation(reservationData: CreateReservationRequest): Reservation {
    return {
      reservation_id: reservationData.reservation_id || `RSV${Date.now()}`,
      table_id: reservationData.table_id,
      customer_name: reservationData.customer_name,
      contact: reservationData.contact,
      reservation_time: reservationData.reservation_time,
      number_of_guests: reservationData.number_of_guests,
      notes: reservationData.notes,
      status: reservationData.status || 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      create_user_id: 'mock_user',
      update_user_id: null,
    };
  }

  private updateMockReservation(reservationId: string, reservationData: UpdateReservationRequest): Reservation {
    return {
      reservation_id: reservationId,
      table_id: reservationData.table_id || 'TBL001',
      customer_name: reservationData.customer_name || 'Customer',
      contact: reservationData.contact || '',
      reservation_time: reservationData.reservation_time || new Date().toISOString(),
      number_of_guests: reservationData.number_of_guests || 2,
      notes: reservationData.notes,
      status: reservationData.status || 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      create_user_id: 'mock_user',
      update_user_id: 'mock_user',
    };
  }

  private createMockServerAssignment(assignmentData: ServerAssignmentRequest): ServerAssignment {
    return {
      assignment_id: `ASG${Date.now()}`,
      table_id: assignmentData.table_id,
      server_id: assignmentData.server_id,
      server_name: assignmentData.server_name,
      assigned_at: new Date().toISOString(),
      assigned_by: 'mock_user',
    };
  }

  private getMockTableServer(tableId: string): ServerAssignment | null {
    if (tableId === 'TBL002') {
      return {
        assignment_id: 'ASG001',
        table_id: tableId,
        server_id: 'SERVER01',
        server_name: 'Alice Smith',
        assigned_at: new Date().toISOString(),
        assigned_by: 'mock_user',
      };
    }
    return null;
  }

  private createMockTableMerge(mergeData: TableMergeRequest): TableMerge {
    return {
      merged_table_id: `MERGE${Date.now()}`,
      new_table_id: mergeData.new_table_id,
      merged_table_ids: mergeData.merged_table_ids,
      name: mergeData.name,
      capacity: mergeData.capacity,
      merged_at: new Date().toISOString(),
      merged_by: 'mock_user',
    };
  }

  private deleteMockTableMerge(mergedTableId: string): void {
    console.log(`Mock: Unmerged table ${mergedTableId}`);
  }
}

export const tableApiService = new TableApiService();