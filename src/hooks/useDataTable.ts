import { useState, useMemo } from 'react';

export interface UseDataTableProps<T> {
  data: T[];
  searchFields?: (keyof T)[];
  defaultSort?: {
    key: keyof T | string;
    direction: 'asc' | 'desc';
  };
  defaultPageSize?: number;
}

export interface UseDataTableReturn<T> {
  // State
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
  sortConfig: {
    key: keyof T | string;
    direction: 'asc' | 'desc';
  } | null;
  
  // Computed data
  filteredData: T[];
  sortedData: T[];
  paginatedData: T[];
  totalPages: number;
  totalItems: number;
  
  // Actions
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (size: number) => void;
  handleSort: (key: keyof T | string) => void;
  handlePageChange: (page: number) => void;
  handleItemsPerPageChange: (size: number) => void;
  getSortDirection: (columnKey: keyof T | string) => 'asc' | 'desc' | null;
  reset: () => void;
}

export function useDataTable<T extends Record<string, any>>({
  data,
  searchFields,
  defaultSort,
  defaultPageSize = 10,
}: UseDataTableProps<T>): UseDataTableReturn<T> {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultPageSize);
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
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const totalItems = sortedData.length;

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

  const getSortDirection = (columnKey: keyof T | string) => {
    if (sortConfig?.key === columnKey) {
      return sortConfig.direction;
    }
    return null;
  };

  const reset = () => {
    setSearchTerm('');
    setCurrentPage(1);
    setItemsPerPage(defaultPageSize);
    setSortConfig(defaultSort || null);
  };

  // Reset to first page when search term changes
  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  return {
    // State
    searchTerm,
    currentPage,
    itemsPerPage,
    sortConfig,
    
    // Computed data
    filteredData,
    sortedData,
    paginatedData,
    totalPages,
    totalItems,
    
    // Actions
    setSearchTerm: handleSearchTermChange,
    setCurrentPage,
    setItemsPerPage,
    handleSort,
    handlePageChange,
    handleItemsPerPageChange,
    getSortDirection,
    reset,
  };
}
