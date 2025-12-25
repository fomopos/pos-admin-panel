// Table Management Types
// Based on the API specification in TABLE_API_DOCUMENTATION.md

export type { DropdownSearchOption } from '../components/ui/DropdownSearch';

// Table shape type from API
export type TableShape = 'round' | 'square' | 'rectangle' | 'oval';

export interface Table {
  tenant_id?: string;
  store_id?: string;
  table_id: string;
  table_number: string;           // API uses table_number (not name)
  description?: string;           // Optional description for the table
  zone_id: string | null;
  floor_plan_id?: string | null;
  capacity: number;
  min_capacity?: number;
  max_capacity?: number;
  status: TableStatus;
  shape?: TableShape;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  is_combinable?: boolean;
  is_combined?: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// Zone status type from API
export type ZoneStatus = 'active' | 'inactive';

export interface TableZone {
  tenant_id?: string;
  store_id?: string;
  zone_id: string;
  zone_name: string;              // API uses zone_name
  description?: string;
  display_order: number;          // API uses display_order (not sort_order)
  status: ZoneStatus;             // 'active' | 'inactive' string status
  color?: string;
  capacity?: number;              // Zone capacity from API
  properties?: Record<string, any> | null;  // Additional properties from API
  table_count?: number;           // Computed field from list response
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface Reservation {
  reservation_id: string;
  table_id: string;
  customer_name: string;
  contact: string;
  reservation_time: string;
  number_of_guests: number;
  notes?: string;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
  create_user_id: string;
  update_user_id: string | null;
}

export interface ServerAssignment {
  assignment_id: string;
  table_id: string;
  server_id: string;
  server_name: string;
  assigned_at: string;
  assigned_by: string;
}

export interface TableMerge {
  merged_table_id: string;
  new_table_id: string;
  merged_table_ids: string[];
  name: string;
  capacity: number;
  merged_at: string;
  merged_by: string;
}

export type TableStatus = 
  | 'available' 
  | 'occupied' 
  | 'reserved' 
  | 'cleaning'
  | 'blocked';

export type ReservationStatus = 
  | 'confirmed' 
  | 'pending' 
  | 'seated' 
  | 'cancelled' 
  | 'no_show';

// Reservation source from API
export type ReservationSource = 'walk-in' | 'phone' | 'online' | 'app';

// Table Status entity from API (separate from Table configuration)
export interface TableStatusEntity {
  tenant_id?: string;
  store_id?: string;
  tbl_id: string;
  status: TableStatus;
  is_combined: boolean;
  combined_with: string[];
  party_size?: number | null;
  seated_at?: string | null;
  server_id?: string | null;
  tran_id?: string | null;
  rsv?: ReservationInfo | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Reservation info embedded in table status
export interface ReservationInfo {
  rsv_id: string;
  cust_name: string;
  cust_phone?: string;
  cust_email?: string;
  party_size: number;
  rsv_time: string;
  rsv_date: string;
  duration?: number;
  notes?: string;
  source?: ReservationSource;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
}

// Request/Response types for API integration
export interface CreateTableRequest {
  table_id?: string;              // Optional, auto-generated if not provided
  table_number: string;           // Required - Display identifier
  description?: string;           // Optional description
  zone_id?: string | null;
  floor_plan_id?: string | null;
  capacity: number;               // Required
  min_capacity?: number;
  max_capacity?: number;
  shape?: TableShape;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  is_combinable?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateTableRequest {
  table_number?: string;
  description?: string;
  zone_id?: string | null;
  floor_plan_id?: string | null;
  capacity?: number;
  min_capacity?: number;
  max_capacity?: number;
  status?: TableStatus;
  shape?: TableShape;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  is_combinable?: boolean;
  metadata?: Record<string, any>;
}

export interface CreateZoneRequest {
  zone_id?: string;             // Optional, auto-generated if not provided
  zone_name: string;            // Required - Display name
  description?: string;
  display_order?: number;
  color?: string;
  capacity?: number;
}

export interface UpdateZoneRequest {
  zone_name?: string;
  description?: string;
  display_order?: number;
  status?: ZoneStatus;          // 'active' | 'inactive'
  color?: string;
  capacity?: number;
}

export interface CreateReservationRequest {
  reservation_id?: string;
  table_id: string;
  customer_name: string;
  contact: string;
  reservation_time: string;
  number_of_guests: number;
  notes?: string;
  status?: ReservationStatus;
}

export interface UpdateReservationRequest {
  table_id?: string;
  customer_name?: string;
  contact?: string;
  reservation_time?: string;
  number_of_guests?: number;
  notes?: string;
  status?: ReservationStatus;
}

export interface ServerAssignmentRequest {
  table_id: string;
  server_id: string;
  server_name: string;
}

// API-compliant merge request (POST /v0/store/:storeId/tables/merge)
export interface TableMergeRequest {
  tbl_ids: string[];              // Required, min: 2 table IDs
}

// API response from merge operation
export interface TableMergeResponse {
  tables: Array<{
    table_id: string;
    status: TableStatus;
    is_combined: boolean;
    combined_with: string[];
  }>;
  message: string;
}

// API-compliant unmerge request (POST /v0/store/:storeId/tables/unmerge)
export interface TableUnmergeRequest {
  tbl_ids: string[];              // Required, min: 1 table ID
}

export interface UpdateTableStatusRequest {
  status?: TableStatus;
  party_size?: number;
  server_id?: string;
  is_combined?: boolean;
  combined_with?: string[];
  seated_at?: string;
  tran_id?: string;
  notes?: string;
}

// Seat table request (POST /table/:tableId/seat)
export interface SeatTableRequest {
  party_size: number;             // Required, min: 1
  server_id?: string;
  tran_id?: string;
  notes?: string;
}

// Seat table response
export interface SeatTableResponse {
  tbl_id: string;
  status: TableStatus;
  party_size: number;
  seated_at: string;
  server_id?: string;
  tran_id?: string;
}

// Clear table request (POST /table/:tableId/clear)
export interface ClearTableRequest {
  reason?: string;
  cleared_by?: string;
}

// Clear table response
export interface ClearTableResponse {
  tbl_id: string;
  status: TableStatus;
  party_size: null;
  seated_at: null;
  server_id: null;
  tran_id: null;
  rsv: null;
}

// Table statuses API response
export interface TableStatusesApiResponse {
  statuses: TableStatusEntity[];
  size: number;
  next: string | null;
}

// Table status query params
export interface TableStatusQueryParams {
  status?: TableStatus;
  limit?: number;
  next?: string;
}

// Enhanced types with additional computed fields
export interface EnhancedTable extends Table {
  zone_name?: string;
  current_server?: ServerAssignment;
  active_reservation?: Reservation;
  is_merged?: boolean;
  merged_tables?: string[];
}

export interface EnhancedZone extends TableZone {
  // Additional computed fields for UI
  available_tables?: number;
  occupied_tables?: number;
}

export interface EnhancedReservation extends Reservation {
  table_name?: string;
  zone_name?: string;
  is_today?: boolean;
  is_upcoming?: boolean;
  time_until?: string;
}

// API Response types
export interface TablesApiResponse {
  tables: Table[];
  size: number;                   // Number of items returned
  next: string | null;            // Pagination token
}

export interface ZonesApiResponse {
  zones: TableZone[];
  size: number;
  next: string | null;          // Pagination token
}

export interface ReservationsApiResponse {
  reservations: Reservation[];
  total_count: number;
}

// Query parameters for API calls
export interface TableQueryParams {
  zone_id?: string;
  floor_plan_id?: string;
  status?: TableStatus;
  is_combinable?: boolean;
  limit?: number;
  next?: string;                // Pagination token
}

export interface ReservationQueryParams {
  date?: string;
  status?: ReservationStatus;
  table_id?: string;
  page?: number;
  limit?: number;
}

export interface ZoneQueryParams {
  limit?: number;               // Max results (default: 100)
  next?: string;                // Pagination token
}