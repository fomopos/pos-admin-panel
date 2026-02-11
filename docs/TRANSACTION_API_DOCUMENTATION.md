# 💳 Transaction Management API Documentation

This API provides endpoints to manage **sales transactions, payments, and order processing** within the POS system, including transaction creation, payment processing, refunds, and transaction analytics.

---

## 🏠 Base URL
```
{{base_url}}/v0/store/{storeId}/transaction
```

---

## 🔐 Authentication
All requests require valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 📐 Data Types

### ScaledInt
Monetary values are represented as integers scaled by 10,000 to preserve 4 decimal places of precision.

**Example**: $12.50 = 125000

### Date/Time Formats
- **Date Format**: `YYYY-MM-DD` (e.g., "2026-02-08")
- **DateTime Format**: ISO 8601 with timezone (e.g., "2026-02-08T14:30:00Z")

---

## 📋 Enumerations

### TransactionType
| Value | Description |
|-------|-------------|
| `RETAIL_SALE` | Standard retail sale transaction |

### TransactionStatus
| Value | Description |
|-------|-------------|
| `COMPLETE` | Transaction completed successfully |
| `CANCEL` | Transaction cancelled |
| `NEW` | New transaction in progress |
| `RESUME` | Resumed from suspended state |
| `SUSPEND` | Temporarily suspended transaction |

### LineItemTypeCode
| Value | Description |
|-------|-------------|
| `SALE` | Item being sold |
| `RETURN` | Item being returned |

### ReturnTypeCode
| Value | Description |
|-------|-------------|
| `BLIND` | Return without original receipt |
| `VERIFIED` | Return with verified receipt |
| `UNVERIFIED` | Return with unverified receipt |

### PriceModReasonCode
| Value | Description |
|-------|-------------|
| `DEAL` | Deal or promotion applied |
| `LINE_ITEM_DISCOUNT` | Individual item discount |
| `GROUP_DISCOUNT` | Group of items discount |
| `TRANSACTION_DISCOUNT` | Entire transaction discount |
| `PRICE_OVERRIDE` | Manual price override |
| `PROMPT_PRICE_CHANGE` | Prompted price change |
| `BASE_PRICE_RULE` | Base pricing rule |
| `NEW_PRICE_RULE` | New pricing rule applied |
| `DOCUMENT` | Document-based discount |
| `MANUFACTURER_COUPON` | Manufacturer coupon |
| `REFUND_PRORATION` | Prorated refund adjustment |
| `CALCULATED_WARRANTY_PRICE` | Warranty price calculation |
| `ENTITLEMENT` | Entitlement-based discount |

---

## 🧾 Transaction Entity Schema

### Transaction Object
```json
{
  "tenant_id": "TENANT001",
  "store_id": "STORE001",
  "terminal_id": "POS01",
  "trans_seq": "20260208-001",
  "locale": "en_US",
  "currency": "USD",
  "trans_type": "RETAIL_SALE",
  "biz_date": "2026-02-08",
  "begin_time": "2026-02-08T10:30:00Z",
  "end_time": "2026-02-08T10:35:00Z",
  "total": 1575000,
  "tax_total": 75000,
  "sub_total": 1500000,
  "disc_total": 0,
  "round_total": 0,
  "status": "COMPLETE",
  "is_void": false,
  "customer_id": "CUST12345",
  "associates": ["EMP001"],
  "notes": "Customer requested extra hot",
  "return_ref": null,
  "ext_order_id": null,
  "ext_order_src": null,
  "trans_table": {
    "table_id": "TABLE005",
    "table_name": "5",
    "section_id": "main_dining",
    "server_id": "EMP002",
    "guests": 4
  },
  "line_items": [...],
  "documents": [...],
  "payments": [...],
  "discounts": [...]
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `tenant_id` | string | Unique identifier for the tenant/organization |
| `store_id` | string | Store identifier |
| `terminal_id` | string | Terminal/POS device identifier |
| `trans_seq` | string | Unique transaction sequence number |
| `locale` | string | Store locale (e.g., "en_US") |
| `currency` | string | Currency code (e.g., "USD") |
| `trans_type` | enum | Transaction type (see TransactionType enum) |
| `biz_date` | string | Business date in YYYY-MM-DD format |
| `begin_time` | datetime | Transaction start timestamp |
| `end_time` | datetime | Transaction end timestamp |
| `total` | ScaledInt | Total transaction amount |
| `tax_total` | ScaledInt | Total tax amount |
| `sub_total` | ScaledInt | Subtotal before tax |
| `disc_total` | ScaledInt | Total discount amount |
| `round_total` | ScaledInt | Rounding adjustment |
| `status` | enum | Transaction status (see TransactionStatus enum) |
| `is_void` | boolean | Whether transaction is voided |
| `customer_id` | string | Customer identifier |
| `associates` | array[string] | Employee IDs associated with transaction |
| `notes` | string | General notes |
| `return_ref` | array[string] | References to original transactions for returns |
| `ext_order_id` | string | External order identifier |
| `ext_order_src` | string | External order source system |
| `trans_table` | object | Restaurant table information (see TransactionTable) |
| `line_items` | array | Transaction line items (see TransactionLineItem) |
| `documents` | array | Attached documents (see TransactionDocument) |
| `payments` | array | Payment line items (see PaymentLineItem) |
| `discounts` | array | Transaction-level discounts (see TransactionDiscountLineItem) |

---

## 📦 Nested Objects

### TransactionLineItem

Represents an individual item in the transaction.

```json
{
  "seq": 1,
  "category": "ELECTRONICS",
  "item_id": "SKU001",
  "line_type": "SALE",
  "item_desc": "Wireless Mouse",
  "entered_desc": null,
  "is_void": false,
  "qty": 10000,
  "gross_qty": 10000,
  "net_qty": 10000,
  "unit_price": 250000,
  "ext_amt": 250000,
  "vat_amt": 12500,
  "is_return": false,
  "item_entry": "scan",
  "price_entry": "standard",
  "price_prop": "regular",
  "net_amt": 250000,
  "gross_amt": 250000,
  "serial_num": null,
  "scanned_id": "1234567890123",
  "tax_group_id": "TAX01",
  "orig_trans_seq": null,
  "orig_store_id": null,
  "orig_line_seq": null,
  "orig_terminal_id": null,
  "orig_biz_date": null,
  "return_comment": null,
  "return_reason": null,
  "return_type": null,
  "base_unit_price": 250000,
  "base_ext_amt": 250000,
  "food_stamp_amt": null,
  "vendor_id": "VENDOR01",
  "regular_price": 250000,
  "unit_cost": 150000,
  "init_qty": 10000,
  "non_returnable": false,
  "exclude_net_sales": false,
  "measure_req": false,
  "weight_method": null,
  "tare_value": null,
  "tare_type": null,
  "tare_uom": null,
  "notes": null,
  "taxes": [...],
  "modifiers": [...],
  "addons": [...]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `seq` | integer | Line item sequence number |
| `category` | string | Item category |
| `item_id` | string | Item identifier |
| `line_type` | enum | Line item type (SALE or RETURN) |
| `item_desc` | string | Item description |
| `entered_desc` | string | User-entered description |
| `is_void` | boolean | Whether line is voided |
| `qty` | ScaledInt | Item quantity |
| `gross_qty` | ScaledInt | Gross quantity before adjustments |
| `net_qty` | ScaledInt | Net quantity after adjustments |
| `unit_price` | ScaledInt | Price per unit |
| `ext_amt` | ScaledInt | Extended amount (qty × unit_price) |
| `vat_amt` | ScaledInt | VAT/tax amount |
| `is_return` | boolean | Return flag |
| `item_entry` | string | Method of item entry (scan, manual, etc.) |
| `price_entry` | string | Method of price entry |
| `price_prop` | string | Price property code |
| `net_amt` | ScaledInt | Net amount after discounts |
| `gross_amt` | ScaledInt | Gross amount before discounts |
| `serial_num` | string | Serial number for serialized items |
| `scanned_id` | string | Scanned barcode/ID |
| `tax_group_id` | string | Tax group identifier |
| `orig_trans_seq` | string | Original transaction sequence (for returns) |
| `orig_store_id` | string | Original store ID (for returns) |
| `orig_line_seq` | integer | Original line sequence (for returns) |
| `orig_terminal_id` | string | Original terminal ID (for returns) |
| `orig_biz_date` | string | Original business date (for returns) |
| `return_comment` | string | Comment about the return |
| `return_reason` | string | Reason for return |
| `return_type` | enum | Type of return (see ReturnTypeCode) |
| `base_unit_price` | ScaledInt | Base price before modifications |
| `base_ext_amt` | ScaledInt | Base extended amount |
| `food_stamp_amt` | ScaledInt | Food stamp/SNAP amount applied |
| `vendor_id` | string | Vendor identifier |
| `regular_price` | ScaledInt | Regular/list price |
| `unit_cost` | ScaledInt | Cost per unit |
| `init_qty` | ScaledInt | Initial quantity entered |
| `non_returnable` | boolean | Item cannot be returned |
| `exclude_net_sales` | boolean | Exclude from net sales reporting |
| `measure_req` | boolean | Measurement required flag |
| `weight_method` | string | Weight entry method |
| `tare_value` | ScaledInt | Tare weight value |
| `tare_type` | string | Type of tare |
| `tare_uom` | string | Tare unit of measure |
| `notes` | string | Line item notes |
| `taxes` | array | Tax modifiers (see TaxModifiers) |
| `modifiers` | array | Price modifiers (see PriceModifier) |
| `addons` | array | Additional modifiers/addons (see TransactionAdditionalLineItemModifier) |

---

### PriceModifier

Represents a price adjustment (discount, deal, override, etc.).

```json
{
  "seq": 1,
  "reason": "DEAL",
  "amt": 50000,
  "percent": 100000,
  "change_amt": 50000,
  "change_reason": "Promotional discount",
  "disc_code": "PROMO10",
  "disc_reason": "10% off promotion",
  "deal_id": "DEAL001",
  "deal_amt": 50000,
  "serial_num": "SN123456",
  "ext_amt": 50000,
  "desc": "10% promotional discount",
  "is_void": false,
  "notes": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `seq` | integer | Modifier sequence number |
| `reason` | enum | Reason for price modification (see PriceModReasonCode) |
| `amt` | ScaledInt | Modification amount |
| `percent` | ScaledInt | Modification percentage (scaled) |
| `change_amt` | ScaledInt | Price change amount |
| `change_reason` | string | Reason for price change |
| `disc_code` | string | Discount code applied |
| `disc_reason` | string | Discount reason |
| `deal_id` | string | Deal identifier |
| `deal_amt` | ScaledInt | Deal amount |
| `serial_num` | string | Serial number for tracking |
| `ext_amt` | ScaledInt | Extended amount |
| `desc` | string | Description |
| `is_void` | boolean | Whether modifier is voided |
| `notes` | string | Notes |

---

### TaxModifiers

Tax calculation details for a line item.

```json
{
  "seq": 1,
  "authority_id": "STATE01",
  "authority_name": "State Tax",
  "authority_type": "STATE",
  "tax_group_id": "TAX01",
  "tax_rule_id": 1,
  "tax_rule_name": "Standard Sales Tax",
  "tax_location_id": "LOC001",
  "taxable_amt": 250000,
  "tax_amt": 12500,
  "tax_pct": 50000,
  "orig_taxable_amt": 250000,
  "raw_tax_pct": 50000,
  "raw_tax_amt": 12500,
  "tax_override": false,
  "override_amt": null,
  "override_reason": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `seq` | integer | Tax modifier sequence |
| `authority_id` | string | Tax authority identifier |
| `authority_name` | string | Tax authority name |
| `authority_type` | string | Type of tax authority |
| `tax_group_id` | string | Tax group identifier |
| `tax_rule_id` | integer | Tax rule identifier |
| `tax_rule_name` | string | Tax rule name |
| `tax_location_id` | string | Tax location identifier |
| `taxable_amt` | ScaledInt | Taxable amount |
| `tax_amt` | ScaledInt | Tax amount |
| `tax_pct` | ScaledInt | Tax percentage (scaled) |
| `orig_taxable_amt` | ScaledInt | Original taxable amount |
| `raw_tax_pct` | ScaledInt | Raw tax percentage before rounding |
| `raw_tax_amt` | ScaledInt | Raw tax amount before rounding |
| `tax_override` | boolean | Tax was manually overridden |
| `override_amt` | ScaledInt | Override amount |
| `override_reason` | string | Reason for override |

---

### TransactionAdditionalLineItemModifier

Add-ons or customizations to a line item (e.g., extra toppings, customizations).

```json
{
  "seq": 1,
  "group_id": "TOPPINGS",
  "mod_id": "MOD001",
  "mod_desc": "Extra Cheese",
  "qty": 10000,
  "unit_price": 15000,
  "ext_amt": 15000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `seq` | integer | Modifier sequence |
| `group_id` | string | Modifier group identifier |
| `mod_id` | string | Modifier identifier |
| `mod_desc` | string | Modifier description |
| `qty` | ScaledInt | Quantity |
| `unit_price` | ScaledInt | Price per unit |
| `ext_amt` | ScaledInt | Extended amount |

---

## 💳 Payment Schema

### PaymentLineItem

Payment information for the transaction.

```json
{
  "seq": 1,
  "amt": 1575000,
  "is_change": false,
  "tender_id": "CARD",
  "tender_desc": "Credit Card",
  "is_void": false,
  "serial_num": "AUTH123456",
  "tender_status": "approved",
  "foreign_amt": null,
  "exch_rate": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `seq` | integer | Payment sequence |
| `amt` | ScaledInt | Payment amount |
| `is_change` | boolean | Whether this is change given |
| `tender_id` | string | Tender type identifier |
| `tender_desc` | string | Tender description (Cash, Card, etc.) |
| `is_void` | boolean | Payment voided |
| `serial_num` | string | Serial/tracking number |
| `tender_status` | string | Payment status code |
| `foreign_amt` | ScaledInt | Amount in foreign currency |
| `exch_rate` | ScaledInt | Exchange rate (scaled) |

---

### TransactionDiscountLineItem

Transaction-level discount.

```json
{
  "seq": 1,
  "disc_code": "LOYALTY10",
  "percent": 100000,
  "amt": 150000,
  "serial_num": "DISC123456"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `seq` | integer | Discount sequence |
| `disc_code` | string | Discount code applied |
| `percent` | ScaledInt | Discount percentage (scaled) |
| `amt` | ScaledInt | Discount amount |
| `serial_num` | string | Serial/tracking number |

---

### TransactionTable

Restaurant table information (for dine-in transactions).

```json
{
  "table_id": "TABLE005",
  "table_name": "5",
  "section_id": "main_dining",
  "server_id": "EMP002",
  "guests": 4
}
```

| Field | Type | Description |
|-------|------|-------------|
| `table_id` | string | Table identifier |
| `table_name` | string | Table name/number |
| `section_id` | string | Section identifier |
| `server_id` | string | Server/waiter identifier |
| `guests` | integer | Number of guests |

---

### TransactionDocument

Attached documents or receipts.

```json
{
  "doc_id": "DOC001",
  "doc_type": "receipt",
  "data": "base64_encoded_data_or_url"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `doc_id` | string | Document identifier |
| `doc_type` | string | Document type (receipt, invoice, etc.) |
| `data` | string | Document data (base64 encoded or URL) |

---

# 💳 Transaction Management APIs

## 🔹 Create Transaction

### `POST /v0/store/{storeId}/transaction`

Creates a new transaction for processing a sale.

#### 🔸 Request Body
```json
{
  "terminal_id": "POS01",
  "trans_seq": "20260208-001",
  "locale": "en_US",
  "currency": "USD",
  "trans_type": "RETAIL_SALE",
  "biz_date": "2026-02-08",
  "begin_time": "2026-02-08T10:30:00Z",
  "customer_id": "CUST12345",
  "associates": ["EMP001"],
  "line_items": [
    {
      "seq": 1,
      "category": "ELECTRONICS",
      "item_id": "SKU001",
      "line_type": "SALE",
      "item_desc": "Wireless Mouse",
      "qty": 10000,
      "unit_price": 250000,
      "ext_amt": 250000,
      "tax_group_id": "TAX01",
      "taxes": [
        {
          "seq": 1,
          "authority_id": "STATE01",
          "authority_name": "State Tax",
          "tax_group_id": "TAX01",
          "taxable_amt": 250000,
          "tax_amt": 12500,
          "tax_pct": 50000
        }
      ],
      "modifiers": [],
      "addons": []
    }
  ],
  "payments": [
    {
      "seq": 1,
      "amt": 262500,
      "tender_id": "CARD",
      "tender_desc": "Credit Card",
      "tender_status": "approved"
    }
  ],
  "status": "COMPLETE"
}
```

#### 🔸 Response (201 Created)
```json
{
  "trans_seq": "20260208-001",
  "status": "COMPLETE",
  "total": 262500,
  "tax_total": 12500,
  "sub_total": 250000,
  "disc_total": 0,
  "round_total": 0,
  "created_at": "2026-02-08T10:30:00Z",
  "message": "Transaction created successfully"
}
```

#### 🔸 Response Codes
- `201 Created`: Transaction created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `409 Conflict`: Duplicate transaction sequence
- `422 Unprocessable Entity`: Validation errors

---

## 🔹 Get All Transactions

### `GET /v0/store/{storeId}/transaction`

Retrieves all transactions for a store with filtering and pagination.

#### 🔸 Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | integer | No | Number of transactions to return (default: 20, max: 100) |
| `next` | string | No | Pagination token for next page |
| `status` | string | No | Filter by status (COMPLETE, CANCEL, NEW, RESUME, SUSPEND) |
| `start_date` | string | No | Start date filter (YYYY-MM-DD) |
| `end_date` | string | No | End date filter (YYYY-MM-DD) |
| `customer_id` | string | No | Filter by customer ID |
| `terminal_id` | string | No | Filter by terminal ID |
| `trans_type` | string | No | Filter by transaction type |

#### 🔸 Response (200 OK)
```json
{
  "transactions": [
    {
      "tenant_id": "TENANT001",
      "store_id": "STORE001",
      "terminal_id": "POS01",
      "trans_seq": "20260208-001",
      "trans_type": "RETAIL_SALE",
      "biz_date": "2026-02-08",
      "begin_time": "2026-02-08T10:30:00Z",
      "end_time": "2026-02-08T10:35:00Z",
      "total": 262500,
      "tax_total": 12500,
      "sub_total": 250000,
      "disc_total": 0,
      "status": "COMPLETE",
      "is_void": false,
      "customer_id": "CUST12345"
    }
  ],
  "pagination": {
    "next_token": "eyJsYXN0X2V2YWx1YXRlZF9rZXki...",
    "has_more": true,
    "total_count": 145
  },
  "summary": {
    "total_amount": 3250750,
    "total_transactions": 145,
    "average_transaction": 22419
  }
}
```

#### 🔸 Response Codes
- `200 OK`: Transactions retrieved successfully
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Access denied to this store
- `400 Bad Request`: Invalid query parameters

---

## 🔹 Get Transaction by ID

### `GET /v0/store/{storeId}/transaction/{transactionId}`

Retrieves detailed information for a specific transaction.

#### 🔸 Path Parameters
- `storeId`: Store identifier  
- `transactionId`: Transaction identifier (trans_seq)

#### 🔸 Response (200 OK)
Returns the complete Transaction object as defined in the Transaction Object section with all nested objects populated.

```json
{
  "tenant_id": "TENANT001",
  "store_id": "STORE001",
  "terminal_id": "POS01",
  "trans_seq": "20260208-001",
  "locale": "en_US",
  "currency": "USD",
  "trans_type": "RETAIL_SALE",
  "biz_date": "2026-02-08",
  "begin_time": "2026-02-08T10:30:00Z",
  "end_time": "2026-02-08T10:35:00Z",
  "total": 262500,
  "tax_total": 12500,
  "sub_total": 250000,
  "disc_total": 0,
  "round_total": 0,
  "status": "COMPLETE",
  "is_void": false,
  "customer_id": "CUST12345",
  "associates": ["EMP001"],
  "notes": null,
  "return_ref": null,
  "ext_order_id": null,
  "ext_order_src": null,
  "trans_table": null,
  "line_items": [
    {
      "seq": 1,
      "category": "ELECTRONICS",
      "item_id": "SKU001",
      "line_type": "SALE",
      "item_desc": "Wireless Mouse",
      "is_void": false,
      "qty": 10000,
      "unit_price": 250000,
      "ext_amt": 250000,
      "vat_amt": 12500,
      "is_return": false,
      "net_amt": 250000,
      "gross_amt": 250000,
      "tax_group_id": "TAX01",
      "taxes": [
        {
          "seq": 1,
          "authority_id": "STATE01",
          "authority_name": "State Tax",
          "tax_group_id": "TAX01",
          "taxable_amt": 250000,
          "tax_amt": 12500,
          "tax_pct": 50000
        }
      ],
      "modifiers": [],
      "addons": []
    }
  ],
  "documents": [],
  "payments": [
    {
      "seq": 1,
      "amt": 262500,
      "is_change": false,
      "tender_id": "CARD",
      "tender_desc": "Credit Card",
      "is_void": false,
      "serial_num": "AUTH123456",
      "tender_status": "approved"
    }
  ],
  "discounts": []
}
```

#### 🔸 Response Codes
- `200 OK`: Transaction retrieved successfully
- `404 Not Found`: Transaction does not exist
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Access denied to this transaction

---

## 🔹 Update Transaction

> **Note**: There is no dedicated PUT endpoint for updating a single transaction. Use the Bulk Update endpoint instead.

### `POST /v0/store/{storeId}/transaction/bulk`

Updates transactions via bulk operations. See Bulk Update Transactions section below.

#### 🔸 Updatable Fields
- `status` (except from COMPLETE to other states)
- `notes`
- `associates`
- `customer_id`
- `end_time` (if not already set)

#### 🔸 Request Body
```json
{
  "status": "COMPLETE",
  "end_time": "2026-02-08T10:35:00Z",
  "notes": "Customer requested gift receipt",
  "customer_id": "CUST12345"
}
```

#### 🔸 Response (200 OK)
```json
{
  "message": "Transaction updated successfully",
  "trans_seq": "20260208-001",
  "updated_at": "2026-02-08T10:35:00Z"
}
```

#### 🔸 Response Codes
- `200 OK`: Transaction updated successfully
- `400 Bad Request`: Invalid update data
- `404 Not Found`: Transaction does not exist
- `409 Conflict`: Cannot update completed/voided transaction
- `422 Unprocessable Entity`: Validation errors

---

## 🔹 Bulk Update Transactions

### `POST /v0/store/{storeId}/transaction/bulk`

Updates multiple transactions in a single request (for status changes, notes, etc.).

#### 🔸 Supported Operations
- `update_status`: Update transaction status
- `add_note`: Add or update notes
- `assign_customer`: Assign/update customer_id
- `update_associates`: Update associates list

#### 🔸 Request Body
```json
{
  "operations": [
    {
      "trans_seq": "20260208-001",
      "operation": "update_status",
      "data": {
        "status": "COMPLETE",
        "end_time": "2026-02-08T10:35:00Z"
      }
    },
    {
      "trans_seq": "20260208-002",
      "operation": "add_note",
      "data": {
        "notes": "Customer will pick up later"
      }
    }
  ]
}
```

#### 🔸 Response (200 OK)
```json
{
  "message": "Bulk update completed",
  "results": [
    {
      "trans_seq": "20260208-001",
      "operation": "update_status",
      "status": "success",
      "message": "Transaction status updated successfully"
    },
    {
      "trans_seq": "20260208-002",
      "operation": "add_note",
      "status": "success",
      "message": "Note added successfully"
    }
  ],
  "summary": {
    "total_operations": 2,
    "successful": 2,
    "failed": 0
  }
}
```

#### 🔸 Response Codes
- `200 OK`: Bulk operations completed (check individual results)
- `400 Bad Request`: Invalid request structure
- `401 Unauthorized`: Missing or invalid authentication

---

## 🔹 Void Transaction

### `DELETE /v0/store/{storeId}/transaction/{transactionId}`

Voids a transaction (sets `is_void` to true, does not delete the record).

#### 🔸 Path Parameters
- `storeId`: Store identifier
- `transactionId`: Transaction identifier (trans_seq)

#### 🔸 Query Parameters
- `reason` (string, required): Reason for voiding
- `voided_by` (string, optional): User ID of person voiding

#### 🔸 Example Request
```
DELETE /v0/store/STORE001/transaction/20260208-001?reason=Customer%20cancellation&voided_by=EMP002
```

#### 🔸 Response (200 OK)
```json
{
  "message": "Transaction voided successfully",
  "trans_seq": "20260208-001",
  "is_void": true,
  "voided_at": "2026-02-08T15:45:00Z",
  "reason": "Customer cancellation"
}
```

#### 🔸 Response Codes
- `200 OK`: Transaction voided successfully
- `400 Bad Request`: Missing required parameters
- `404 Not Found`: Transaction does not exist
- `409 Conflict`: Transaction already voided or has refunds

---

## 🔹 Get Transaction Summary

### `GET /v0/store/{storeId}/transaction/summary`

Retrieves transaction summaries for a store with filtering and pagination.

#### 🔸 Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | string | No | Number of transactions to return (default: 10) |
| `next` | string | No | Pagination token for next page |
| `filter_type` | string | No | Filter type: `cashier`, `status`, or `type` |
| `value` | string | Conditional | Required when `filter_type` is provided. The value to filter by (e.g., cashier ID, status value, transaction type) |
| `start_date` | string | No | Start date filter (YYYY-MM-DD). Defaults to 7 days ago |
| `end_date` | string | No | End date filter (YYYY-MM-DD). Defaults to tomorrow |

#### 🔸 Filter Types
| filter_type | value example | Description |
|-------------|---------------|-------------|
| `cashier` | `EMP001` | Filter by associate/cashier ID |
| `status` | `COMPLETE` | Filter by transaction status |
| `type` | `RETAIL_SALE` | Filter by transaction type |

#### 🔸 Response (200 OK)
```json
{
  "datalist": [
    {
      "tenant_id": "TENANT001",
      "store_id": "STORE001",
      "terminal_id": "POS01",
      "trans_seq": "20260208-001",
      "trans_type": "RETAIL_SALE",
      "biz_date": "2026-02-08",
      "begin_time": "2026-02-08T10:30:00Z",
      "end_time": "2026-02-08T10:35:00Z",
      "total": 262500,
      "tax_total": 12500,
      "sub_total": 250000,
      "disc_total": 0,
      "status": "COMPLETE",
      "is_void": false,
      "customer_id": "CUST12345",
      "currency": "USD",
      "associates": ["EMP001"],
      "tender_summary": [
        {
          "tender": "Credit Card",
          "amount": 262500
        }
      ],
      "line_items_count": 3
    }
  ],
  "next": "DATE#2026-02-08#TXN#20260208-001"
}
```

#### 🔸 Response Codes
- `200 OK`: Summary retrieved successfully
- `400 Bad Request`: Invalid date parameters
- `401 Unauthorized`: Missing or invalid authentication

---

# 💰 Refund & Return Operations

## 🔹 Process Refund

### `POST /v0/store/{storeId}/transaction/{transactionId}/refund`

Processes a full or partial refund for a transaction.

> **Note**: This endpoint may not be implemented yet. Check router.go for current availability.

#### 🔸 Refund Types
- `full`: Complete transaction refund
- `partial`: Refund specific line items or amounts

#### 🔸 Request Body
```json
{
  "refund_type": "partial",
  "reason": "CUSTOMER_REQUEST",
  "line_items": [
    {
      "orig_line_seq": 1,
      "qty": -10000,
      "return_type": "VERIFIED",
      "return_reason": "CUSTOMER_REQUEST",
      "return_comment": "Customer changed mind"
    }
  ],
  "processed_by": "EMP002",
  "notes": "Customer reported defect"
}
```

#### 🔸 Response (201 Created)
```json
{
  "refund_trans_seq": "20260208-R001",
  "orig_trans_seq": "20260208-001",
  "refund_amount": -262500,
  "tax_refund": -12500,
  "status": "COMPLETE",
  "processed_at": "2026-02-08T16:30:00Z",
  "payment_refund": {
    "seq": 1,
    "amt": -262500,
    "tender_id": "CARD",
    "tender_desc": "Credit Card Refund",
    "tender_status": "approved"
  },
  "message": "Refund processed successfully"
}
```

#### 🔸 Response Codes
- `201 Created`: Refund processed successfully
- `400 Bad Request`: Invalid refund data
- `404 Not Found`: Original transaction not found
- `409 Conflict`: Refund amount exceeds original transaction
- `422 Unprocessable Entity`: Validation errors

---

## 🔹 Return Transaction Example

A return transaction uses the same structure as a regular transaction but with negative quantities and amounts:

```json
{
  "tenant_id": "TENANT001",
  "store_id": "STORE001",
  "terminal_id": "POS01",
  "trans_seq": "20260208-002",
  "locale": "en_US",
  "currency": "USD",
  "trans_type": "RETAIL_SALE",
  "biz_date": "2026-02-08",
  "begin_time": "2026-02-08T14:15:00Z",
  "end_time": "2026-02-08T14:20:00Z",
  "total": -250000,
  "tax_total": -12500,
  "sub_total": -250000,
  "disc_total": 0,
  "round_total": 0,
  "status": "COMPLETE",
  "is_void": false,
  "customer_id": "CUST12345",
  "associates": ["EMP002"],
  "return_ref": ["20260208-001"],
  "line_items": [
    {
      "seq": 1,
      "category": "ELECTRONICS",
      "item_id": "SKU001",
      "line_type": "RETURN",
      "item_desc": "Wireless Mouse",
      "is_void": false,
      "qty": -10000,
      "gross_qty": -10000,
      "net_qty": -10000,
      "unit_price": 250000,
      "ext_amt": -250000,
      "vat_amt": -12500,
      "is_return": true,
      "orig_trans_seq": "20260208-001",
      "orig_store_id": "STORE001",
      "orig_line_seq": 1,
      "orig_terminal_id": "POS01",
      "orig_biz_date": "2026-02-08",
      "return_comment": "Customer changed mind",
      "return_reason": "CUSTOMER_REQUEST",
      "return_type": "VERIFIED",
      "taxes": [
        {
          "seq": 1,
          "authority_id": "STATE01",
          "authority_name": "State Tax",
          "tax_group_id": "TAX01",
          "taxable_amt": -250000,
          "tax_amt": -12500,
          "tax_pct": 50000
        }
      ]
    }
  ],
  "payments": [
    {
      "seq": 1,
      "amt": -262500,
      "is_change": false,
      "tender_id": "CARD",
      "tender_desc": "Credit Card Refund",
      "is_void": false,
      "serial_num": "REFUND123456",
      "tender_status": "approved"
    }
  ],
  "discounts": []
}
```

---

# 🔍 Search Transactions

### `POST /v0/store/{storeId}/transaction/search`

Advanced search for transactions with complex criteria.

> **Note**: This endpoint may not be implemented yet. Check router.go for current availability.

#### 🔸 Request Body
```json
{
  "filters": {
    "biz_date": {
      "start": "2026-02-01",
      "end": "2026-02-08"
    },
    "status": ["COMPLETE", "SUSPEND"],
    "total": {
      "min": 100000,
      "max": 5000000
    },
    "customer_id": "CUST12345",
    "associates": ["EMP001", "EMP002"],
    "is_void": false,
    "has_returns": true
  },
  "sort_by": "biz_date",
  "sort_order": "desc",
  "limit": 50,
  "offset": 0
}
```

#### 🔸 Response (200 OK)
```json
{
  "transactions": [...],
  "pagination": {
    "total_count": 125,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

#### 🔸 Response Codes
- `200 OK`: Search completed successfully
- `400 Bad Request`: Invalid search criteria
- `401 Unauthorized`: Missing or invalid authentication

---

# 🧾 Receipt & Documentation

## 🔹 Generate Receipt

### `POST /v0/store/{storeId}/transaction/{transactionId}/receipt`

Generates and sends a receipt for a transaction.

> **Note**: This endpoint may not be implemented yet. Check router.go for current availability.

#### 🔸 Request Body
```json
{
  "delivery_methods": ["print", "email"],
  "customer_email": "john.doe@example.com",
  "receipt_type": "standard",
  "language": "en"
}
```

#### 🔸 Response (200 OK)
```json
{
  "receipt_id": "RCP001",
  "trans_seq": "20260208-001",
  "delivery_status": {
    "print": {
      "status": "sent_to_printer",
      "printer_id": "PRINTER01",
      "queue_position": 1
    },
    "email": {
      "status": "sent",
      "sent_at": "2026-02-08T14:31:00Z",
      "email_address": "john.doe@example.com"
    }
  },
  "receipt_url": "https://receipts.example.com/RCP001",
  "message": "Receipt generated and sent successfully"
}
```

---

# ✅ Validation Rules

1. **Required Fields**: At minimum, `tenant_id`, `store_id`, `terminal_id`, `trans_seq`, and `biz_date` should be provided for a valid transaction.

2. **Date Format**: All date fields must use `YYYY-MM-DD` format.

3. **DateTime Format**: All datetime fields must be ISO 8601 compliant.

4. **Numeric Precision**: All monetary values (ScaledInt) must be integers representing the amount multiplied by 10,000.

5. **Enum Values**: All enum fields must use exact values as specified in the Enumerations section.

6. **Referential Integrity**: 
   - Return transactions should reference original transaction via `return_ref`
   - Line items in returns should reference original line via `orig_trans_seq`, `orig_line_seq`, etc.

7. **Mathematical Consistency**:
   - `ext_amt` should equal `qty × unit_price`
   - `total` should equal `sub_total + tax_total - disc_total + round_total`

---

# 📊 Analytics & Reporting

## Revenue Metrics
- **Gross Sales** (`sub_total`): Total revenue before deductions
- **Net Sales** (`total`): Revenue after adjustments
- **Tax Total** (`tax_total`): Total tax collected
- **Discount Total** (`disc_total`): Total discounts applied
- **Average Transaction Value**: Total sales ÷ number of transactions
- **Transaction Volume**: Number of transactions per period

## Performance Indicators
- **Transaction Status Distribution**: Breakdown by COMPLETE, CANCEL, SUSPEND, etc.
- **Payment Method Distribution**: Breakdown by tender_id (CASH, CARD, etc.)
- **Peak Hours Analysis**: Busiest transaction periods by `begin_time`
- **Associate Performance**: Sales by employee via `associates` field

## Return Analysis
- **Return Rate**: Percentage of transactions with returns
- **Return Reasons**: Analysis by `return_reason` codes
- **Return Types**: Distribution of BLIND, VERIFIED, UNVERIFIED returns

---

# 🔐 Security & Compliance

## Payment Security
- **PCI DSS Compliance**: All payment data is encrypted and tokenized
- **Secure Tokenization**: Sensitive payment data is never stored
- **Audit Trails**: Complete audit log of all transaction operations

## Data Protection
- **Encryption**: All transaction data encrypted at rest and in transit
- **Access Controls**: Role-based access to transaction data
- **Data Retention**: Configurable data retention policies

## Compliance Features
- **Tax Reporting**: Automated tax calculation via `TaxModifiers`
- **Receipt Requirements**: Compliance with local receipt regulations
- **Void Tracking**: All voids tracked with `is_void` flag and reason
- **Financial Reconciliation**: Daily settlement and reconciliation reports

---

# 🚨 Error Handling

## Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "code": "TRANSACTION_NOT_FOUND",
    "message": "Transaction does not exist",
    "details": {
      "trans_seq": "20260208-999",
      "store_id": "STORE001"
    },
    "request_id": "req_abc123xyz",
    "timestamp": "2026-02-08T15:30:00Z"
  }
}
```

## Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `INVALID_REQUEST` | Request validation failed |
| 400 | `INVALID_DATE_FORMAT` | Date must be YYYY-MM-DD |
| 400 | `INVALID_ENUM_VALUE` | Enum value not recognized |
| 400 | `INVALID_SCALED_INT` | Numeric value out of range |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `TRANSACTION_NOT_FOUND` | Transaction does not exist |
| 409 | `DUPLICATE_TRANSACTION` | Transaction sequence already exists |
| 409 | `TRANSACTION_ALREADY_VOIDED` | Cannot modify voided transaction |
| 409 | `REFUND_LIMIT_EXCEEDED` | Refund exceeds original amount |
| 422 | `VALIDATION_ERROR` | Field validation failed |
| 422 | `MATHEMATICAL_INCONSISTENCY` | Calculated totals don't match |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Server error occurred |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

## Error Handling Examples

### Invalid Date Format
```json
{
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "Date format is invalid",
    "details": {
      "field": "biz_date",
      "value": "02-08-2026",
      "expected_format": "YYYY-MM-DD"
    }
  }
}
```

### Mathematical Inconsistency
```json
{
  "error": {
    "code": "MATHEMATICAL_INCONSISTENCY",
    "message": "Transaction totals do not match calculated values",
    "details": {
      "provided_total": 1500000,
      "calculated_total": 1575000,
      "difference": 75000
    }
  }
}
```

### Invalid Enum Value
```json
{
  "error": {
    "code": "INVALID_ENUM_VALUE",
    "message": "Invalid status value",
    "details": {
      "field": "status",
      "value": "completed",
      "allowed_values": ["COMPLETE", "CANCEL", "NEW", "RESUME", "SUSPEND"]
    }
  }
}
```

## Best Practices for Error Handling

1. **Always Check HTTP Status Codes**: Don't rely solely on response body
2. **Log Request IDs**: Include `request_id` in error logs for troubleshooting
3. **Handle Retry Logic**: Implement exponential backoff for 5xx errors
4. **Validate Before Sending**: Check enum values and date formats client-side
5. **Parse Error Details**: Use `details` object for field-specific errors
6. **Monitor Rate Limits**: Track 429 responses and adjust request frequency

---

# 📄 Pagination

All list endpoints support cursor-based pagination for optimal performance with large datasets.

## Pagination Parameters
- `limit`: Number of records per page (default: 20, max: 100)
- `next`: Pagination token from previous response

## Pagination Response
```json
{
  "transactions": [...],
  "pagination": {
    "next_token": "eyJsYXN0X2V2YWx1YXRlZF9rZXki...",
    "has_more": true,
    "total_count": 145
  }
}
```

## Example Pagination Flow
```bash
# First request
GET /v0/store/STORE001/transaction?limit=20

# Subsequent request using next_token
GET /v0/store/STORE001/transaction?limit=20&next=eyJsYXN0...
```

---

# ⏱️ Rate Limiting

## Rate Limit Policy
- **Standard Tier**: 100 requests per minute per tenant
- **Premium Tier**: 500 requests per minute per tenant
- **Enterprise Tier**: Custom limits negotiable

## Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1675872000
```

## Exceeding Rate Limits
When rate limit is exceeded, the API returns:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "retry_after_seconds": 30
    }
  }
}
```

**HTTP Status**: `429 Too Many Requests`

---

# 🔄 Integration Features

## POS Integration
- **Real-time Processing**: Immediate transaction processing
- **Offline Mode**: Continue operations during network outages
- **Multi-Terminal**: Support for multiple POS terminals via `terminal_id`
- **Hardware Integration**: Compatible with receipt printers, cash drawers

## External Systems
- **External Orders**: Support via `ext_order_id` and `ext_order_src` fields
- **Accounting Software**: Export transactions for reconciliation
- **Inventory Management**: Real-time stock level updates based on line items

## Webhooks & Events
Available webhook events for real-time notifications:
- `transaction.created`: New transaction created
- `transaction.completed`: Transaction marked COMPLETE
- `transaction.voided`: Transaction voided (`is_void` = true)
- `transaction.refunded`: Refund processed
- `transaction.updated`: Transaction data updated

### Webhook Payload Example
```json
{
  "event": "transaction.completed",
  "timestamp": "2026-02-08T10:35:00Z",
  "data": {
    "tenant_id": "TENANT001",
    "store_id": "STORE001",
    "trans_seq": "20260208-001",
    "total": 262500,
    "status": "COMPLETE"
  },
  "signature": "sha256=..."
}
```

---

# 📚 Support

For questions or clarifications about this API, please contact:
- Technical Support: support@example.com
- API Documentation: https://api.example.com/docs

---

**Document Revision History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-08 | System | Initial release - aligned with Transaction API Contract v1.0 |
