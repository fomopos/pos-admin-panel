# Table Management API Documentation

This document provides comprehensive API documentation for the Table Management Service, enabling frontend development for restaurant/store table management features.

## Base URL
```
/v0/store/:storeId
```

## Authentication
All endpoints require authentication. Include the authorization token in the request header.

---

## Table of Contents
1. [Zone APIs](#1-zone-apis)
2. [Table Configuration APIs](#2-table-configuration-apis)
3. [Table Status APIs](#3-table-status-apis)
4. [Reservation APIs](#4-reservation-apis)
5. [Floor Plan APIs](#5-floor-plan-apis)
6. [Enums & Constants](#6-enums--constants)
7. [Error Codes](#7-error-codes)

---

## 1. Zone APIs

Zones are logical groupings of tables (e.g., "Patio", "Main Hall", "VIP Section").

### 1.1 Create Zone
**POST** `/v0/store/:storeId/zone`

**Request Body:**
```json
{
  "zone_id": "zone-001",          // Optional, auto-generated if not provided
  "zone_name": "Patio",           // Required
  "description": "Outdoor seating area",
  "display_order": 1,
  "color": "#4CAF50",
  "capacity": 50
}
```

**Response:** `201 Created`
```json
{
  "tenant_id": "tenant-123",
  "store_id": "store-456",
  "zone_id": "zone-001",
  "zone_name": "Patio",
  "description": "Outdoor seating area",
  "display_order": 1,
  "status": "active",
  "color": "#4CAF50",
  "capacity": 50,
  "created_at": "2024-12-24T10:00:00Z",
  "updated_at": "2024-12-24T10:00:00Z"
}
```

---

### 1.2 Get All Zones
**GET** `/v0/store/:storeId/zone`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | int | Max results (default: 100) |
| `next` | string | Pagination token |

**Response:** `200 OK`
```json
{
  "zones": [
    {
      "zone_id": "zone-001",
      "zone_name": "Patio",
      "description": "Outdoor seating area",
      "display_order": 1,
      "status": "active",
      "color": "#4CAF50",
      "capacity": 50,
      "properties": null,
      "created_at": "2024-12-24T10:00:00Z",
      "created_by": "user-123",
      "updated_at": "2024-12-24T10:00:00Z",
      "updated_by": "user-123"
    }
  ],
  "size": 1,
  "next": null
}
```

**Note:** Get All Zones now returns the full Zone entity (same as Get Zone by ID), including audit fields.

---

### 1.3 Get Zone by ID
**GET** `/v0/store/:storeId/zone/:zoneId`

**Response:** `200 OK`
```json
{
  "tenant_id": "tenant-123",
  "store_id": "store-456",
  "zone_id": "zone-001",
  "zone_name": "Patio",
  "description": "Outdoor seating area",
  "display_order": 1,
  "status": "active",
  "color": "#4CAF50",
  "capacity": 50,
  "created_at": "2024-12-24T10:00:00Z",
  "updated_at": "2024-12-24T10:00:00Z"
}
```

---

### 1.4 Update Zone
**PUT** `/v0/store/:storeId/zone/:zoneId`

**Request Body:**
```json
{
  "zone_name": "Patio Updated",
  "description": "Updated outdoor seating",
  "display_order": 2,
  "status": "active",              // "active" | "inactive"
  "color": "#2196F3",
  "capacity": 60
}
```

**Response:** `200 OK` (returns updated zone)

---

### 1.5 Delete Zone
**DELETE** `/v0/store/:storeId/zone/:zoneId`

**Response:** `204 No Content`

**Note:** Cannot delete a zone that has tables assigned to it (returns `409 Conflict`).

---

## 2. Table Configuration APIs

Tables represent individual dining/seating positions. Configuration is stored separately from runtime status.

### 2.1 Create Table
**POST** `/v0/store/:storeId/table`

**Request Body:**
```json
{
  "table_id": "table-001",         // Optional, auto-generated if not provided
  "table_number": "T1",            // Required - Display number
  "description": "Window seat",    // Optional - Table description
  "zone_id": "zone-001",
  "floor_plan_id": "floor-001",
  "capacity": 4,                   // Required, min: 1
  "min_capacity": 2,
  "max_capacity": 6,
  "shape": "round",                // "round" | "square" | "rectangle" | "oval"
  "position_x": 100.5,             // X coordinate on floor plan
  "position_y": 200.0,             // Y coordinate on floor plan
  "width": 80.0,
  "height": 80.0,
  "rotation": 0,                   // Rotation in degrees
  "is_combinable": true,
  "metadata": {
    "custom_field": "value"
  }
}
```

**Response:** `201 Created`
```json
{
  "tenant_id": "tenant-123",
  "store_id": "store-456",
  "table_id": "table-001",
  "table_number": "T1",
  "description": "Window seat",
  "zone_id": "zone-001",
  "floor_plan_id": "floor-001",
  "capacity": 4,
  "min_capacity": 2,
  "max_capacity": 6,
  "status": "available",
  "shape": "round",
  "position_x": 100.5,
  "position_y": 200.0,
  "width": 80.0,
  "height": 80.0,
  "rotation": 0,
  "is_combinable": true,
  "is_combined": false,
  "metadata": {
    "custom_field": "value"
  },
  "created_at": "2024-12-24T10:00:00Z",
  "updated_at": "2024-12-24T10:00:00Z"
}
```

---

### 2.2 Get All Tables
**GET** `/v0/store/:storeId/table`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `zone_id` | string | Filter by zone |
| `limit` | int | Max results (default: 100) |
| `next` | string | Pagination token |

**Response:** `200 OK`
```json
{
  "tables": [
    {
      "tenant_id": "tenant-123",
      "store_id": "store-456",
      "table_id": "table-001",
      "table_number": "T1",
      "zone_id": "zone-001",
      "floor_plan_id": "floor-001",
      "capacity": 4,
      "status": "available",
      "shape": "round",
      "position_x": 100.5,
      "position_y": 200.0,
      "is_combinable": true,
      "is_combined": false
    }
  ],
  "size": 1,
  "next": null
}
```

---

### 2.3 Get Table by ID
**GET** `/v0/store/:storeId/table/:tableId`

**Response:** `200 OK` (returns full table object)

---

### 2.4 Update Table
**PUT** `/v0/store/:storeId/table/:tableId`

**Request Body:**
```json
{
  "table_number": "T1-Updated",
  "zone_id": "zone-002",
  "floor_plan_id": "floor-001",
  "capacity": 6,
  "min_capacity": 2,
  "max_capacity": 8,
  "shape": "rectangle",
  "position_x": 150.0,
  "position_y": 250.0,
  "width": 120.0,
  "height": 80.0,
  "rotation": 45,
  "is_combinable": true,
  "metadata": {
    "updated_field": "new_value"
  }
}
```

**Response:** `200 OK` (returns updated table)

---

### 2.5 Delete Table
**DELETE** `/v0/store/:storeId/table/:tableId`

**Response:** `204 No Content`

---

## 3. Table Status APIs

Table status is stored in a separate table for high-frequency updates (occupancy, reservations, merge status).

### 3.1 Get All Table Statuses
**GET** `/v0/store/:storeId/table-status`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (available, occupied, reserved, cleaning, blocked) |
| `limit` | int | Max results (default: 100) |
| `next` | string | Pagination token |

**Response:** `200 OK`
```json
{
  "statuses": [
    {
      "tenant_id": "tenant-123",
      "store_id": "store-456",
      "tbl_id": "table-001",
      "status": "occupied",
      "is_combined": false,
      "combined_with": [],
      "party_size": 3,
      "seated_at": "2024-12-24T12:30:00Z",
      "server_id": "server-001",
      "tran_id": "txn-12345",
      "rsv": null,
      "created_at": "2024-12-24T10:00:00Z",
      "updated_at": "2024-12-24T12:30:00Z"
    }
  ],
  "size": 1,
  "next": null
}
```

---

### 3.2 Get Table Status
**GET** `/v0/store/:storeId/table/:tableId/status`

**Response:** `200 OK`
```json
{
  "tenant_id": "tenant-123",
  "store_id": "store-456",
  "tbl_id": "table-001",
  "status": "occupied",
  "is_combined": true,
  "combined_with": ["table-002", "table-003"],
  "party_size": 8,
  "seated_at": "2024-12-24T12:30:00Z",
  "server_id": "server-001",
  "tran_id": "txn-12345",
  "rsv": null,
  "created_at": "2024-12-24T10:00:00Z",
  "updated_at": "2024-12-24T12:30:00Z"
}
```

**Note:** If status doesn't exist (for legacy tables), it will be auto-initialized with `status: "available"`.

---

### 3.3 Update Table Status
**PATCH** `/v0/store/:storeId/table/:tableId/status`

**Request Body:**
```json
{
  "status": "cleaning",            // "available" | "occupied" | "reserved" | "cleaning" | "blocked"
  "party_size": 4,
  "server_id": "server-002",
  "is_combined": false,
  "combined_with": [],
  "seated_at": "2024-12-24T13:00:00Z",
  "tran_id": "txn-67890",
  "notes": "VIP guest"
}
```

**Response:** `200 OK` (returns updated status)

---

### 3.4 Seat Table
**POST** `/v0/store/:storeId/table/:tableId/seat`

Marks a table as occupied with party details.

**Request Body:**
```json
{
  "party_size": 4,                 // Required, min: 1
  "server_id": "server-001",
  "tran_id": "txn-12345",
  "notes": "Birthday celebration"
}
```

**Response:** `200 OK`
```json
{
  "tbl_id": "table-001",
  "status": "occupied",
  "party_size": 4,
  "seated_at": "2024-12-24T13:00:00Z",
  "server_id": "server-001",
  "tran_id": "txn-12345"
}
```

**Error:** Returns `400` if table is not available or reserved.

---

### 3.5 Clear Table
**POST** `/v0/store/:storeId/table/:tableId/clear`

Marks a table as available and clears all occupancy details.

**Request Body:** (optional)
```json
{
  "reason": "Guests left",
  "cleared_by": "server-001"
}
```

**Response:** `200 OK`
```json
{
  "tbl_id": "table-001",
  "status": "available",
  "party_size": null,
  "seated_at": null,
  "server_id": null,
  "tran_id": null,
  "rsv": null
}
```

**Clears:** `party_size`, `seated_at`, `server_id`, `tran_id`, `rsv`

---

### 3.6 Merge Tables
**POST** `/v0/store/:storeId/tables/merge`

Combines multiple tables into a group.

**Request Body:**
```json
{
  "tbl_ids": ["table-001", "table-002", "table-003"]   // Required, min: 2
}
```

**Response:** `200 OK`
```json
{
  "tables": [
    {
      "table_id": "table-001",
      "status": "available",
      "is_combined": true,
      "combined_with": ["table-002", "table-003"]
    },
    {
      "table_id": "table-002",
      "status": "available",
      "is_combined": true,
      "combined_with": ["table-001", "table-003"]
    },
    {
      "table_id": "table-003",
      "status": "available",
      "is_combined": true,
      "combined_with": ["table-001", "table-002"]
    }
  ],
  "message": "Tables merged successfully"
}
```

**Error:** Returns `400` if any table is not combinable.

---

### 3.7 Unmerge Tables
**POST** `/v0/store/:storeId/tables/unmerge`

Separates previously merged tables.

**Request Body:**
```json
{
  "tbl_ids": ["table-001"]         // Required, min: 1 (all linked tables will be unmerged)
}
```

**Response:** `200 OK`
```json
{
  "tables": [
    {
      "table_id": "table-001",
      "status": "available",
      "is_combined": false,
      "combined_with": []
    },
    {
      "table_id": "table-002",
      "status": "available",
      "is_combined": false,
      "combined_with": []
    }
  ],
  "message": "Tables unmerged successfully"
}
```

**Note:** Unmerging also clears `tran_id` from all affected tables.

---

## 4. Reservation APIs

### 4.1 Create Reservation
**POST** `/v0/store/:storeId/reservations`

**Request Body:**
```json
{
  "tbl_id": "table-001",           // Required
  "cust_name": "John Doe",         // Required
  "cust_phone": "+1234567890",
  "cust_email": "john@example.com",
  "party_size": 4,                 // Required, min: 1
  "rsv_time": "19:00",             // Required - Time (HH:mm or ISO)
  "rsv_date": "2024-12-25",        // Required - Date (YYYY-MM-DD)
  "duration": 90,                  // Expected duration in minutes
  "notes": "Birthday dinner, need cake",
  "source": "online"               // "walk-in" | "phone" | "online" | "app"
}
```

**Response:** `201 Created`
```json
{
  "tbl_id": "table-001",
  "status": "reserved",
  "rsv": {
    "rsv_id": "rsv-uuid-12345",
    "cust_name": "John Doe",
    "cust_phone": "+1234567890",
    "cust_email": "john@example.com",
    "party_size": 4,
    "rsv_time": "19:00",
    "rsv_date": "2024-12-25",
    "duration": 90,
    "notes": "Birthday dinner, need cake",
    "source": "online",
    "confirmed_at": null,
    "cancelled_at": null,
    "cancel_reason": null
  }
}
```

**Error:** Returns `400` if table is not available.

---

### 4.2 Cancel Reservation
**DELETE** `/v0/store/:storeId/table/:tableId/reservation`

**Request Body:** (optional)
```json
{
  "reason": "Customer cancelled"
}
```

**Response:** `200 OK`
```json
{
  "tbl_id": "table-001",
  "status": "available",
  "rsv": null
}
```

---

### 4.3 Get Reservations by Date
**GET** `/v0/store/:storeId/reservations`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | **Yes** | Date in YYYY-MM-DD format |
| `limit` | int | No | Max results (default: 100) |
| `next` | string | No | Pagination token |

**Example:** `GET /v0/store/store-456/reservations?date=2024-12-25`

**Response:** `200 OK`
```json
{
  "reservations": [
    {
      "tbl_id": "table-001",
      "status": "reserved",
      "rsv": {
        "rsv_id": "rsv-uuid-12345",
        "cust_name": "John Doe",
        "party_size": 4,
        "rsv_time": "19:00",
        "rsv_date": "2024-12-25",
        "source": "online"
      }
    },
    {
      "tbl_id": "table-005",
      "status": "reserved",
      "rsv": {
        "rsv_id": "rsv-uuid-67890",
        "cust_name": "Jane Smith",
        "party_size": 2,
        "rsv_time": "20:00",
        "rsv_date": "2024-12-25",
        "source": "phone"
      }
    }
  ],
  "size": 2,
  "next": null
}
```

---

## 5. Floor Plan APIs

Floor plans define visual layouts for table positioning.

### 5.1 Create Floor Plan
**POST** `/v0/store/:storeId/floor-plan`

**Request Body:**
```json
{
  "floor_plan_id": "floor-001",    // Optional, auto-generated if not provided
  "name": "Main Floor",            // Required
  "description": "Ground floor layout",
  "width": 1200,                   // Required, min: 1 (canvas width)
  "height": 800,                   // Required, min: 1 (canvas height)
  "background_image": "https://example.com/floor.png",
  "background_color": "#FFFFFF",
  "is_default": true,
  "display_order": 1
}
```

**Response:** `201 Created`
```json
{
  "tenant_id": "tenant-123",
  "store_id": "store-456",
  "floor_plan_id": "floor-001",
  "name": "Main Floor",
  "description": "Ground floor layout",
  "width": 1200,
  "height": 800,
  "background_image": "https://example.com/floor.png",
  "background_color": "#FFFFFF",
  "is_default": true,
  "status": "active",
  "display_order": 1,
  "created_at": "2024-12-24T10:00:00Z",
  "updated_at": "2024-12-24T10:00:00Z"
}
```

---

### 5.2 Get All Floor Plans
**GET** `/v0/store/:storeId/floor-plan`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | int | Max results (default: 100) |
| `next` | string | Pagination token |

**Response:** `200 OK`
```json
{
  "floor_plans": [
    {
      "floor_plan_id": "floor-001",
      "name": "Main Floor",
      "description": "Ground floor layout",
      "width": 1200,
      "height": 800,
      "background_image": "https://example.com/floor.png",
      "background_color": "#FFFFFF",
      "is_default": true,
      "status": "active",
      "display_order": 1,
      "table_count": 15
    }
  ],
  "size": 1,
  "next": null
}
```

---

### 5.3 Get Floor Plan by ID
**GET** `/v0/store/:storeId/floor-plan/:floorPlanId`

**Response:** `200 OK` (returns full floor plan object)

---

### 5.4 Update Floor Plan
**PUT** `/v0/store/:storeId/floor-plan/:floorPlanId`

**Request Body:**
```json
{
  "name": "Main Floor Updated",
  "description": "Updated layout",
  "width": 1400,
  "height": 900,
  "background_image": "https://example.com/new-floor.png",
  "background_color": "#F5F5F5",
  "is_default": true,
  "status": "active",              // "active" | "inactive"
  "display_order": 1
}
```

**Response:** `200 OK` (returns updated floor plan)

---

### 5.5 Delete Floor Plan
**DELETE** `/v0/store/:storeId/floor-plan/:floorPlanId`

**Response:** `204 No Content`

---

## 6. Enums & Constants

### Table Status
| Value | Description |
|-------|-------------|
| `available` | Table is free and can be seated |
| `occupied` | Table has active guests |
| `reserved` | Table has upcoming reservation |
| `cleaning` | Table is being cleaned |
| `blocked` | Table is not available for service |

### Table Shape
| Value | Description |
|-------|-------------|
| `round` | Circular table |
| `square` | Square table |
| `rectangle` | Rectangular table |
| `oval` | Oval/elliptical table |

### Zone Status
| Value | Description |
|-------|-------------|
| `active` | Zone is available for use |
| `inactive` | Zone is disabled |

### Floor Plan Status
| Value | Description |
|-------|-------------|
| `active` | Floor plan is available |
| `inactive` | Floor plan is disabled |

### Reservation Source
| Value | Description |
|-------|-------------|
| `walk-in` | Walk-in customer |
| `phone` | Phone reservation |
| `online` | Online booking |
| `app` | Mobile app booking |

---

## 7. Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | 4061 | Bad request |
| 400 | 4062 | Invalid request data |
| 400 | 4027 | Invalid table status |
| 400 | 4028 | Table not combinable |
| 401 | 4063 | Unauthorized |
| 404 | 4001 | Zone not found |
| 404 | 4021 | Table not found |
| 404 | 4031 | Table status not found |
| 404 | 4041 | Floor plan not found |
| 404 | 4081 | Reservation not found |
| 409 | 4002 | Zone already exists |
| 409 | 4007 | Zone has tables (cannot delete) |
| 409 | 4022 | Table already exists |
| 409 | 4042 | Floor plan already exists |
| 422 | 4029 | Table merge failed |
| 422 | 4030 | Table unmerge failed |
| 500 | 4064 | Internal server error |

---

## Common Response Fields

All entities include these audit fields:

```json
{
  "created_at": "2024-12-24T10:00:00Z",
  "created_by": "user-123",
  "updated_at": "2024-12-24T12:00:00Z",
  "updated_by": "user-456"
}
```

---

## Frontend Integration Tips

### 1. Floor Plan Rendering
- Use `position_x`, `position_y`, `width`, `height`, `rotation` to position tables
- Canvas size from floor plan's `width` and `height`
- Group tables by `floor_plan_id`

### 2. Real-time Status Updates
- Poll `/table-status` endpoint for live updates
- Use `status` field for color-coding tables
- Show `party_size` and `seated_at` for occupied tables

### 3. Table Merging UI
- Only allow merging tables with `is_combinable: true`
- Show `combined_with` array to display linked tables
- Visual indicator for `is_combined: true` tables

### 4. Reservation Calendar
- Use `/reservations?date=YYYY-MM-DD` for daily view
- Display `rsv_time`, `party_size`, `cust_name` in timeline
- Color-code by `source` (walk-in, phone, online, app)
