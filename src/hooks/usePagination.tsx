import { useState, useMemo, useEffect } from "react";

interface UsePaginationProps<T> {
  items: T[];
  itemsPerPage?: number;
  searchTerm?: string;
  searchFields?: (keyof T)[];
}

export function usePagination<T>({
  items,
  itemsPerPage = 10,
  searchTerm = "",
  searchFields = [],
}: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm || searchFields.length === 0) return items;

    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      })
    );
  }, [items, searchTerm, searchFields]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return {
    currentItems,
    filteredItems,
    currentPage,
    totalPages,
    startIndex,
    setCurrentPage,
  };
}
