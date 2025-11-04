'use client';

import { useState, useMemo } from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { exportToCSV, formatTableForExport } from '@/lib/export';

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  format?: (value: any) => string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  exportable?: boolean;
  exportFilename?: string;
  pagination?: boolean;
  itemsPerPage?: number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export default function DataTable<T extends { id?: string }>({
  data,
  columns,
  title,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchKeys,
  exportable = true,
  exportFilename = 'data',
  pagination = true,
  itemsPerPage = 10,
  onRowClick,
  emptyMessage = 'No data found',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchable) return data;

    const searchLower = searchTerm.toLowerCase();
    const keysToSearch = searchKeys || columns.map(col => col.key);

    return data.filter(item =>
      keysToSearch.some(key => {
        const value = item[key];
        return String(value ?? '').toLowerCase().includes(searchLower);
      })
    );
  }, [data, searchTerm, searchable, searchKeys, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage, pagination]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    const exportData = formatTableForExport(sortedData, columns.map(col => ({
      key: col.key,
      label: col.label,
      format: col.format,
    })));
    exportToCSV({ ...exportData, filename: exportFilename });
  };

  const renderHeader = () => (
    <thead className="bg-primary-light">
      <tr>
        {columns.map((column) => (
          <th
            key={String(column.key)}
            className={`px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider ${
              column.sortable !== false ? 'cursor-pointer hover:bg-primary hover:bg-opacity-10' : ''
            }`}
            onClick={() => column.sortable !== false && handleSort(column.key)}
          >
            <div className="flex items-center space-x-1">
              <span>{column.label}</span>
              {column.sortable !== false && sortColumn === column.key && (
                sortDirection === 'asc' ? (
                  <ArrowUpIcon className="h-4 w-4 text-primary" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-primary" />
                )
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderRow = (row: T) => (
    <tr
      key={row.id || JSON.stringify(row)}
      className={`hover:bg-primary-light hover:bg-opacity-10 transition-colors ${
        onRowClick ? 'cursor-pointer' : ''
      }`}
      onClick={() => onRowClick && onRowClick(row)}
    >
      {columns.map((column) => {
        const value = row[column.key];
        return (
          <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
            {column.render ? column.render(value, row) : String(value ?? '')}
          </td>
        );
      })}
    </tr>
  );

  return (
    <div className="bg-surface shadow-elevated rounded-lg animate-fade-in">
      <div className="px-4 py-5 sm:p-6">
        {/* Header with title, search, and export */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          {title && (
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          )}
          <div className="flex items-center space-x-3">
            {searchable && (
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 border border-border rounded-md bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            )}
            {exportable && (
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-hover transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Export</span>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            {renderHeader()}
            <tbody className="bg-surface divide-y divide-border">
              {paginatedData.length > 0 ? (
                paginatedData.map(renderRow)
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-text-secondary">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="text-sm text-text-secondary">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-border bg-surface text-text-primary hover:bg-primary-light hover:bg-opacity-10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <div className="text-sm text-text-primary">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-border bg-surface text-text-primary hover:bg-primary-light hover:bg-opacity-10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

