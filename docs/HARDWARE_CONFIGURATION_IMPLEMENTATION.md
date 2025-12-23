# Hardware Configuration System - Implementation Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Type System](#type-system)
- [Components](#components)
- [API Integration](#api-integration)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Hardware Configuration System provides a comprehensive solution for managing point-of-sale hardware devices at both store and terminal levels. The system supports 8 device types with 5 connection methods, featuring dynamic form generation, real-time validation, and hierarchical configuration management.

### Key Features
- ✅ **8 Device Types**: Thermal Printer, KOT Printer, Network Printer, Barcode Scanner, Payment Terminal, Scale, Cash Drawer, Label Printer
- ✅ **5 Connection Types**: Network, Bluetooth, USB, Serial, AIDL
- ✅ **Dual-Level Configuration**: Store-level (shared) and Terminal-level (specific)
- ✅ **Dynamic Forms**: Device-specific and connection-specific configuration forms
- ✅ **Real-time Validation**: Client-side validation with server-side error handling
- ✅ **Advanced Filtering**: Filter by type, status, connection, with search capability
- ✅ **Device Testing**: Built-in test functionality for hardware verification
- ✅ **Global Error Handling**: Integrated with app-wide error framework

### Technical Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **State Management**: Local state (useState) + Zustand (tenant context)
- **API Client**: Axios with automatic auth/tenant injection
- **Validation**: Client-side + server-side error parsing
- **Icons**: Heroicons 24

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Hardware Configuration UI                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │       HardwareConfigurationTab (Container)          │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  • Dual-level tabs (Store / Terminal)               │   │
│  │  • Device listing with filtering & search           │   │
│  │  • Add/Edit/Delete/Test device actions              │   │
│  └───────────────┬─────────────────────────────────────┘   │
│                  │                                           │
│     ┌────────────┴────────────┬────────────────────┐       │
│     │                          │                     │       │
│     ▼                          ▼                     ▼       │
│  ┌──────────┐         ┌──────────────┐      ┌─────────┐   │
│  │  Device  │         │    Device     │      │ Filter  │   │
│  │   Card   │         │     Form      │      │  Panel  │   │
│  └──────────┘         └───────┬───────┘      └─────────┘   │
│                               │                              │
│              ┌────────────────┼────────────────┐           │
│              │                 │                 │           │
│              ▼                 ▼                 ▼           │
│       ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │
│       │ Connection  │  │   Device     │  │ Capabilities │  │
│       │   Configs   │  │   Configs    │  │    Config    │  │
│       │  (5 types)  │  │  (8 types)   │  │              │  │
│       └─────────────┘  └─────────────┘  └──────────────┘  │
│                                                               │
└───────────────────────────┬───────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Service Layer                          │
├─────────────────────────────────────────────────────────────┤
│  • hardwareApiService.ts - CRUD operations                   │
│  • Automatic tenant/auth header injection                    │
│  • Error parsing and transformation                          │
└───────────────────────────┬───────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                              │
├─────────────────────────────────────────────────────────────┤
│  • Go-based REST API                                         │
│  • Tenant-scoped endpoints                                   │
│  • Store and Terminal level separation                       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → Component State Update → Validation
                                          │
                                          ▼
                                      Valid? ──No──→ Show Errors
                                          │
                                         Yes
                                          │
                                          ▼
                              API Call (hardwareApiService)
                                          │
                                          ▼
                              Backend Processing
                                          │
                         ┌────────────────┴────────────────┐
                         │                                  │
                    Success                              Error
                         │                                  │
                         ▼                                  ▼
              Update Local State                Parse Error Response
              Show Success Toast                 Show Error Toast/Alert
              Close Form                         Keep Form Open
```

---

## Type System

### Core Types

The type system bridges Go backend naming conventions with React component expectations using **UI compatibility aliases**.

#### HardwareDevice Interface

```typescript
// Primary interface (Go backend structure)
export interface HardwareDevice {
  // Core identification
  id: string;
  name: string;
  type: DeviceType;                    // 'printer' | 'scanner' | ...
  subtype?: DeviceSubType;             // 'thermal_printer' | 'barcode_scanner' | ...
  
  // Hardware details
  model?: string;
  vendor: string;
  serial_number?: string;
  firmware?: string;
  
  // Status and metadata
  enabled: boolean;
  status: DeviceStatus;                // 'connected' | 'disconnected' | 'degraded' | 'error'
  location?: string;
  notes?: string;
  last_online?: string;
  
  // Configuration
  connection_type: ConnectionType;     // 'network' | 'bluetooth' | 'usb' | ...
  network_config?: NetworkConfig;
  bluetooth_config?: BluetoothConfig;
  usb_config?: USBConfig;
  serial_config?: SerialConfig;
  aidl_config?: AIDLConfig;
  
  // Device-specific configurations
  thermal_config?: ThermalConfig;
  kot_config?: KotConfig;
  network_printer_config?: NetworkPrinterConfig;
  barcode_scanner_config?: BarcodeScannerConfig;
  payment_terminal_config?: PaymentTerminalConfig;
  scale_config?: ScaleConfig;
  cash_drawer_config?: CashDrawerConfig;
  label_printer_config?: LabelPrinterConfig;
  
  // Capabilities
  capabilities: Capabilities;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  
  // --- UI COMPATIBILITY ALIASES ---
  // These aliases allow components to use either naming convention
  device_id?: string;                  // Alias for 'id'
  device_type?: DeviceType;            // Alias for 'type'
  manufacturer?: string;               // Alias for 'vendor'
  firmware_version?: string;           // Alias for 'firmware'
  description?: string;                // Alias for 'notes'
  connection_config?: any;             // Generic connection config
  device_config?: any;                 // Generic device config
}
```

#### DeviceType & Status

```typescript
// Extended to include both parent types and specific subtypes
export type DeviceType = 
  // Original parent types
  | 'printer' 
  | 'scanner' 
  | 'cash_drawer' 
  | 'label_printer' 
  | 'scale' 
  | 'payment_terminal' 
  | 'kds' 
  | 'customer_display'
  // UI compatibility aliases (specific subtypes)
  | 'thermal_printer' 
  | 'kot_printer' 
  | 'network_printer' 
  | 'barcode_scanner';

export type DeviceStatus = 
  | 'connected'      // Device is online and functioning
  | 'disconnected'   // Device is offline
  | 'degraded'       // Device is partially functioning
  | 'error';         // Device has errors

export type ConnectionType = 
  | 'network' 
  | 'bluetooth' 
  | 'usb' 
  | 'serial' 
  | 'aidl' 
  | 'bluetooth_le' 
  | 'http' 
  | 'websocket';
```

#### Connection Configurations

```typescript
// Network Connection
export interface NetworkConfig {
  ip_address: string;
  port: number;
  protocol: 'tcp' | 'udp' | 'http' | 'https' | 'raw_socket';
  timeout?: number;
  ssl_enabled?: boolean;
}

// Bluetooth Connection
export interface BluetoothConfig {
  device_name: string;
  device_address?: string;
  pairing_pin?: string;
  auto_reconnect?: boolean;
}

// USB Connection
export interface USBConfig {
  vendor_id: number;
  product_id: number;
  interface_number?: number;
  endpoint?: number;
}

// Serial Connection
export interface SerialConfig {
  port: string;
  baud_rate: 9600 | 19200 | 38400 | 57600 | 115200;
  data_bits: 7 | 8;
  parity: 'none' | 'even' | 'odd';
  stop_bits: 1 | 1.5 | 2;
  flow_control?: 'none' | 'hardware' | 'software';
}

// AIDL Connection (Android)
export interface AIDLConfig {
  package_name: string;
  service_name: string;
  action?: string;
}
```

#### Device-Specific Configurations

```typescript
// Thermal Printer
export interface ThermalConfig {
  printer_model: string;
  paper_size: 'thermal_58mm' | 'thermal_80mm';
  auto_print: boolean;
  print_copies: number;
  cut_paper: boolean;
  open_drawer: boolean;
  drawer_kick_pulse: number;
  character_encoding: 'utf8' | 'ascii' | 'windows1252';
}

// KOT Printer (Kitchen Order Ticket)
export interface KotConfig {
  kitchen_section: 'grill' | 'fryer' | 'salad' | 'dessert' | 'bar' | 'all';
  item_filters?: string[];          // Item IDs to print
  category_filters?: string[];       // Category IDs to print
  auto_print_delay: number;          // Seconds
  consolidate_items: boolean;
  show_modifiers: boolean;
  show_customer_name: boolean;
}

// Barcode Scanner
export interface BarcodeScannerConfig {
  scanner_model: string;
  prefix?: string;
  suffix?: string;
  min_length?: number;
  max_length?: number;
  scan_mode: 'continuous' | 'trigger' | 'auto';
  beep_on_scan: boolean;
  decode_types: BarcodeDecodeType[];
}

// Payment Terminal
export interface PaymentTerminalConfig {
  terminal_id: string;
  merchant_id: string;
  supported_payment_methods: ('credit' | 'debit' | 'contactless' | 'mobile_wallet')[];
  emv_enabled: boolean;
  contactless_enabled: boolean;
  pin_bypass_limit?: number;
  tip_enabled: boolean;
}

// Scale
export interface ScaleConfig {
  unit: 'kg' | 'lb' | 'oz' | 'g';
  precision: number;                 // Decimal places
  tare_weight?: number;
  auto_zero: boolean;
  stabilization_time: number;        // Milliseconds
}
```

#### Capabilities

```typescript
export interface Capabilities {
  can_print: boolean;
  can_scan: boolean;
  can_accept_payment: boolean;
  can_weigh: boolean;
  can_open_drawer: boolean;
  can_display: boolean;
  supports_color?: boolean;
  supports_graphics?: boolean;
  max_paper_width?: number;         // mm
  max_print_speed?: number;         // mm/sec
}
```

---

## Components

### 1. HardwareConfigurationTab (Container)

**Location**: `src/components/hardware/HardwareConfigurationTab.tsx`

Main container component managing the entire hardware configuration interface.

#### Props
```typescript
interface HardwareConfigurationTabProps {
  settings: any;
  onFieldChange: () => void;
}
```

#### Features
- Dual-level tabs (Store Level / Terminal Level)
- Device listing with cards
- Filter panel with 3 filter types + search
- Add/Edit/Delete/Test device operations
- Terminal dropdown (for terminal level)
- Empty states for no devices / no terminal selected

#### State Management
```typescript
const [hardwareConfig, setHardwareConfig] = useState<CombinedHardwareConfig | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [activeLevel, setActiveLevel] = useState<'store' | 'terminal'>('store');
const [selectedTerminalId, setSelectedTerminalId] = useState<string>('');
const [showDeviceForm, setShowDeviceForm] = useState(false);
const [editingDevice, setEditingDevice] = useState<HardwareDevice | null>(null);
const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
const [errors, setErrors] = useState<Record<string, string>>({});
const [filters, setFilters] = useState<DeviceFilters>({
  deviceTypes: [],
  statuses: [],
  connectionTypes: [],
  searchTerm: ''
});
```

#### Usage Example
```tsx
import { HardwareConfigurationTab } from '../components/hardware/HardwareConfigurationTab';

<HardwareConfigurationTab
  settings={{}}
  onFieldChange={() => {}}
/>
```

---

### 2. HardwareDeviceCard (Display)

**Location**: `src/components/hardware/HardwareDeviceCard.tsx`

Card component for displaying individual hardware devices.

#### Props
```typescript
interface HardwareDeviceCardProps {
  device: HardwareDevice;
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
  className?: string;
}
```

#### Features
- Device icon with type-based coloring
- Status badge (Connected/Disconnected/Degraded/Error)
- Connection type badge with icon
- Capabilities badges (Print/Scan/Payment/Weigh/Drawer)
- Device details (Model, Manufacturer, Serial)
- Connection details (IP address for network, etc.)
- Action buttons (Edit/Test/Delete)

#### Visual Elements
```tsx
// Status badge colors
connected    → Green (bg-green-100, text-green-700)
disconnected → Red (bg-red-100, text-red-700)
degraded     → Yellow (bg-yellow-100, text-yellow-700)
error        → Red (bg-red-100, text-red-700)

// Device type icons
Thermal Printer  → 🧾
KOT Printer      → 👨‍🍳
Network Printer  → 🖨️
Barcode Scanner  → 📊
Payment Terminal → 💳
Scale            → ⚖️
Cash Drawer      → 🗃️
Label Printer    → 🏷️

// Connection type icons
Network    → 🌐
Bluetooth  → 📱
USB        → 🔌
Serial     → 🖥️
AIDL       → 🤖
```

#### Usage Example
```tsx
<HardwareDeviceCard
  device={device}
  onEdit={() => handleEdit(device)}
  onDelete={() => handleDelete(device.id)}
  onTest={() => handleTest(device)}
/>
```

---

### 3. HardwareDeviceForm (Modal Form)

**Location**: `src/components/hardware/HardwareDeviceForm.tsx`

Comprehensive modal form for creating and editing hardware devices.

#### Props
```typescript
interface HardwareDeviceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: HardwareDevice) => void;
  device?: HardwareDevice | null;
  mode: 'create' | 'edit';
  level: 'store' | 'terminal';
  terminalId?: string;
}
```

#### Form Sections
1. **Terminal Assignment** (Terminal level only)
2. **Basic Information**
   - Device Name
   - Device Type (dropdown with 8 types)
   - Device Subtype (conditional, based on type)
   - Status (dropdown: Connected/Disconnected/Degraded/Error)
   - Enabled toggle
3. **Hardware Details**
   - Model
   - Manufacturer
   - Serial Number
   - Firmware Version
4. **Connection Configuration** (Dynamic based on connection type)
   - Network, Bluetooth, USB, Serial, or AIDL forms
5. **Device Configuration** (Dynamic based on device type)
   - Thermal Printer, KOT Printer, Scanner, etc. configs
6. **Capabilities** (Checkboxes)
   - Can Print, Can Scan, Can Accept Payment, Can Weigh, Can Open Drawer

#### Validation Rules
```typescript
// Required fields
- device_name: Must not be empty
- device_type: Must be selected
- connection_type: Must be selected
- terminal_id: Required for terminal level

// Connection-specific validation
Network:
  - ip_address: Valid IP format (xxx.xxx.xxx.xxx)
  - port: Integer, 1-65535

USB:
  - vendor_id: Integer
  - product_id: Integer

Serial:
  - port: Not empty
  - baud_rate: One of predefined values

// Device-specific validation
Thermal Printer:
  - paper_size: Must be selected
  - print_copies: Integer, >= 1

Barcode Scanner:
  - decode_types: At least one selected
```

#### Dynamic Form Rendering
```typescript
// Connection config form selection
const renderConnectionConfig = () => {
  switch (formData.connection_type) {
    case 'network':
      return <NetworkConfigForm {...props} />;
    case 'bluetooth':
      return <BluetoothConfigForm {...props} />;
    case 'usb':
      return <USBConfigForm {...props} />;
    case 'serial':
      return <SerialConfigForm {...props} />;
    case 'aidl':
      return <AIDLConfigForm {...props} />;
  }
};

// Device config form selection
const renderDeviceConfig = () => {
  switch (formData.device_type) {
    case 'thermal_printer':
      return <ThermalPrinterConfig {...props} />;
    case 'kot_printer':
      return <KotPrinterConfig {...props} />;
    // ... other device types
  }
};
```

#### Usage Example
```tsx
<HardwareDeviceForm
  isOpen={showDeviceForm}
  onClose={() => setShowDeviceForm(false)}
  onSave={handleSaveDevice}
  device={editingDevice}
  mode={formMode}
  level={activeLevel}
  terminalId={selectedTerminalId}
/>
```

---

### 4. Connection Config Forms

Five specialized forms for different connection types, each with type-specific fields.

#### NetworkConfigForm
**Props**: `{ config: NetworkConfig; onFieldChange: (field, value) => void; errors: Record<string, string> }`

**Fields**:
- IP Address (validated format)
- Port (1-65535)
- Protocol (dropdown: TCP/UDP/HTTP/HTTPS/Raw Socket)
- Timeout (optional)
- SSL Enabled (toggle)

#### BluetoothConfigForm
**Props**: `{ config: BluetoothConfig; onChange: (config) => void; errors }`

**Fields**:
- Device Name
- Device Address (optional)
- Pairing PIN (optional)
- Auto Reconnect (toggle)

#### USBConfigForm
**Props**: `{ config: USBConfig; onChange: (config) => void; errors }`

**Fields**:
- Vendor ID (numeric)
- Product ID (numeric)
- Interface Number (optional)
- Endpoint (optional)

#### SerialConfigForm
**Props**: `{ config: SerialConfig; onChange: (config) => void; errors }`

**Fields**:
- Port (COM1, COM2, /dev/ttyUSB0, etc.)
- Baud Rate (dropdown: 9600/19200/38400/57600/115200)
- Data Bits (dropdown: 7/8)
- Parity (dropdown: None/Even/Odd)
- Stop Bits (dropdown: 1/1.5/2)
- Flow Control (optional)

#### AIDLConfigForm
**Props**: `{ config: AIDLConfig; onChange: (config) => void; errors }`

**Fields**:
- Package Name
- Service Name
- Action (optional)

---

### 5. Device Config Forms

Eight specialized forms for different device types.

#### ThermalPrinterConfig
**Fields**: Printer Model, Paper Size, Auto Print, Print Copies, Cut Paper, Open Drawer, Character Encoding

#### KotPrinterConfig
**Fields**: Kitchen Section, Item Filters, Category Filters, Auto Print Delay, Consolidate Items, Show Modifiers

#### NetworkPrinterConfig
**Fields**: Paper Size, Color Printing, Duplex, DPI, Print Quality

#### BarcodeScannerConfig
**Fields**: Scanner Model, Prefix, Suffix, Min/Max Length, Scan Mode, Beep on Scan, Decode Types

#### PaymentTerminalConfig
**Fields**: Terminal ID, Merchant ID, Payment Methods, EMV Enabled, Contactless Enabled, Tip Enabled

#### ScaleConfig
**Fields**: Unit, Precision, Tare Weight, Auto Zero, Stabilization Time

#### LabelPrinterConfig
**Fields**: Label Size, DPI, Print Speed, Darkness

#### CapabilitiesConfig
**Fields**: Can Print, Can Scan, Can Accept Payment, Can Weigh, Can Open Drawer (checkboxes)

---

## API Integration

### hardwareApiService

**Location**: `src/services/hardware/hardwareApiService.ts`

Service class providing CRUD operations for hardware devices.

#### Methods

```typescript
class HardwareApiService {
  /**
   * Get all hardware devices for a store
   * Returns both store-level and terminal-level devices
   */
  async getAllHardwareDevices(
    storeId: string
  ): Promise<HardwareDevice[]>

  /**
   * Get a single hardware device by ID
   */
  async getHardwareDevice(
    storeId: string,
    deviceId: string
  ): Promise<HardwareDevice>

  /**
   * Create a new hardware device
   * For store level: no terminal_id
   * For terminal level: include terminal_id
   */
  async createHardwareDevice(
    storeId: string,
    data: CreateHardwareDeviceRequest
  ): Promise<HardwareDevice>

  /**
   * Update an existing hardware device
   */
  async updateHardwareDevice(
    storeId: string,
    deviceId: string,
    data: UpdateHardwareDeviceRequest
  ): Promise<HardwareDevice>

  /**
   * Delete a hardware device
   */
  async deleteHardwareDevice(
    storeId: string,
    deviceId: string
  ): Promise<void>

  /**
   * Test hardware device connection
   */
  async testHardwareDevice(
    tenantId: string,
    storeId: string,
    deviceId: string,
    testRequest: HardwareTestRequest
  ): Promise<HardwareTestResponse>
}
```

#### API Endpoints

```typescript
// Base path: /v0/tenant/:tenantId/store/:storeId/hardware

GET    /v0/tenant/:tenantId/store/:storeId/hardware
       → Get all devices (store + terminal level)

GET    /v0/tenant/:tenantId/store/:storeId/hardware/:deviceId
       → Get single device

POST   /v0/tenant/:tenantId/store/:storeId/hardware
       → Create device
       Body: CreateHardwareDeviceRequest

PATCH  /v0/tenant/:tenantId/store/:storeId/hardware/:deviceId
       → Update device
       Body: UpdateHardwareDeviceRequest

DELETE /v0/tenant/:tenantId/store/:storeId/hardware/:deviceId
       → Delete device

POST   /v0/tenant/:tenantId/store/:storeId/hardware/:deviceId/test
       → Test device
       Body: HardwareTestRequest
```

#### Request/Response Examples

**Create Thermal Printer (Store Level)**:
```json
POST /v0/tenant/tenant123/store/store456/hardware

{
  "name": "Main Receipt Printer",
  "device_type": "thermal_printer",
  "connection_type": "network",
  "enabled": true,
  "status": "connected",
  "model": "Epson TM-T88V",
  "manufacturer": "Epson",
  "serial_number": "ABC123456",
  "firmware_version": "1.2.3",
  "connection_config": {
    "ip_address": "192.168.1.100",
    "port": 9100,
    "protocol": "tcp"
  },
  "device_config": {
    "printer_model": "epson_tm_t88v",
    "paper_size": "thermal_80mm",
    "auto_print": true,
    "print_copies": 1,
    "cut_paper": true,
    "open_drawer": true,
    "character_encoding": "utf8"
  },
  "capabilities": {
    "can_print": true,
    "can_open_drawer": true,
    "can_scan": false,
    "can_accept_payment": false,
    "can_weigh": false
  }
}
```

**Response**:
```json
{
  "device_id": "device_789",
  "name": "Main Receipt Printer",
  "device_type": "thermal_printer",
  "status": "connected",
  "enabled": true,
  "created_at": "2025-11-23T23:50:00Z",
  "updated_at": "2025-11-23T23:50:00Z",
  // ... full device object
}
```

**Create Barcode Scanner (Terminal Level)**:
```json
POST /v0/tenant/tenant123/store/store456/hardware

{
  "name": "Counter Scanner",
  "device_type": "barcode_scanner",
  "terminal_id": "terminal_001",  // ← Terminal-specific
  "connection_type": "usb",
  "enabled": true,
  "connection_config": {
    "vendor_id": 1234,
    "product_id": 5678
  },
  "device_config": {
    "scanner_model": "honeywell_1900",
    "scan_mode": "trigger",
    "beep_on_scan": true,
    "decode_types": ["ean13", "code128", "qr_code"]
  },
  "capabilities": {
    "can_scan": true,
    "can_print": false,
    "can_accept_payment": false,
    "can_weigh": false,
    "can_open_drawer": false
  }
}
```

#### Error Handling

The API service uses the global error handling framework:

```typescript
try {
  const device = await hardwareApiService.createHardwareDevice(storeId, data);
  showSuccess('Device created successfully!');
} catch (error) {
  // Automatically parsed by useError hook
  showError(error);
  // Error structure:
  // {
  //   code: 400,
  //   slug: 'VALIDATION_ERROR',
  //   message: 'Invalid device configuration',
  //   details: {
  //     'connection_config.ip_address': 'Invalid IP address format'
  //   }
  // }
}
```

---

## Usage Guide

### Basic Integration

#### Step 1: Add Route

```tsx
// In App.tsx
import HardwareConfiguration from './pages/HardwareConfiguration';

<Route 
  path="settings/hardware" 
  element={<HardwareConfiguration />} 
/>
```

#### Step 2: Create Page Component

```tsx
// src/pages/HardwareConfiguration.tsx
import React from 'react';
import { HardwareConfigurationTab } from '../components/hardware/HardwareConfigurationTab';

const HardwareConfiguration: React.FC = () => {
  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      <HardwareConfigurationTab
        settings={{}}
        onFieldChange={() => {}}
      />
    </div>
  );
};

export default HardwareConfiguration;
```

### Advanced Usage

#### Custom Device Type Mapping

```typescript
// In your component
import { DEVICE_TYPES, DEVICE_SUBTYPES } from '../constants/hardwareOptions';

// Get all device types
const deviceTypes = DEVICE_TYPES;

// Get subtypes for a specific device
const printerSubtypes = DEVICE_SUBTYPES['printer'];
// Returns: [thermal_printer, kitchen_printer, network_printer, fiscal_printer]
```

#### Custom Filtering Logic

```typescript
// In HardwareConfigurationTab or custom component
const applyCustomFilters = (devices: HardwareDevice[]) => {
  return devices.filter(device => {
    // Custom logic
    const matchesCustomCriteria = device.enabled && 
                                   device.status === 'connected' &&
                                   device.capabilities.can_print;
    return matchesCustomCriteria;
  });
};
```

#### Programmatic Device Creation

```typescript
import { hardwareApiService } from '../services/hardware/hardwareApiService';
import { useTenantStore } from '../tenants/tenantStore';
import { useError } from '../hooks/useError';

const MyComponent = () => {
  const { currentStore } = useTenantStore();
  const { showError, showSuccess } = useError();

  const createDefaultPrinter = async () => {
    try {
      const device = await hardwareApiService.createHardwareDevice(
        currentStore.store_id,
        {
          name: 'Default Receipt Printer',
          device_type: 'thermal_printer',
          connection_type: 'network',
          enabled: true,
          status: 'disconnected',
          connection_config: {
            ip_address: '192.168.1.100',
            port: 9100,
            protocol: 'tcp'
          },
          device_config: {
            printer_model: 'epson_tm_t88v',
            paper_size: 'thermal_80mm',
            auto_print: true,
            print_copies: 1,
            cut_paper: true,
            open_drawer: true
          },
          capabilities: {
            can_print: true,
            can_open_drawer: true,
            can_scan: false,
            can_accept_payment: false,
            can_weigh: false
          }
        }
      );
      
      showSuccess('Default printer created!');
      return device;
    } catch (error) {
      showError(error);
    }
  };

  return (
    <button onClick={createDefaultPrinter}>
      Create Default Printer
    </button>
  );
};
```

---

## Troubleshooting

### Common Issues

#### 1. TypeScript Errors: "Property doesn't exist on type HardwareDevice"

**Cause**: Using Go backend field names without UI compatibility aliases.

**Solution**: Use UI-compatible field names or add aliases to type definition.

```typescript
// ❌ Incorrect (Go backend naming)
device.id
device.type
device.vendor

// ✅ Correct (UI-compatible naming)
device.device_id || device.id
device.device_type || device.type
device.manufacturer || device.vendor
```

#### 2. Form Not Displaying Device Config Section

**Cause**: Device type not selected or not matching expected values.

**Solution**: Ensure device_type is set correctly.

```typescript
// Check device type value
console.log('Device Type:', formData.device_type);

// Should be one of:
// 'thermal_printer', 'kot_printer', 'network_printer', 'barcode_scanner',
// 'payment_terminal', 'scale', 'cash_drawer', 'label_printer'
```

#### 3. Connection Config Form Not Rendering

**Cause**: Connection type not selected or form props mismatch.

**Solution**: Verify connection_type and form props.

```typescript
// NetworkConfigForm expects: onFieldChange
<NetworkConfigForm
  config={config}
  onFieldChange={(field, value) => handleChange(field, value)}
  errors={errors}
/>

// Other forms expect: onChange
<BluetoothConfigForm
  config={config}
  onChange={(config) => handleUpdate(config)}
  errors={errors}
/>
```

#### 4. API Errors: "tenant_id" or "store_id" Missing

**Cause**: Tenant/store context not available.

**Solution**: Ensure user has selected tenant and store.

```typescript
import { useTenantStore } from '../tenants/tenantStore';

const { currentTenant, currentStore } = useTenantStore();

if (!currentStore) {
  return <div>Please select a store first</div>;
}
```

#### 5. Validation Errors Not Clearing

**Cause**: Error state not updated when field changes.

**Solution**: Clear errors on field change.

```typescript
const handleFieldChange = (field: string, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  
  // Clear error for this field
  setErrors(prev => {
    const newErrors = { ...prev };
    delete newErrors[field];
    return newErrors;
  });
};
```

#### 6. Terminal Dropdown Empty

**Cause**: Terminals not loaded in tenant store.

**Solution**: Verify terminals exist in currentStore.

```typescript
const { currentStore } = useTenantStore();

console.log('Terminals:', currentStore?.terminals);

// Should be an object like:
// {
//   'terminal_001': { terminal_id: 'terminal_001', name: 'Main Counter', status: 'active', ... },
//   'terminal_002': { terminal_id: 'terminal_002', name: 'Back Office', status: 'inactive', ... }
// }
```

#### 7. Device Test Failing

**Cause**: Missing test_type or device_id in test request.

**Solution**: Include required fields in test request.

```typescript
await hardwareApiService.testHardwareDevice(
  tenantId,
  storeId,
  deviceId,
  {
    device_id: deviceId,        // ← Required
    test_type: 'connection'     // ← Required
  }
);
```

#### 8. Build Errors After Type Changes

**Cause**: Type definition changes not reflected in components.

**Solution**: 
1. Clear TypeScript cache: `rm -rf node_modules/.cache`
2. Restart TypeScript server in VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
3. Rebuild: `npm run build`

---

## Performance Considerations

### Filtering Large Device Lists

For stores with 50+ devices, consider:

```typescript
// Use React.memo for device cards
const HardwareDeviceCard = React.memo<HardwareDeviceCardProps>(({ device, ...props }) => {
  // ... component code
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.device.id === nextProps.device.id &&
         prevProps.device.status === nextProps.device.status;
});

// Debounce search input
import { debounce } from 'lodash';

const debouncedSearch = debounce((term: string) => {
  setFilters(prev => ({ ...prev, searchTerm: term }));
}, 300);
```

### Lazy Loading Device Configs

```typescript
// Load device config forms on demand
const [DeviceConfigForm, setDeviceConfigForm] = useState<React.ComponentType | null>(null);

useEffect(() => {
  if (deviceType === 'thermal_printer') {
    import('./device-configs/ThermalPrinterConfig').then(module => {
      setDeviceConfigForm(() => module.ThermalPrinterConfig);
    });
  }
}, [deviceType]);
```

---

## Security Considerations

### Tenant Isolation

All API calls automatically include tenant context via `apiClient`:

```typescript
// Automatic tenant header injection in src/services/api.ts
apiClient.interceptors.request.use((config) => {
  const { currentStore } = useTenantStore.getState();
  if (currentStore) {
    config.headers['X-Tenant-Id'] = currentStore.tenant_id;
  }
  return config;
});
```

### Input Sanitization

All form inputs are validated before submission:

```typescript
// IP address validation
const validateIPAddress = (ip: string): boolean => {
  const pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!pattern.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
};

// Port validation
const validatePort = (port: number): boolean => {
  return port >= 1 && port <= 65535;
};
```

### Error Message Sanitization

Backend error messages are parsed and sanitized:

```typescript
// In error handling
const sanitizeErrorMessage = (message: string): string => {
  // Remove sensitive information like full file paths, stack traces
  return message.replace(/\/[^\s]+/g, '[path]')
                .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[IP]');
};
```

---

## Testing Strategy

See `docs/HARDWARE_INTEGRATION_TESTING.md` for comprehensive testing checklist covering:
- All 8 device types (CRUD operations)
- All 5 connection types
- Store vs Terminal level separation
- Filtering and search
- Form validation
- Error handling
- Responsive design
- Data persistence

---

## Migration Guide

### From Old Hardware Config to New System

If migrating from an existing hardware configuration system:

#### 1. Data Migration

Map old device structure to new HardwareDevice interface:

```typescript
// Old structure
const oldDevice = {
  id: '123',
  type: 'receipt_printer',
  name: 'Main Printer',
  ip: '192.168.1.100',
  port: 9100
};

// New structure
const newDevice: HardwareDevice = {
  device_id: oldDevice.id,
  name: oldDevice.name,
  device_type: 'thermal_printer',  // Map type
  connection_type: 'network',
  enabled: true,
  status: 'connected',
  connection_config: {
    ip_address: oldDevice.ip,
    port: oldDevice.port,
    protocol: 'tcp'
  },
  device_config: {
    printer_model: 'generic',
    paper_size: 'thermal_80mm',
    auto_print: true,
    print_copies: 1,
    cut_paper: true,
    open_drawer: false
  },
  capabilities: {
    can_print: true,
    can_open_drawer: false,
    can_scan: false,
    can_accept_payment: false,
    can_weigh: false
  }
};
```

#### 2. API Endpoint Migration

Update API calls from old endpoints:

```typescript
// Old API call
fetch('/api/hardware/config');

// New API call
hardwareApiService.getAllHardwareDevices(storeId);
```

#### 3. Component Migration

Replace old components:

```tsx
// Old component
<HardwareSettings />

// New component
<HardwareConfigurationTab settings={{}} onFieldChange={() => {}} />
```

---

## Changelog

### Version 1.0.0 (2025-11-23)
- ✅ Initial implementation
- ✅ 8 device types supported
- ✅ 5 connection types supported
- ✅ Dual-level configuration (Store/Terminal)
- ✅ Dynamic form generation
- ✅ Advanced filtering and search
- ✅ Global error handling integration
- ✅ Type system with UI compatibility aliases
- ✅ Comprehensive documentation

---

## Support & Resources

### Documentation
- **Implementation Guide**: This document
- **Integration Testing**: `docs/HARDWARE_INTEGRATION_TESTING.md`
- **Styling Guide**: `docs/STYLING_GUIDE.md`
- **Error Handling**: `docs/framework/ERROR_HANDLING_FRAMEWORK.md`

### Code References
- **Components**: `src/components/hardware/`
- **Types**: `src/types/hardware-new.types.ts`
- **API Service**: `src/services/hardware/hardwareApiService.ts`
- **Constants**: `src/constants/hardwareOptions.ts`

### Contact
For questions or issues, refer to the project README or open an issue in the repository.

---

**Document Version**: 1.0.0  
**Last Updated**: 23 November 2025  
**Author**: AI Coding Agent  
**Status**: ✅ Complete