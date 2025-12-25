// Table API service for backend integration
import { apiClient, ApiError } from '../api';
import type {
  Table,
  TableZone,
  Reservation,
  ServerAssignment,
  CreateTableRequest,
  UpdateTableRequest,
  CreateZoneRequest,
  UpdateZoneRequest,
  CreateReservationRequest,
  UpdateReservationRequest,
  ServerAssignmentRequest,
  TableMergeRequest,
  TableMergeResponse,
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
  EnhancedReservation,
  TableStatusEntity,
  TableStatusesApiResponse,
  TableStatusQueryParams,
  SeatTableRequest,
  SeatTableResponse,
  ClearTableRequest,
  ClearTableResponse
} from '../../types/table';

export interface ApiContext {
  tenant_id?: string;
  store_id?: string;
}

class TableApiService {
  private basePath = '/v0/store';

  private getPath(storeId: string, endpoint: string): string {
    return `${this.basePath}/${storeId}${endpoint}`;
  }

  // ===== TABLE OPERATIONS =====

  async getTables(context: ApiContext, params?: TableQueryParams): Promise<EnhancedTable[]> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, '/table');
      const response = await apiClient.get<TablesApiResponse>(path, params);
      
      // Enhance tables with additional information
      return this.enhanceTables(response.data.tables);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getTable(tableId: string, context: ApiContext): Promise<EnhancedTable> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, `/table/${tableId}`);
      const response = await apiClient.get<Table>(path);
      
      return this.enhanceTable(response.data);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async createTable(tableData: CreateTableRequest, context: ApiContext): Promise<Table> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, '/table');
      const response = await apiClient.post<Table>(path, tableData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async updateTable(tableId: string, tableData: UpdateTableRequest, context: ApiContext): Promise<Table> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, `/table/${tableId}`);
      const response = await apiClient.put<Table>(path, tableData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async deleteTable(tableId: string, context: ApiContext): Promise<void> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, `/table/${tableId}`);
      await apiClient.delete(path);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // ===== TABLE STATUS OPERATIONS =====

  /**
   * Get all table statuses
   * GET /v0/store/:storeId/table-status
   */
  async getTableStatuses(context: ApiContext, params?: TableStatusQueryParams): Promise<TableStatusEntity[]> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, '/table-status');
      const response = await apiClient.get<TableStatusesApiResponse>(path, params);
      
      return response.data.statuses;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get status for a specific table
   * GET /v0/store/:storeId/table/:tableId/status
   */
  async getTableStatus(tableId: string, context: ApiContext): Promise<TableStatusEntity> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, `/table/${tableId}/status`);
      const response = await apiClient.get<TableStatusEntity>(path);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Update table status
   * PATCH /v0/store/:storeId/table/:tableId/status
   */
  async updateTableStatus(tableId: string, statusData: UpdateTableStatusRequest, context: ApiContext): Promise<TableStatusEntity> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, `/table/${tableId}/status`);
      const response = await apiClient.patch<TableStatusEntity>(path, statusData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Seat a table (marks as occupied with party details)
   * POST /v0/store/:storeId/table/:tableId/seat
   */
  async seatTable(tableId: string, seatData: SeatTableRequest, context: ApiContext): Promise<SeatTableResponse> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, `/table/${tableId}/seat`);
      const response = await apiClient.post<SeatTableResponse>(path, seatData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Clear a table (marks as available, clears all occupancy details)
   * POST /v0/store/:storeId/table/:tableId/clear
   */
  async clearTable(tableId: string, clearData?: ClearTableRequest, context?: ApiContext): Promise<ClearTableResponse> {
    const ctx = context || {};
    const { tenant_id, store_id } = ctx;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, `/table/${tableId}/clear`);
      const response = await apiClient.post<ClearTableResponse>(path, clearData || {});
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // ===== ZONE OPERATIONS =====

  async getZones(context: ApiContext, params?: ZoneQueryParams): Promise<EnhancedZone[]> {
    const { store_id } = context;
    if (!store_id) {
      throw new ApiError('Store ID is required');
    }

    try {
      const path = this.getPath(store_id, '/zone');
      const response = await apiClient.get<ZonesApiResponse>(path, params);
      
      return this.enhanceZones(response.data.zones);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getZone(zoneId: string, context: ApiContext): Promise<EnhancedZone> {
    const { store_id } = context;
    if (!store_id) {
      throw new ApiError('Store ID is required');
    }

    try {
      const path = this.getPath(store_id, `/zone/${zoneId}`);
      const response = await apiClient.get<TableZone>(path);
      
      return this.enhanceZone(response.data);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async createZone(zoneData: CreateZoneRequest, context: ApiContext): Promise<TableZone> {
    const { store_id } = context;
    if (!store_id) {
      throw new ApiError('Store ID is required');
    }

    try {
      const path = this.getPath(store_id, '/zone');
      const response = await apiClient.post<TableZone>(path, zoneData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async updateZone(zoneId: string, zoneData: UpdateZoneRequest, context: ApiContext): Promise<TableZone> {
    const { store_id } = context;
    if (!store_id) {
      throw new ApiError('Store ID is required');
    }

    try {
      const path = this.getPath(store_id, `/zone/${zoneId}`);
      const response = await apiClient.put<TableZone>(path, zoneData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async deleteZone(zoneId: string, context: ApiContext): Promise<void> {
    const { store_id } = context;
    if (!store_id) {
      throw new ApiError('Store ID is required');
    }

    try {
      const path = this.getPath(store_id, `/zone/${zoneId}`);
      await apiClient.delete(path);
      // Note: Returns 409 Conflict if zone has tables assigned
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getTablesByZone(zoneId: string, context: ApiContext): Promise<EnhancedTable[]> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, `/zone/${zoneId}/table`);
      const response = await apiClient.get<TablesApiResponse>(path);
      
      return this.enhanceTables(response.data.tables);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // ===== RESERVATION OPERATIONS =====

  async getReservations(context: ApiContext, params?: ReservationQueryParams): Promise<EnhancedReservation[]> {
    // Default to current date if no date param provided
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const queryParams: ReservationQueryParams = {
      date: today,
      ...params, // Allow override if date is explicitly provided
    };

    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, '/reservations');
      const response = await apiClient.get<ReservationsApiResponse>(path, queryParams);
      
      return this.enhanceReservations(response.data.reservations);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async createReservation(reservationData: CreateReservationRequest, context: ApiContext): Promise<Reservation> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, '/reservations');
      const response = await apiClient.post<Reservation>(path, reservationData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async updateReservation(reservationId: string, reservationData: UpdateReservationRequest, context: ApiContext): Promise<Reservation> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, `/reservations/${reservationId}`);
      const response = await apiClient.put<Reservation>(path, reservationData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // ===== SERVER ASSIGNMENT OPERATIONS =====

  async assignServer(assignmentData: ServerAssignmentRequest, context: ApiContext): Promise<ServerAssignment> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, '/server/assign');
      const response = await apiClient.post<ServerAssignment>(path, assignmentData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getTableServer(tableId: string, context: ApiContext): Promise<ServerAssignment | null> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      const path = this.getPath(store_id, `/table/${tableId}/server`);
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

  async mergeTables(mergeData: TableMergeRequest, context: ApiContext): Promise<TableMergeResponse> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      // API endpoint: POST /v0/store/:storeId/tables/merge
      const path = this.getPath(store_id, '/tables/merge');
      const response = await apiClient.post<TableMergeResponse>(path, mergeData);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async unmergeTables(unmergeData: TableUnmergeRequest, context: ApiContext): Promise<TableMergeResponse> {
    const { tenant_id, store_id } = context;
    if (!tenant_id || !store_id) {
      throw new ApiError('Tenant ID and Store ID are required');
    }

    try {
      // API endpoint: POST /v0/store/:storeId/tables/unmerge
      const path = this.getPath(store_id, '/tables/unmerge');
      const response = await apiClient.post<TableMergeResponse>(path, unmergeData);
      
      return response.data;
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
      // table_count comes from API response
      // available_tables and occupied_tables can be computed if needed
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
}

export const tableApiService = new TableApiService();