/**
 * Export utility functions for CSV, JSON, and other formats
 */

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  filename?: string;
}

/**
 * Convert data to CSV format and download
 */
export function exportToCSV(data: ExportData): void {
  const { headers, rows, filename = 'export' } = data;
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        // Escape commas and quotes in cell content
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: any, filename: string = 'export'): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Format table data for export
 */
export function formatTableForExport<T>(
  data: T[],
  columns: { key: keyof T; label: string; format?: (value: any) => string }[]
): ExportData {
  const headers = columns.map(col => col.label);
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key];
      return col.format ? col.format(value) : String(value ?? '');
    })
  );
  
  return { headers, rows };
}

