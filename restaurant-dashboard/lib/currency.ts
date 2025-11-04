/**
 * Currency utility functions for INR (Indian Rupee) formatting
 */

/**
 * Format a number as INR currency
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the ₹ symbol (default: true)
 * @returns Formatted currency string
 */
export function formatINR(amount: number, showSymbol: boolean = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return showSymbol ? '₹0.00' : '0.00';
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  // Intl returns ₹ symbol, we keep it or remove based on showSymbol
  return showSymbol ? formatted : formatted.replace('₹', '').trim();
}

/**
 * Format INR in a compact way (e.g., ₹1.2K, ₹3.5L)
 * @param amount - The amount to format
 * @returns Compact formatted string
 */
export function formatINRCompact(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  // Thousand
  if (amount >= 1000 && amount < 100000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  
  // Lakh (Indian numbering system)
  if (amount >= 100000 && amount < 10000000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  
  // Crore
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }

  return formatINR(amount);
}

/**
 * Parse INR string to number
 * @param inrString - String like "₹1,234.56" or "1234.56"
 * @returns Parsed number
 */
export function parseINR(inrString: string): number {
  if (!inrString) return 0;
  
  // Remove currency symbol and commas
  const cleaned = inrString.replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validate if a value is a valid INR amount
 * @param value - Value to validate
 * @returns true if valid
 */
export function isValidINR(value: any): boolean {
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value) && value >= 0;
  }
  
  if (typeof value === 'string') {
    const parsed = parseINR(value);
    return !isNaN(parsed) && parsed >= 0;
  }
  
  return false;
}

/**
 * Calculate percentage
 * @param part - Part value
 * @param total - Total value
 * @returns Percentage string
 */
export function calculatePercentage(part: number, total: number): string {
  if (!total || total === 0) return '0%';
  const percentage = (part / total) * 100;
  return `${percentage.toFixed(1)}%`;
}

/**
 * Calculate growth percentage
 * @param current - Current value
 * @param previous - Previous value
 * @returns Growth percentage with + or - sign
 */
export function calculateGrowth(current: number, previous: number): string {
  if (!previous || previous === 0) return '+0%';
  const growth = ((current - previous) / previous) * 100;
  const sign = growth >= 0 ? '+' : '';
  return `${sign}${growth.toFixed(1)}%`;
}

