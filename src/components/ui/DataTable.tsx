import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './Table';
import Pagination from './Pagination';
import Input from './Input';
import Loading from './Loading';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  width?: string;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterable?: boolean;
  filters?: React.ReactNode;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  className?: string;
  emptyState?: React.ReactNode;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: (item: T, index: number) => string;
  searchFields?: (keyof T)[];
  defaultSort?: {
    key: keyof T | string;
    direction: 'asc' | 'desc';
  };
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder,
  filterable = false,
  filters,
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  className,
  emptyState,
  onRowClick,
  rowClassName,
  searchFields,
  defaultSort,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | string;
    direction: 'asc' | 'desc';
  } | null>(defaultSort || null);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) => {
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((field) => {
          const value = item[field];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      }

      // Search all string fields if no specific fields are provided
      return Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [data, searchTerm, searchFields]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;

      const direction = sortConfig.direction === 'asc' ? 1 : -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * direction;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }

      // Handle dates with proper type checking
      try {
        const aDate = new Date(aValue as any);
        const bDate = new Date(bValue as any);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return (aDate.getTime() - bDate.getTime()) * direction;
        }
      } catch {
        // Fall through to string comparison
      }

      // Convert to string for comparison
      return String(aValue).localeCompare(String(bValue)) * direction;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage, pagination]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key: keyof T | string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const getCellValue = (item: T, column: Column<T>) => {
    if (column.render) {
      const index = data.indexOf(item);
      return column.render(item[column.key as keyof T], item, index);
    }
    return item[column.key as keyof T];
  };

  const getSortDirection = (columnKey: keyof T | string) => {
    if (sortConfig?.key === columnKey) {
      return sortConfig.direction;
    }
    return null;
  };

  if (loading) {
    return (
      <Loading
        title={t('common.loadingData')}
        description={t('common.loadingDataDescription')}
        fullScreen={false}
        size="md"
      />
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {searchable && (
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder={searchPlaceholder || t('common.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          )}
          {filterable && filters && (
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 text-slate-400" />
              {filters}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div>
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  sortable={column.sortable}
                  sortDirection={getSortDirection(column.key)}
                  onSort={() => column.sortable && handleSort(column.key)}
                  className={cn(column.className)}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow hoverable={false}>
                <TableCell colSpan={columns.length} className="text-center py-12">
                  {emptyState || (
                    <div className="text-slate-500">
                      <div className="text-lg font-medium mb-1">{t('common.noDataFound')}</div>
                      <div className="text-sm">
                        {searchTerm
                          ? t('common.tryAdjustingSearch')
                          : t('common.noItemsToDisplay')}
                      </div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow
                  key={index}
                  onClick={() => onRowClick?.(item, index)}
                  className={cn(
                    onRowClick && 'cursor-pointer',
                    rowClassName?.(item, index)
                  )}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      className={cn(column.className)}
                    >
                      {getCellValue(item, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination && sortedData.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sortedData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={pageSizeOptions}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
