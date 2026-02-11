# 📦 POS Hardware Devices API

This API provides endpoints to manage **POS hardware devices** such as receipt printers, barcode scanners, cash drawers, scales, payment terminals, and customer displays.

---

## 📋 Overview

### Base URL
```
/v0/store/{storeId}/config/hardware
```

### Authentication
- Tenant ID is extracted from the JWT token (Authorization header)
- No tenant_id in the URL path

### Supported Device Types

| Type | Value | Description |
|------|-------|-------------|
| Printer | `printer` | Receipt printers, thermal printers, kitchen printers, label printers |
| Scanner | `scanner` | Barcode scanners |
| Cash Drawer | `cash_drawer` | Cash drawers |
| Scale | `scale` | Weighing scales |
| Payment Terminal | `payment_terminal` | Card payment terminals |
| Display | `display` | Customer-facing displays, KDS screens |

### Supported Connection Types

| Connection | Value | Description |
|------------|-------|-------------|
| USB | `usb` | USB connected devices |
| Network | `network` | TCP/IP network connected devices |
| Bluetooth | `bluetooth` | Bluetooth connected devices |

### Supported Device Roles

| Role | Value | Applicable Device Types | Description |
|------|-------|------------------------|-------------|
| Main Printer | `main_printer` | `printer` | Primary receipt printer used to print customer transaction receipts. |
| Backup Printer | `backup_printer` | `printer` | Secondary receipt printer used when the main printer is unavailable. |
| Kitchen Printer | `kitchen_printer` | `printer` | Printer used to print kitchen order tickets for food preparation. |
| Cash Drawer | `cashdrawer` | `cash_drawer` | Physical drawer used to securely store and dispense cash during transactions. |
| Scanner | `scanner` | `scanner` | Device used to scan barcodes or QR codes for item and payment identification. |
| KDS | `kds` | `display` | Kitchen display system used to show and manage orders digitally in real time. |

---

## 🧾 Device Entity Schema

### HardwareDevice Structure

```json
{
  "id": "string (required - UUID or custom ID)",
  "name": "string (optional)",
  "type": "printer | scanner | cash_drawer | scale | payment_terminal | display",
  "role": "main_printer | backup_printer | kitchen_printer | cashdrawer | scanner | kds (optional)",
  "connection_type": "usb | network | bluetooth",
  "terminal_id": "string (optional - links device to specific terminal)",
  "enabled": true,
  
  "network_config": { },
  "bluetooth_config": { },
  "usb_config": { },
  
  "printer_config": { },
  "scanner_config": { },
  "payment_config": { },
  "scale_config": { },
  "drawer_config": { },
  "display_config": { }
}
```

### Connection Configs

#### Network Config (for `connection_type: "network"`)
```json
{
  "ip_address": "192.168.1.100",
  "port": 9100
}
```

#### Bluetooth Config (for `connection_type: "bluetooth"`)
```json
{
  "mac_address": "00:11:22:33:44:55",
  "device_name": "Star TSP143",
  "service_uuid": "00001101-0000-1000-8000-00805F9B34FB"
}
```

#### USB Config (for `connection_type: "usb"`)
```json
{
  "vendor_id": 1234,
  "product_id": 5678,
  "usb_path": "/dev/usb/lp0"
}
```

### Device-Specific Configs

#### Printer Config (for `type: "printer"`)

Unified config for all printer types: thermal, label, and document printers.

| Field | Type | Description |
|-------|------|-------------|
| `mode` | string | Printer mode: `thermal`, `label`, `document` |
| `paper` | string | Paper size: `80mm`, `58mm`, `a4`, `a5`, `letter`, `4x6` |
| `width` | int | Custom label width in mm |
| `height` | int | Custom label height in mm |
| `auto` | bool | Auto-print when document ready |
| `copies` | int | Number of copies |
| `encoding` | string | Character encoding: `utf8`, `gbk` |
| `cut` | bool | Auto-cut paper (thermal) |
| `drawer` | bool | Open cash drawer after print (thermal) |
| `kitchens` | []string | Kitchen sections for KOT routing |
| `zpl` | bool | Supports ZPL commands (label) |

**Thermal Receipt Printer:**
```json
{
  "mode": "thermal",
  "paper": "80mm",
  "auto": true,
  "copies": 1,
  "cut": true,
  "drawer": true,
  "encoding": "utf8"
}
```

**Kitchen Printer:**
```json
{
  "mode": "thermal",
  "paper": "80mm",
  "cut": true,
  "kitchens": ["grill", "fryer", "salad"]
}
```

**Label Printer (standard size):**
```json
{
  "mode": "label",
  "paper": "4x6",
  "zpl": true
}
```

**Label Printer (custom size):**
```json
{
  "mode": "label",
  "width": 50,
  "height": 25,
  "zpl": true
}
```

**Document Printer (A4):**
```json
{
  "mode": "document",
  "paper": "a4",
  "copies": 2
}
```

#### Scanner Config (for `type: "scanner"`)
```json
{
  "prefix": "",
  "suffix": "\r\n",
  "beep_on_scan": true
}
```

#### Payment Config (for `type: "payment_terminal"`)
```json
{
  "provider": "stripe",
  "sandbox_mode": false
}
```

#### Scale Config (for `type: "scale"`)
```json
{
  "unit": "kg",
  "decimal_places": 2
}
```

#### Drawer Config (for `type: "cash_drawer"`)
```json
{
  "open_command": "ESC p 0 50 250"
}
```

#### Display Config (for `type: "display"`)
```json
{
  "line_count": 2,
  "chars_per_line": 20
}
```

---

## 🔹 API Endpoints

### Create Hardware Device
`POST /v0/store/{storeId}/config/hardware`

### Get All Hardware Devices  
`GET /v0/store/{storeId}/config/hardware`

### Get Hardware Device by ID
`GET /v0/store/{storeId}/config/hardware/{hardwareId}`

### Update Hardware Device
`PUT /v0/store/{storeId}/config/hardware/{hardwareId}`

### Delete Hardware Device
`DELETE /v0/store/{storeId}/config/hardware/{hardwareId}`

---

## 📝 Create Hardware Examples

### 1️⃣ Create Receipt Printer (Network)

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "receipt_printer_001",
  "name": "Main Receipt Printer",
  "type": "printer",
  "role": "main_printer",
  "connection_type": "network",
  "terminal_id": "terminal_001",
  "enabled": true,
  "network_config": {
    "ip_address": "192.168.1.100",
    "port": 9100
  },
  "printer_config": {
    "mode": "thermal",
    "paper": "80mm",
    "auto": true,
    "copies": 1,
    "cut": true,
    "drawer": true,
    "encoding": "utf8"
  }
}
```

**Response:**
```json
{
  "id": "receipt_printer_001",
  "name": "Main Receipt Printer",
  "type": "printer",
  "role": "main_printer",
  "connection_type": "network",
  "terminal_id": "terminal_001",
  "enabled": true,
  "network_config": {
    "ip_address": "192.168.1.100",
    "port": 9100
  },
  "printer_config": {
    "mode": "thermal",
    "paper": "80mm",
    "auto": true,
    "copies": 1,
    "cut": true,
    "drawer": true,
    "encoding": "utf8"
  },
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

---

### 2️⃣ Create Kitchen Printer (Network)

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "kitchen_printer_001",
  "name": "Hot Kitchen Printer",
  "type": "printer",
  "role": "kitchen_printer",
  "connection_type": "network",
  "enabled": true,
  "network_config": {
    "ip_address": "192.168.1.101",
    "port": 9100
  },
  "printer_config": {
    "mode": "thermal",
    "paper": "80mm",
    "auto": true,
    "copies": 1,
    "cut": true,
    "encoding": "utf8",
    "kitchens": ["hot_kitchen", "grill", "fryer"]
  }
}
```

---

### 3️⃣ Create Label Printer (USB)

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "label_printer_001",
  "name": "Product Label Printer",
  "type": "printer",
  "connection_type": "usb",
  "enabled": true,
  "usb_config": {
    "vendor_id": 1234,
    "product_id": 5678,
    "usb_path": "/dev/usb/lp0"
  },
  "printer_config": {
    "mode": "label",
    "width": 50,
    "height": 25,
    "zpl": true
  }
}
```

---

### 4️⃣ Create Barcode Scanner (USB)

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "scanner_001",
  "name": "Main Barcode Scanner",
  "type": "scanner",
  "role": "scanner",
  "connection_type": "usb",
  "terminal_id": "terminal_001",
  "enabled": true,
  "usb_config": {
    "vendor_id": 1504,
    "product_id": 4608
  },
  "scanner_config": {
    "prefix": "",
    "suffix": "\r\n",
    "beep_on_scan": true
  }
}
```

---

### 5️⃣ Create Barcode Scanner (Bluetooth)

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "scanner_bt_001",
  "name": "Wireless Barcode Scanner",
  "type": "scanner",
  "role": "scanner",
  "connection_type": "bluetooth",
  "terminal_id": "terminal_001",
  "enabled": true,
  "bluetooth_config": {
    "mac_address": "00:11:22:33:44:55",
    "device_name": "Socket Mobile S700"
  },
  "scanner_config": {
    "prefix": "",
    "suffix": "\r\n",
    "beep_on_scan": true
  }
}
```

---

### 6️⃣ Create Cash Drawer (Network - connected via printer)

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "drawer_001",
  "name": "Main Cash Drawer",
  "type": "cash_drawer",
  "role": "cashdrawer",
  "connection_type": "network",
  "terminal_id": "terminal_001",
  "enabled": true,
  "network_config": {
    "ip_address": "192.168.1.100",
    "port": 9100
  },
  "drawer_config": {
    "open_command": "ESC p 0 50 250"
  }
}
```

---

### 7️⃣ Create Cash Drawer (USB)

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "drawer_usb_001",
  "name": "USB Cash Drawer",
  "type": "cash_drawer",
  "role": "cashdrawer",
  "connection_type": "usb",
  "terminal_id": "terminal_001",
  "enabled": true,
  "usb_config": {
    "vendor_id": 1234,
    "product_id": 5678
  },
  "drawer_config": {
    "open_command": "ESC p 0 50 250"
  }
}
```

---

### 8️⃣ Create Weighing Scale (USB)

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "scale_001",
  "name": "Produce Scale",
  "type": "scale",
  "connection_type": "usb",
  "terminal_id": "terminal_001",
  "enabled": true,
  "usb_config": {
    "vendor_id": 2341,
    "product_id": 8901
  },
  "scale_config": {
    "unit": "kg",
    "decimal_places": 3
  }
}
```

---

### 9️⃣ Create Weighing Scale (Network)

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "scale_net_001",
  "name": "Network Scale",
  "type": "scale",
  "connection_type": "network",
  "enabled": true,
  "network_config": {
    "ip_address": "192.168.1.110",
    "port": 8080
  },
  "scale_config": {
    "unit": "lb",
    "decimal_places": 2
  }
}
```

---

### 🔟 Create Payment Terminal (Network)

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "payment_001",
  "name": "Card Payment Terminal",
  "type": "payment_terminal",
  "connection_type": "network",
  "terminal_id": "terminal_001",
  "enabled": true,
  "network_config": {
    "ip_address": "192.168.1.120",
    "port": 8443
  },
  "payment_config": {
    "provider": "stripe",
    "sandbox_mode": false
  }
}
```

---

### 1️⃣1️⃣ Create Payment Terminal (Bluetooth)

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "payment_bt_001",
  "name": "Mobile Card Reader",
  "type": "payment_terminal",
  "connection_type": "bluetooth",
  "terminal_id": "terminal_001",
  "enabled": true,
  "bluetooth_config": {
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "device_name": "Stripe Reader M2"
  },
  "payment_config": {
    "provider": "stripe",
    "sandbox_mode": true
  }
}
```

---

### 1️⃣2️⃣ Create Customer Display (USB)

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "display_001",
  "name": "Customer Facing Display",
  "type": "display",
  "connection_type": "usb",
  "terminal_id": "terminal_001",
  "enabled": true,
  "usb_config": {
    "vendor_id": 5678,
    "product_id": 1234
  },
  "display_config": {
    "line_count": 2,
    "chars_per_line": 20
  }
}
```

---

### 1️⃣3️⃣ Create KDS Display (Network)

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "kds_001",
  "name": "Kitchen Display System",
  "type": "display",
  "role": "kds",
  "connection_type": "network",
  "enabled": true,
  "network_config": {
    "ip_address": "192.168.1.130",
    "port": 8080
  },
  "display_config": {
    "line_count": 10,
    "chars_per_line": 40
  }
}
```

---

### 1️⃣4️⃣ Create Bluetooth Receipt Printer

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "bt_printer_001",
  "name": "Mobile Receipt Printer",
  "type": "printer",
  "role": "backup_printer",
  "connection_type": "bluetooth",
  "terminal_id": "terminal_001",
  "enabled": true,
  "bluetooth_config": {
    "mac_address": "11:22:33:44:55:66",
    "device_name": "Star SM-L200",
    "service_uuid": "00001101-0000-1000-8000-00805F9B34FB"
  },
  "printer_config": {
    "mode": "thermal",
    "paper": "58mm",
    "auto": true,
    "copies": 1,
    "cut": false,
    "encoding": "utf8"
  }
}
```

---

### 1️⃣5️⃣ Create Document Printer (Network - A4)

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "doc_printer_001",
  "name": "Office Document Printer",
  "type": "printer",
  "connection_type": "network",
  "enabled": true,
  "network_config": {
    "ip_address": "192.168.1.150",
    "port": 9100
  },
  "printer_config": {
    "mode": "document",
    "paper": "a4",
    "copies": 1
  }
}
```

---

### 1️⃣6️⃣ Create Shipping Label Printer (Network - 4x6)

```json
POST /v0/store/{storeId}/config/hardware

{
  "id": "shipping_label_001",
  "name": "Shipping Label Printer",
  "type": "printer",
  "connection_type": "network",
  "enabled": true,
  "network_config": {
    "ip_address": "192.168.1.160",
    "port": 9100
  },
  "printer_config": {
    "mode": "label",
    "paper": "4x6",
    "zpl": true
  }
}
```

---

## 🔹 Get All Hardware Devices

### `GET /v0/store/{storeId}/config/hardware`

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `terminal_id` | string | Filter by terminal ID |
| `type` | string | Filter by device type |
| `limit` | int | Number of results per page (default: 10) |
| `next` | string | Pagination token for next page |

#### Example Request
```
GET /v0/store/store_001/config/hardware?type=printer&limit=10
```

#### Response

```json
{
  "hardware": [
    {
      "id": "receipt_printer_001",
      "name": "Main Receipt Printer",
      "type": "printer",
      "role": "main_printer",
      "connection_type": "network",
      "terminal_id": "terminal_001",
      "enabled": true,
      "network_config": {
        "ip_address": "192.168.1.100",
        "port": 9100
      },
      "printer_config": {
        "mode": "thermal",
        "paper": "80mm",
        "auto": true,
        "copies": 1,
        "cut": true,
        "drawer": true,
        "encoding": "utf8"
      },
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": "kitchen_printer_001",
      "name": "Hot Kitchen Printer",
      "type": "printer",
      "role": "kitchen_printer",
      "connection_type": "network",
      "enabled": true,
      "network_config": {
        "ip_address": "192.168.1.101",
        "port": 9100
      },
      "printer_config": {
        "mode": "thermal",
        "paper": "80mm",
        "auto": true,
        "copies": 1,
        "cut": true,
        "encoding": "utf8",
        "kitchens": ["hot_kitchen", "grill", "fryer"]
      },
      "created_at": "2025-01-15T10:25:00Z",
      "updated_at": "2025-01-15T10:25:00Z"
    }
  ],
  "next": "eyJsYXN0X2V2YWx1YXRlZF9rZXki..."
}
```

---

## 🔹 Get Hardware Device by ID

### `GET /v0/store/{storeId}/config/hardware/{hardwareId}`

#### Response

```json
{
  "id": "receipt_printer_001",
  "name": "Main Receipt Printer",
  "type": "printer",
  "role": "main_printer",
  "connection_type": "network",
  "terminal_id": "terminal_001",
  "enabled": true,
  "network_config": {
    "ip_address": "192.168.1.100",
    "port": 9100
  },
  "printer_config": {
    "mode": "thermal",
    "paper": "80mm",
    "auto": true,
    "copies": 1,
    "cut": true,
    "drawer": true,
    "encoding": "utf8"
  },
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

---

## 🔹 Update Hardware Device

### `PUT /v0/store/{storeId}/config/hardware/{hardwareId}`

Supports **partial updates** - only include fields you want to change.

#### Example: Update printer IP address

```json
PUT /v0/store/{storeId}/config/hardware/receipt_printer_001

{
  "network_config": {
    "ip_address": "192.168.1.200"
  }
}
```

#### Example: Disable device

```json
PUT /v0/store/{storeId}/config/hardware/receipt_printer_001

{
  "enabled": false
}
```

#### Example: Update printer settings

```json
PUT /v0/store/{storeId}/config/hardware/receipt_printer_001

{
  "name": "Updated Printer Name",
  "printer_config": {
    "copies": 2,
    "auto": false
  }
}
```

#### Example: Change connection type (from network to USB)

```json
PUT /v0/store/{storeId}/config/hardware/receipt_printer_001

{
  "connection_type": "usb",
  "network_config": null,
  "usb_config": {
    "vendor_id": 1234,
    "product_id": 5678
  }
}
```

#### Response

```json
{
  "message": "Device updated successfully"
}
```

---

## 🔹 Delete Hardware Device

### `DELETE /v0/store/{storeId}/config/hardware/{hardwareId}`

#### Response

```json
{
  "message": "Device deleted successfully"
}
```

---

## ⚠️ Validation Rules

### Required Fields
- `id` - Unique identifier for the device
- `type` - Device type (printer, scanner, cash_drawer, scale, payment_terminal, display)
- `connection_type` - Connection method (usb, network, bluetooth)

### Optional Fields
- `role` - Device role (main_printer, backup_printer, kitchen_printer, cashdrawer, scanner, kds). Role must be compatible with device type.

### Role Validation Rules
- Role must match the device type:
  - `main_printer`, `backup_printer`, `kitchen_printer` → only for `type: "printer"`
  - `cashdrawer` → only for `type: "cash_drawer"`
  - `scanner` → only for `type: "scanner"`
  - `kds` → only for `type: "display"`

### Connection Config Rules
- **Exactly one** connection config must be provided matching the `connection_type`:
  - `connection_type: "network"` → requires `network_config`
  - `connection_type: "bluetooth"` → requires `bluetooth_config`
  - `connection_type: "usb"` → requires `usb_config`

### Device Config Rules
- **Exactly one** device config must be provided matching the `type`:
  - `type: "printer"` → requires `printer_config`
  - `type: "scanner"` → requires `scanner_config`
  - `type: "cash_drawer"` → requires `drawer_config`
  - `type: "scale"` → requires `scale_config`
  - `type: "payment_terminal"` → requires `payment_config`
  - `type: "display"` → requires `display_config`

### Printer Mode Values
- `thermal` - ESC/POS thermal receipt printers, kitchen printers
- `label` - Label/barcode printers (ZPL, etc.)
- `document` - Document printers (A4, A5, Letter)

### Default Values
- `enabled` defaults to `true` if not provided

---

## ❌ Error Responses

### 400 Bad Request - Validation Error

```json
{
  "code": "VALIDATION_ERROR",
  "message": "connection_type is 'network' but network_config is not provided"
}
```

### 400 Bad Request - Missing Device Config

```json
{
  "code": "VALIDATION_ERROR",
  "message": "printer_config is required for printer device type"
}
```

### 400 Bad Request - Multiple Connection Configs

```json
{
  "code": "VALIDATION_ERROR", 
  "message": "only one connection config should be provided matching connection_type"
}
```

### 404 Not Found

```json
{
  "code": "NOT_FOUND",
  "message": "Hardware device not found"
}
```

### 409 Conflict - Duplicate ID

```json
{
  "code": "CONFLICT",
  "message": "Hardware device with ID already exists"
}
```

---

## 🔐 Notes

- Devices are scoped to a **store** (`storeId` in path)
- Devices can optionally be linked to a specific **terminal** (`terminal_id`)
- All timestamps are in **ISO 8601** format
- Pagination uses cursor-based tokens via `next` field (null means no more pages)
- Empty arrays return `[]` instead of `null`
- For **printers** with `kitchens` array, the device acts as a kitchen printer routing orders to specified sections
- Printer `mode` determines the printer type: `thermal`, `label`, or `document`
