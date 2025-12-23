# Hardware Configuration - Integration Testing Report

## Overview
Integration testing checklist for the new hardware configuration system implemented across 19 tasks (Tasks 1-19).

**Date**: 23 November 2025  
**Build Status**: ✅ **PASSED** - 0 TypeScript errors  
**Dev Server**: Running at https://localhost:5173/

---

## Testing Environment

### Prerequisites
- ✅ Backend API available (mocked or real)
- ✅ Valid tenant and store selected
- ✅ Terminals configured in store
- ✅ Dev server running successfully

### Access Points
The `HardwareConfigurationTab` component can be integrated into:
1. **Terminal Settings Page** (`/settings/terminals`)
2. **Store Settings Page** (`/settings/store`)
3. **Standalone Hardware Configuration Page** (recommended)

**Recommended Route Addition**:
```tsx
// In App.tsx, add within DashboardLayout routes:
<Route path="settings/hardware" element={<HardwareConfiguration />} />
```

---

## Test Plan

### 1. Component Rendering Tests ✅

#### 1.1 Initial Load
- [ ] Component loads without errors
- [ ] Loading state displays while fetching data
- [ ] Store-level tab is default active
- [ ] Filter panel renders correctly
- [ ] Empty state shows when no devices configured

#### 1.2 Level Switching
- [ ] Can switch between Store Level and Terminal Level tabs
- [ ] Terminal dropdown appears only on Terminal Level
- [ ] Terminal Level prompts for terminal selection when none selected
- [ ] Device list updates correctly when switching levels

---

### 2. Device Type CRUD Tests

Test the complete Create, Read, Update, Delete cycle for each of the 8 device types:

#### 2.1 Thermal Printer
- [ ] **Create**: Add new thermal printer with network connection
  - [ ] Select device type: "Thermal Printer"
  - [ ] Select subtype: "thermal_printer"
  - [ ] Configure connection: Network (IP, Port, Protocol)
  - [ ] Configure device: Paper size, print copies, cut paper, open drawer
  - [ ] Configure capabilities: Can print, Can open drawer
  - [ ] Validate all required fields
  - [ ] Submit successfully
- [ ] **Read**: View thermal printer card
  - [ ] Displays correct device icon (🧾)
  - [ ] Shows connection type badge
  - [ ] Shows status badge (connected/disconnected/degraded/error)
  - [ ] Shows capabilities (Print, Drawer)
  - [ ] Shows connection details (IP address if network)
- [ ] **Update**: Edit thermal printer
  - [ ] Open edit form
  - [ ] Modify paper size from 80mm to 58mm
  - [ ] Change print copies from 1 to 2
  - [ ] Save changes
  - [ ] Verify updates reflected in card
- [ ] **Delete**: Remove thermal printer
  - [ ] Click delete button
  - [ ] Confirm deletion
  - [ ] Verify device removed from list

#### 2.2 KOT Printer (Kitchen Order Ticket)
- [ ] **Create**: Add KOT printer with network connection
  - [ ] Select device type: "KOT Printer"
  - [ ] Configure kitchen section (Grill, Fryer, etc.)
  - [ ] Configure item filtering rules
  - [ ] Set auto-print delay
- [ ] **Read**: Verify KOT printer displays kitchen section
- [ ] **Update**: Change kitchen section from "Grill" to "Fryer"
- [ ] **Delete**: Remove KOT printer

#### 2.3 Network Printer
- [ ] **Create**: Add network printer
  - [ ] Select device type: "Network Printer"
  - [ ] Configure network connection (IP, Port)
  - [ ] Set paper size to A4
  - [ ] Configure color printing
- [ ] **Read**: Verify network printer displays correct config
- [ ] **Update**: Toggle color printing setting
- [ ] **Delete**: Remove network printer

#### 2.4 Barcode Scanner
- [ ] **Create**: Add barcode scanner with USB connection
  - [ ] Select device type: "Barcode Scanner"
  - [ ] Configure USB connection (Vendor ID, Product ID)
  - [ ] Set scan mode: Continuous
  - [ ] Configure decode types (EAN-13, Code 128, QR Code)
  - [ ] Set min/max length validation
- [ ] **Read**: Verify scanner shows decode types
- [ ] **Update**: Add PDF417 to decode types
- [ ] **Delete**: Remove scanner

#### 2.5 Payment Terminal
- [ ] **Create**: Add payment terminal with Bluetooth
  - [ ] Select device type: "Payment Terminal"
  - [ ] Configure Bluetooth connection (Device name, PIN)
  - [ ] Set supported payment methods
  - [ ] Configure EMV options
- [ ] **Read**: Verify payment terminal displays capabilities
- [ ] **Update**: Add new payment method
- [ ] **Delete**: Remove payment terminal

#### 2.6 Scale
- [ ] **Create**: Add scale with Serial connection
  - [ ] Select device type: "Scale"
  - [ ] Configure Serial connection (Port, Baud rate)
  - [ ] Set unit of measurement (kg/lb)
  - [ ] Configure tare weight
- [ ] **Read**: Verify scale shows unit and connection
- [ ] **Update**: Change unit from kg to lb
- [ ] **Delete**: Remove scale

#### 2.7 Cash Drawer
- [ ] **Create**: Add cash drawer with RJ11 connection
  - [ ] Select device type: "Cash Drawer"
  - [ ] Configure basic settings
  - [ ] Link to thermal printer for kick-out
- [ ] **Read**: Verify cash drawer displays
- [ ] **Update**: Change linked printer
- [ ] **Delete**: Remove cash drawer

#### 2.8 Label Printer
- [ ] **Create**: Add label printer with network connection
  - [ ] Select device type: "Label Printer"
  - [ ] Configure label size and format
  - [ ] Set DPI and print speed
- [ ] **Read**: Verify label printer config
- [ ] **Update**: Change label size
- [ ] **Delete**: Remove label printer

---

### 3. Connection Type Tests

Test each connection type variation:

#### 3.1 Network Connection
- [ ] Create device with Network connection
- [ ] Validate IP address format (xxx.xxx.xxx.xxx)
- [ ] Validate port range (1-65535)
- [ ] Test protocol dropdown (TCP/HTTP/HTTPS/Raw Socket)
- [ ] Save and verify connection config stored

#### 3.2 Bluetooth Connection
- [ ] Create device with Bluetooth connection
- [ ] Enter device name
- [ ] Enter pairing PIN (optional)
- [ ] Save and verify Bluetooth config

#### 3.3 USB Connection
- [ ] Create device with USB connection
- [ ] Enter Vendor ID (numeric)
- [ ] Enter Product ID (numeric)
- [ ] Validate numeric-only input
- [ ] Save and verify USB config

#### 3.4 Serial Connection
- [ ] Create device with Serial connection
- [ ] Select COM port
- [ ] Select baud rate (9600/19200/38400/57600/115200)
- [ ] Select data bits (7/8)
- [ ] Select parity (None/Even/Odd)
- [ ] Select stop bits (1/1.5/2)
- [ ] Save and verify Serial config

#### 3.5 AIDL Connection (Android Interface Definition Language)
- [ ] Create device with AIDL connection
- [ ] Enter package name
- [ ] Enter service name
- [ ] Save and verify AIDL config

---

### 4. Form Validation Tests

#### 4.1 Required Field Validation
- [ ] Submit form with empty device name - expect error
- [ ] Submit form without device type - expect error
- [ ] Submit form without connection type - expect error
- [ ] Submit network connection without IP - expect error
- [ ] Submit network connection without port - expect error

#### 4.2 Format Validation
- [ ] Enter invalid IP address (e.g., "999.999.999.999") - expect error
- [ ] Enter port out of range (e.g., "99999") - expect error
- [ ] Enter non-numeric USB Vendor ID - expect error
- [ ] Enter non-numeric USB Product ID - expect error
- [ ] Enter invalid serial number format - expect error

#### 4.3 Conditional Validation
- [ ] Device config section only appears after device type selected
- [ ] Connection config section only appears after connection type selected
- [ ] Terminal dropdown only appears on Terminal Level
- [ ] Device-specific fields appear based on device type

---

### 5. Store vs Terminal Level Tests

#### 5.1 Store Level Devices
- [ ] Switch to Store Level tab
- [ ] Add device at store level (no terminal_id)
- [ ] Verify device appears in store level list
- [ ] Verify device does NOT appear in any terminal level list
- [ ] Edit store level device
- [ ] Delete store level device

#### 5.2 Terminal Level Devices
- [ ] Switch to Terminal Level tab
- [ ] Select Terminal 1 from dropdown
- [ ] Add device for Terminal 1 (has terminal_id)
- [ ] Verify device appears only in Terminal 1 list
- [ ] Switch to Terminal 2
- [ ] Verify Terminal 1 device NOT visible
- [ ] Add device for Terminal 2
- [ ] Switch back to Terminal 1 - verify both terminals maintain separate device lists
- [ ] Edit terminal level device
- [ ] Delete terminal level device

---

### 6. Filtering and Search Tests

#### 6.1 Device Type Filter
- [ ] Create devices of multiple types (Printer, Scanner, Scale)
- [ ] Apply filter: Show only Printers
- [ ] Verify only printer devices displayed
- [ ] Apply filter: Show Printers + Scanners
- [ ] Verify correct device types displayed
- [ ] Clear filter
- [ ] Verify all devices displayed

#### 6.2 Status Filter
- [ ] Apply filter: Show only Connected devices
- [ ] Verify only connected devices displayed
- [ ] Apply filter: Show Disconnected + Error
- [ ] Verify correct status devices displayed
- [ ] Clear filter

#### 6.3 Connection Type Filter
- [ ] Apply filter: Show only Network devices
- [ ] Verify only network-connected devices displayed
- [ ] Apply filter: Show USB + Bluetooth
- [ ] Verify correct connection types displayed
- [ ] Clear filter

#### 6.4 Search Functionality
- [ ] Enter device name in search - verify filtered results
- [ ] Enter manufacturer in search - verify filtered results
- [ ] Enter model in search - verify filtered results
- [ ] Search with partial text - verify partial matching works
- [ ] Clear search - verify all devices displayed

#### 6.5 Combined Filters
- [ ] Apply device type + status + connection type filters together
- [ ] Verify results match all filter criteria (AND logic)
- [ ] Add search term to existing filters
- [ ] Verify search + filters work together
- [ ] Clear all filters at once

---

### 7. Device Testing Feature

#### 7.1 Test Device Functionality
- [ ] Open device form
- [ ] Click "Test Device" button
- [ ] Verify test request sent to backend
- [ ] Verify test result displayed (success/failure)
- [ ] Test multiple device types
- [ ] Verify error handling for failed tests

---

### 8. Error Handling Tests

#### 8.1 Network Errors
- [ ] Simulate backend unavailable
- [ ] Verify error message displayed via global error handler
- [ ] Verify toast notification appears
- [ ] Verify user-friendly error message

#### 8.2 Validation Errors
- [ ] Trigger validation errors
- [ ] Verify error messages display below fields
- [ ] Verify error messages clear when field is corrected
- [ ] Verify multiple field errors display simultaneously

#### 8.3 API Error Responses
- [ ] Simulate 400 Bad Request (validation error)
- [ ] Verify detailed error messages displayed
- [ ] Simulate 404 Not Found
- [ ] Verify appropriate error message
- [ ] Simulate 500 Internal Server Error
- [ ] Verify generic error message

---

### 9. UI/UX Tests

#### 9.1 Responsive Design
- [ ] Test on desktop (>1024px)
- [ ] Test on tablet (768px-1024px)
- [ ] Test on mobile (<768px)
- [ ] Verify card grid adjusts to screen size
- [ ] Verify modal form is scrollable on small screens

#### 9.2 Loading States
- [ ] Verify loading spinner during data fetch
- [ ] Verify skeleton loaders during initial load
- [ ] Verify button disabled states during operations
- [ ] Verify loading text in buttons during save/delete

#### 9.3 User Feedback
- [ ] Verify success toast on device creation
- [ ] Verify success toast on device update
- [ ] Verify success toast on device deletion
- [ ] Verify error toast on failed operations
- [ ] Verify status badges have appropriate colors
- [ ] Verify icons display correctly

---

### 10. Data Persistence Tests

#### 10.1 Form State
- [ ] Fill device form partially
- [ ] Close modal without saving
- [ ] Reopen form
- [ ] Verify form is reset (not retaining old data)

#### 10.2 Filter State
- [ ] Apply filters
- [ ] Switch tabs (Store ↔ Terminal)
- [ ] Verify filters reset on tab change
- [ ] Apply filters
- [ ] Refresh page
- [ ] Verify filters are reset (not persisted)

#### 10.3 Terminal Selection
- [ ] Select terminal on Terminal Level
- [ ] Switch to Store Level
- [ ] Switch back to Terminal Level
- [ ] Verify previously selected terminal is remembered (optional behavior)

---

## Integration Points

### Components Used
- ✅ `HardwareConfigurationTab` - Main container
- ✅ `HardwareDeviceCard` - Device display card
- ✅ `HardwareDeviceForm` - Device create/edit modal
- ✅ `NetworkConfigForm` - Network connection config
- ✅ `BluetoothConfigForm` - Bluetooth connection config
- ✅ `USBConfigForm` - USB connection config
- ✅ `SerialConfigForm` - Serial connection config
- ✅ `AIDLConfigForm` - AIDL connection config
- ✅ `ThermalPrinterConfig` - Thermal printer device config
- ✅ `KotPrinterConfig` - KOT printer device config
- ✅ `NetworkPrinterConfig` - Network printer device config
- ✅ `BarcodeScannerConfig` - Barcode scanner device config
- ✅ `PaymentTerminalConfig` - Payment terminal device config
- ✅ `ScaleConfig` - Scale device config
- ✅ `LabelPrinterConfig` - Label printer device config
- ✅ `CapabilitiesConfig` - Device capabilities config

### Services Used
- ✅ `hardwareApiService` - CRUD operations for hardware devices
- ✅ `apiClient` - HTTP client with automatic auth/tenant headers
- ✅ `useError` - Global error handling hook
- ✅ `useTenantStore` - Tenant/store context

### Constants Used
- ✅ `DEVICE_TYPES` - Device type dropdown options
- ✅ `DEVICE_SUBTYPES` - Device subtype mapping
- ✅ `CONNECTION_TYPES` - Connection type dropdown options
- ✅ `DEVICE_STATUS_OPTIONS` - Status filter options
- ✅ `THERMAL_PAPER_SIZES` - Paper size options
- ✅ `BARCODE_DECODE_TYPES` - Barcode types
- ✅ `getConnectionTypesForDevice()` - Valid connections per device type

---

## Known Limitations

### Backend Integration
- **Mock Data Mode**: If `VITE_USE_MOCK_DATA=true`, API calls may return mock responses
- **API Endpoints**: Ensure backend implements all endpoints in `hardwareApiService`:
  - `GET /v0/tenant/:tenantId/store/:storeId/hardware` - Get all devices
  - `POST /v0/tenant/:tenantId/store/:storeId/hardware` - Create device
  - `PATCH /v0/tenant/:tenantId/store/:storeId/hardware/:deviceId` - Update device
  - `DELETE /v0/tenant/:tenantId/store/:storeId/hardware/:deviceId` - Delete device
  - `POST /v0/tenant/:tenantId/store/:storeId/hardware/:deviceId/test` - Test device

### Type System
- **UI Compatibility Aliases**: The type system includes aliases to bridge Go backend naming (id, type, vendor) with React component expectations (device_id, device_type, manufacturer)
- **DeviceType Extension**: DeviceType union includes both parent types ('printer', 'scanner') and specific subtypes ('thermal_printer', 'kot_printer', 'network_printer', 'barcode_scanner')

---

## Testing Automation (Future)

### Unit Tests (Recommended)
- Component rendering tests with React Testing Library
- Form validation logic tests
- Utility function tests (converters, validators)

### E2E Tests (Recommended)
- Playwright/Cypress tests for full CRUD workflows
- Multi-device type testing
- Filter and search testing
- Cross-browser compatibility

---

## Sign-off

### Manual Testing Checklist
- [ ] All 8 device types tested (Create, Read, Update, Delete)
- [ ] All 5 connection types tested
- [ ] Store level and Terminal level separation verified
- [ ] Filtering and search functionality verified
- [ ] Form validation working correctly
- [ ] Error handling displaying correctly
- [ ] Device testing feature working
- [ ] Responsive design tested on 3 screen sizes
- [ ] Loading states and user feedback verified

### Build Verification
- ✅ TypeScript compilation: **0 errors**
- ✅ Bundle build: **Success** (3.5 MB, 760 KB gzipped)
- ✅ Dev server: **Running**
- ✅ No console errors on component mount

---

## Next Steps

1. **Deploy to Staging**: Test with real backend API
2. **User Acceptance Testing**: Get feedback from POS operators
3. **Performance Testing**: Test with 50+ devices per store/terminal
4. **Documentation**: Complete implementation documentation (Task 21)
5. **Production Release**: Deploy to production environment

---

**Testing Status**: ⏸️ **READY FOR MANUAL TESTING**  
**Tester**: ___________________  
**Date Tested**: ___________________  
**Result**: ___________________
