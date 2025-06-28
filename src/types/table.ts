// Table Management Types
// Based on the API specification in the issue description

export type { DropdownSearchOption } from '../components/ui/DropdownSearch';

export interface Table {
  table_id: string;
  zone_id: string | null;
  name: string;
  capacity: number;
  status: TableStatus;
  active: boolean;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  created_at: string;
  updated_at: string;
  create_user_id: string;
  update_user_id: string | null;
}

export interface TableZone {
  zone_id: string;
  name: string;
  description?: string;
  color?: string;
  active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
  create_user_id: string;
  update_user_id: string | null;
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
  | 'out_of_order' 
  | 'cleaning';

export type ReservationStatus = 
  | 'confirmed' 
  | 'pending' 
  | 'seated' 
  | 'cancelled' 
  | 'no_show';

// Request/Response types for API integration
export interface CreateTableRequest {
  table_id?: string;
  zone_id?: string;
  name: string;
  capacity: number;
  status?: TableStatus;
  active?: boolean;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
}

export interface UpdateTableRequest {
  zone_id?: string;
  name?: string;
  capacity?: number;
  status?: TableStatus;
  active?: boolean;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
}

export interface CreateZoneRequest {
  zone_id?: string;
  name: string;
  description?: string;
  color?: string;
  active?: boolean;
  sort_order?: number;
}

export interface UpdateZoneRequest {
  name?: string;
  description?: string;
  color?: string;
  active?: boolean;
  sort_order?: number;
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

export interface TableMergeRequest {
  new_table_id: string;
  merged_table_ids: string[];
  name: string;
  capacity: number;
}

export interface TableUnmergeRequest {
  merged_table_id: string;
}

export interface UpdateTableStatusRequest {
  status: TableStatus;
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
  table_count: number;
  available_tables: number;
  occupied_tables: number;
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
  total_count: number;
}

export interface ZonesApiResponse {
  zones: TableZone[];
  total_count: number;
}

export interface ReservationsApiResponse {
  reservations: Reservation[];
  total_count: number;
}

// Query parameters for API calls
export interface TableQueryParams {
  zone_id?: string;
  status?: TableStatus;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface ReservationQueryParams {
  date?: string;
  status?: ReservationStatus;
  table_id?: string;
  page?: number;
  limit?: number;
}

export interface ZoneQueryParams {
  active?: boolean;
  page?: number;
  limit?: number;
}