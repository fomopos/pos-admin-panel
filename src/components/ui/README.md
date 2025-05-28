# Modular Table Components

This directory contains a set of modular, reusable table components with built-in pagination, sorting, and search functionality. These components are designed to be used throughout the application for consistent data presentation.

## Components Overview

### 1. Table Components (`Table.tsx`)
Basic table building blocks that provide the foundation for all table implementations.

**Components:**
- `Table` - Root table wrapper with styling
- `TableHeader` - Table header section
- `TableBody` - Table body section
- `TableRow` - Table row with optional hover effects
- `TableHead` - Table header cell with optional sorting
- `TableCell` - Table data cell
- `TableCaption` - Table caption

### 2. Pagination Component (`Pagination.tsx`)
Standalone pagination component that can be used with any data set.

**Features:**
- Page navigation with first/previous/next/last buttons
- Page number display with ellipsis for large page counts
- Items per page selector
- Results information display
- Fully customizable appearance

### 3. DataTable Component (`DataTable.tsx`)
High-level component that combines table, search, filtering, sorting, and pagination into a single, easy-to-use component.

**Features:**
- Built-in search functionality
- Column-based sorting
- Pagination
- Custom filters
- Loading states
- Empty states
- Row click handlers
- Custom cell rendering

### 4. useDataTable Hook (`useDataTable.ts`)
Custom hook that provides table state management and data processing logic.

**Features:**
- Search filtering
- Sorting logic
- Pagination state
- Data processing utilities

## Usage Examples

### Basic Table Usage

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/Table';

function BasicTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

### DataTable Usage

```tsx
import DataTable, { type Column } from '../components/ui/DataTable';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);

  const columns: Column<User>[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, user) => (
        <div className="flex space-x-2">
          <button onClick={() => editUser(user)}>Edit</button>
          <button onClick={() => deleteUser(user.id)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      searchable={true}
      searchPlaceholder="Search users..."
      searchFields={['name', 'email']}
      pagination={true}
      pageSize={10}
      defaultSort={{ key: 'name', direction: 'asc' }}
      onRowClick={(user) => console.log('Clicked user:', user)}
    />
  );
}
```

### Using the useDataTable Hook

```tsx
import { useDataTable } from '../hooks/useDataTable';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';

function CustomTable() {
  const [data, setData] = useState([]);
  
  const {
    searchTerm,
    setSearchTerm,
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    handleSort,
    getSortDirection,
  } = useDataTable({
    data,
    searchFields: ['name', 'email'],
    defaultSort: { key: 'name', direction: 'asc' },
  });

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              sortable
              sortDirection={getSortDirection('name')}
              onSort={() => handleSort('name')}
            >
              Name
            </TableHead>
            <TableHead
              sortable
              sortDirection={getSortDirection('email')}
              onSort={() => handleSort('email')}
            >
              Email
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}
```

## Component Props

### DataTable Props

```tsx
interface DataTableProps<T> {
  data: T[];                              // Array of data to display
  columns: Column<T>[];                   // Column definitions
  loading?: boolean;                      // Show loading state
  searchable?: boolean;                   // Enable search functionality
  searchPlaceholder?: string;             // Search input placeholder
  filterable?: boolean;                   // Enable custom filters
  filters?: React.ReactNode;              // Custom filter components
  pagination?: boolean;                   // Enable pagination
  pageSize?: number;                      // Default page size
  pageSizeOptions?: number[];             // Available page size options
  className?: string;                     // Additional CSS classes
  emptyState?: React.ReactNode;           // Custom empty state component
  onRowClick?: (item: T, index: number) => void;  // Row click handler
  rowClassName?: (item: T, index: number) => string;  // Dynamic row classes
  searchFields?: (keyof T)[];             // Fields to search in
  defaultSort?: {                         // Default sort configuration
    key: keyof T | string;
    direction: 'asc' | 'desc';
  };
}
```

### Column Definition

```tsx
interface Column<T> {
  key: keyof T | string;                  // Data key or custom identifier
  title: string;                          // Column header text
  sortable?: boolean;                     // Enable sorting for this column
  render?: (value: any, item: T, index: number) => React.ReactNode;  // Custom cell renderer
  width?: string;                         // Column width (CSS value)
  className?: string;                     // Additional CSS classes
}
```

### Pagination Props

```tsx
interface PaginationProps {
  currentPage: number;                    // Current page number
  totalPages: number;                     // Total number of pages
  totalItems: number;                     // Total number of items
  itemsPerPage: number;                   // Items per page
  onPageChange: (page: number) => void;   // Page change handler
  onItemsPerPageChange?: (itemsPerPage: number) => void;  // Page size change handler
  showItemsPerPage?: boolean;             // Show page size selector
  itemsPerPageOptions?: number[];         // Available page size options
  showInfo?: boolean;                     // Show pagination info
  className?: string;                     // Additional CSS classes
}
```

## Styling

All components use Tailwind CSS classes and follow the existing design system. The components are designed to be consistent with the rest of the application's UI.

### Customization

You can customize the appearance by:

1. **CSS Classes**: Pass custom `className` props to components
2. **Custom Renderers**: Use the `render` prop in column definitions for custom cell content
3. **Theming**: Modify the Tailwind classes in the component files
4. **Empty States**: Provide custom `emptyState` components

## Best Practices

1. **Type Safety**: Always define proper TypeScript interfaces for your data
2. **Performance**: Use `useMemo` for expensive column calculations
3. **Accessibility**: Ensure proper ARIA labels and keyboard navigation
4. **Responsive Design**: Test tables on different screen sizes
5. **Loading States**: Always handle loading and error states appropriately

## Examples in the Codebase

- `src/pages/ProductsWithDataTable.tsx` - Complete example with all features
- `src/pages/Products.tsx` - Original implementation for comparison

## Migration Guide

To migrate from the old table implementation to the new modular components:

1. Replace manual table HTML with the new Table components
2. Define column configurations using the Column interface
3. Replace manual pagination logic with the DataTable component
4. Use the useDataTable hook for custom implementations
5. Update styling to use the new component classes
