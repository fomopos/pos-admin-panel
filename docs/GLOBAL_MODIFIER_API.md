# Global Modifier API Documentation

This document describes the API endpoints for managing Global Modifier Groups in the POS Admin Panel. Global Modifier Groups are reusable templates that can be applied to multiple products for consistent modifier management.

## Overview

The Global Modifier API follows a NoSQL-friendly design where modifiers are embedded within their parent groups, reducing the number of API calls and ensuring atomic operations.

## Base URL Structure

All endpoints follow this pattern:
```
/v0/tenant/{tenantId}/store/{storeId}/global-modifier-groups
```

## Data Models

### ApiGlobalModifierGroup

The main entity representing a global modifier group with embedded modifiers.

```typescript
interface ApiGlobalModifierGroup {
  group_id: string;                    // Unique identifier for the group
  store_id: string;                    // Store this group belongs to
  name: string;                        // Display name (e.g., "Pizza Toppings")
  description?: string;                // Optional description
  selection_type: 'single' | 'multiple' | 'exact' | 'limited';
  exact_selections?: number;           // Required for 'exact' type
  max_selections?: number;             // Required for 'limited' type
  min_selections?: number;             // Optional for 'limited' type
  required: boolean;                   // Whether customer must make a selection
  sort_order: number;                  // Display order in menus
  price_delta?: number;                // Base price adjustment for the group
  active: boolean;                     // Whether the group is active
  modifiers: ApiGlobalModifier[];      // Embedded modifiers
  created_at?: string;                 // ISO timestamp
  updated_at?: string;                 // ISO timestamp
  created_by?: string;                 // User ID who created
  updated_by?: string;                 // User ID who last updated
}
```

### ApiGlobalModifier

Individual modifier within a group.

```typescript
interface ApiGlobalModifier {
  modifier_id: string;                 // Unique identifier for the modifier
  name: string;                        // Display name (e.g., "Pepperoni")
  description?: string;                // Optional description
  price_delta: number;                 // Price adjustment (+/- allowed)
  default_selected: boolean;           // Whether pre-selected for customers
  sort_order: number;                  // Display order within the group
  active: boolean;                     // Whether the modifier is active
  created_at?: string;                 // ISO timestamp
  updated_at?: string;                 // ISO timestamp
}
```

### Selection Types

- **`single`**: Customer picks exactly one option
- **`multiple`**: Customer can pick any number of options
- **`exact`**: Customer must pick exactly N options (specified by `exact_selections`)
- **`limited`**: Customer picks within a range (specified by `min_selections` and `max_selections`)

## API Endpoints

### 1. Get All Global Modifier Groups

Retrieve all global modifier groups for a store with optional filtering.

**Endpoint:**
```
GET /v0/tenant/{tenantId}/store/{storeId}/global-modifier-groups
```

**Query Parameters:**
- `active` (boolean, optional): Filter by active status
- `search` (string, optional): Search by name or description
- `page` (number, optional): Page number for pagination
- `limit` (number, optional): Number of items per page

**Request Example:**
```http
GET /v0/tenant/tenant_123/store/store_456/global-modifier-groups?active=true&search=pizza&page=1&limit=10
```

**Response:**
```json
{
  "items": [
    {
      "group_id": "group_123",
      "store_id": "store_456",
      "name": "Pizza Toppings",
      "description": "Choose your favorite pizza toppings",
      "selection_type": "multiple",
      "required": false,
      "sort_order": 1,
      "price_delta": 0,
      "active": true,
      "modifiers": [
        {
          "modifier_id": "mod_1",
          "name": "Pepperoni",
          "price_delta": 2.50,
          "default_selected": false,
          "sort_order": 1,
          "active": true
        },
        {
          "modifier_id": "mod_2",
          "name": "Mushrooms",
          "price_delta": 1.50,
          "default_selected": false,
          "sort_order": 2,
          "active": true
        }
      ],
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "next": "eyJwYWdlIjoyLCJsaW1pdCI6MTB9",
  "total_count": 25
}
```

**Response Type:**
```typescript
interface GlobalModifierGroupsResponse {
  items: ApiGlobalModifierGroup[];
  next: string | null;                 // Pagination token
  total_count?: number;                // Total number of items
}
```

### 2. Get Single Global Modifier Group

Retrieve a specific global modifier group by ID, including all embedded modifiers.

**Endpoint:**
```
GET /v0/tenant/{tenantId}/store/{storeId}/global-modifier-groups/{groupId}
```

**Request Example:**
```http
GET /v0/tenant/tenant_123/store/store_456/global-modifier-groups/group_123
```

**Response:**
```json
{
  "group_id": "group_123",
  "store_id": "store_456",
  "name": "Pizza Sizes",
  "description": "Choose your pizza size",
  "selection_type": "single",
  "required": true,
  "sort_order": 1,
  "price_delta": 0,
  "active": true,
  "modifiers": [
    {
      "modifier_id": "mod_1",
      "name": "Small (10\")",
      "price_delta": 0,
      "default_selected": true,
      "sort_order": 1,
      "active": true
    },
    {
      "modifier_id": "mod_2",
      "name": "Medium (12\")",
      "price_delta": 3.00,
      "default_selected": false,
      "sort_order": 2,
      "active": true
    },
    {
      "modifier_id": "mod_3",
      "name": "Large (14\")",
      "price_delta": 6.00,
      "default_selected": false,
      "sort_order": 3,
      "active": true
    }
  ],
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Response Type:** `ApiGlobalModifierGroup`

### 3. Create Global Modifier Group

Create a new global modifier group with embedded modifiers.

**Endpoint:**
```
POST /v0/tenant/{tenantId}/store/{storeId}/global-modifier-groups
```

**Request Body:**
```typescript
interface CreateGlobalModifierGroupRequest {
  store_id: string;
  name: string;
  description?: string;
  selection_type: 'single' | 'multiple' | 'exact' | 'limited';
  exact_selections?: number;           // Required if selection_type is 'exact'
  max_selections?: number;             // Required if selection_type is 'limited'
  min_selections?: number;             // Optional for 'limited' type
  required: boolean;
  sort_order: number;
  price_delta?: number;
  active?: boolean;                    // Defaults to true
  modifiers?: CreateGlobalModifierRequest[];
}

interface CreateGlobalModifierRequest {
  name: string;
  description?: string;
  price_delta: number;
  default_selected: boolean;
  sort_order: number;
  active?: boolean;                    // Defaults to true
}
```

**Request Example:**
```json
{
  "store_id": "store_456",
  "name": "Spice Levels",
  "description": "Choose your preferred spice level",
  "selection_type": "exact",
  "exact_selections": 1,
  "required": true,
  "sort_order": 3,
  "price_delta": 0,
  "active": true,
  "modifiers": [
    {
      "name": "Mild",
      "price_delta": 0,
      "default_selected": true,
      "sort_order": 1,
      "active": true
    },
    {
      "name": "Medium",
      "price_delta": 0,
      "default_selected": false,
      "sort_order": 2,
      "active": true
    },
    {
      "name": "Hot",
      "price_delta": 0.50,
      "default_selected": false,
      "sort_order": 3,
      "active": true
    },
    {
      "name": "Extra Hot",
      "price_delta": 1.00,
      "default_selected": false,
      "sort_order": 4,
      "active": true
    }
  ]
}
```

**Response:** `ApiGlobalModifierGroup` (newly created group with generated IDs)

### 4. Update Global Modifier Group

Update an existing global modifier group, including its embedded modifiers.

**Endpoint:**
```
PUT /v0/tenant/{tenantId}/store/{storeId}/global-modifier-groups/{groupId}
```

**Request Body:**
```typescript
interface UpdateGlobalModifierGroupRequest {
  group_id: string;
  store_id?: string;
  name?: string;
  description?: string;
  selection_type?: 'single' | 'multiple' | 'exact' | 'limited';
  exact_selections?: number;
  max_selections?: number;
  min_selections?: number;
  required?: boolean;
  sort_order?: number;
  price_delta?: number;
  active?: boolean;
  modifiers?: (CreateGlobalModifierRequest | UpdateGlobalModifierRequest)[];
}

interface UpdateGlobalModifierRequest extends Partial<CreateGlobalModifierRequest> {
  modifier_id: string;                 // Required for updates
}
```

**Request Example:**
```json
{
  "group_id": "group_123",
  "name": "Updated Pizza Toppings",
  "description": "Choose your favorite pizza toppings - now with more options!",
  "modifiers": [
    {
      "modifier_id": "mod_1",
      "name": "Pepperoni",
      "price_delta": 2.75,
      "default_selected": false,
      "sort_order": 1,
      "active": true
    },
    {
      "name": "Sausage",
      "price_delta": 2.50,
      "default_selected": false,
      "sort_order": 2,
      "active": true
    }
  ]
}
```

**Response:** `ApiGlobalModifierGroup` (updated group)

### 5. Delete Global Modifier Group

Delete a global modifier group and all its embedded modifiers.

**Endpoint:**
```
DELETE /v0/tenant/{tenantId}/store/{storeId}/global-modifier-groups/{groupId}
```

**Request Example:**
```http
DELETE /v0/tenant/tenant_123/store/store_456/global-modifier-groups/group_123
```

**Response:** `204 No Content` (successful deletion)

## Template Operations

### 6. Apply Template to Product

Apply a global modifier group template to a specific product.

**Endpoint:**
```
POST /v0/tenant/{tenantId}/store/{storeId}/global-modifier-groups/{templateGroupId}/apply-to-product
```

**Request Body:**
```json
{
  "item_id": "item_789"
}
```

**Response:** `200 OK` (successful application)

### 7. Get Template Usage Statistics

Get usage statistics for a global modifier group template.

**Endpoint:**
```
GET /v0/tenant/{tenantId}/store/{storeId}/global-modifier-groups/{groupId}/usage
```

**Response:**
```json
{
  "usage_count": 5,
  "products": [
    {
      "item_id": "item_123",
      "name": "Margherita Pizza"
    },
    {
      "item_id": "item_456", 
      "name": "Pepperoni Pizza"
    },
    {
      "item_id": "item_789",
      "name": "Supreme Pizza"
    }
  ]
}
```

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

### Common Error Codes

- **`400 Bad Request`**: Invalid request data
- **`401 Unauthorized`**: Missing or invalid authentication
- **`403 Forbidden`**: Insufficient permissions
- **`404 Not Found`**: Resource not found
- **`409 Conflict`**: Resource already exists or conflict
- **`422 Unprocessable Entity`**: Validation errors
- **`500 Internal Server Error`**: Server error

## Examples by Use Case

### Creating a Pizza Toppings Template

```json
POST /v0/tenant/tenant_123/store/store_456/global-modifier-groups

{
  "store_id": "store_456",
  "name": "Pizza Toppings",
  "description": "Choose your favorite pizza toppings",
  "selection_type": "multiple",
  "required": false,
  "sort_order": 2,
  "price_delta": 0,
  "modifiers": [
    {
      "name": "Pepperoni",
      "price_delta": 2.50,
      "default_selected": false,
      "sort_order": 1
    },
    {
      "name": "Mushrooms", 
      "price_delta": 1.50,
      "default_selected": false,
      "sort_order": 2
    },
    {
      "name": "Bell Peppers",
      "price_delta": 1.50,
      "default_selected": false,
      "sort_order": 3
    },
    {
      "name": "Olives",
      "price_delta": 1.75,
      "default_selected": false,
      "sort_order": 4
    }
  ]
}
```

### Creating a Drink Size Template (Exact Selection)

```json
POST /v0/tenant/tenant_123/store/store_456/global-modifier-groups

{
  "store_id": "store_456",
  "name": "Drink Sizes",
  "description": "Choose your drink size",
  "selection_type": "exact",
  "exact_selections": 1,
  "required": true,
  "sort_order": 1,
  "price_delta": 0,
  "modifiers": [
    {
      "name": "Small (12oz)",
      "price_delta": 0,
      "default_selected": true,
      "sort_order": 1
    },
    {
      "name": "Medium (16oz)",
      "price_delta": 1.50,
      "default_selected": false,
      "sort_order": 2
    },
    {
      "name": "Large (20oz)",
      "price_delta": 2.50,
      "default_selected": false,
      "sort_order": 3
    }
  ]
}
```

### Creating a Side Items Template (Limited Selection)

```json
POST /v0/tenant/tenant_123/store/store_456/global-modifier-groups

{
  "store_id": "store_456",
  "name": "Choose Side Items",
  "description": "Pick up to 2 side items",
  "selection_type": "limited",
  "min_selections": 0,
  "max_selections": 2,
  "required": false,
  "sort_order": 3,
  "price_delta": 0,
  "modifiers": [
    {
      "name": "French Fries",
      "price_delta": 3.50,
      "default_selected": false,
      "sort_order": 1
    },
    {
      "name": "Onion Rings",
      "price_delta": 4.00,
      "default_selected": false,
      "sort_order": 2
    },
    {
      "name": "Side Salad",
      "price_delta": 3.00,
      "default_selected": false,
      "sort_order": 3
    },
    {
      "name": "Coleslaw",
      "price_delta": 2.50,
      "default_selected": false,
      "sort_order": 4
    }
  ]
}
```

## Implementation Notes

### NoSQL Database Considerations

1. **Document Structure**: Groups and modifiers are stored as a single document, making atomic updates possible.

2. **Indexing**: Consider indexing on:
   - `store_id` for store-specific queries
   - `active` for filtering active groups
   - `name` for search functionality
   - `sort_order` for display ordering

3. **Query Patterns**: 
   - Most queries will be store-scoped
   - Search functionality should support partial text matching
   - Sorting by `sort_order` is common

### Frontend Integration

1. **State Management**: The embedded structure simplifies state management as modifiers are always loaded with their group.

2. **Form Handling**: Create/update operations can handle the entire group in a single form submission.

3. **Validation**: Frontend should validate selection type constraints (exact_selections, min/max_selections).

### Performance Considerations

1. **Pagination**: Use cursor-based pagination for large datasets.

2. **Caching**: Group data is relatively stable and can be cached effectively.

3. **Batch Operations**: The embedded structure reduces the need for multiple API calls.
