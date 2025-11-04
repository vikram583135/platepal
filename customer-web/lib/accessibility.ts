/**
 * Accessibility utilities and helpers
 */

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Trap focus within an element (for modals)
 */
export function trapFocus(element: HTMLElement, event: KeyboardEvent) {
  if (event.key !== 'Tab') {
    return;
  }

  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    }
  } else {
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }
}

/**
 * Get accessible label for icon-only buttons
 */
export function getIconLabel(iconName: string, context?: string): string {
  const labels: Record<string, string> = {
    close: 'Close',
    menu: 'Open menu',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    next: 'Next',
    previous: 'Previous',
    back: 'Go back',
    home: 'Go to home',
    cart: 'View cart',
    profile: 'View profile',
    settings: 'Settings',
    logout: 'Log out',
  };

  return context ? `${labels[iconName] || iconName} ${context}` : labels[iconName] || iconName;
}

/**
 * Generate unique ID for form inputs
 */
let idCounter = 0;
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

/**
 * Format currency for screen readers
 */
export function formatCurrencyForScreenReader(amount: number, currency: string = 'INR'): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Skip to main content link (for keyboard navigation)
 */
export function createSkipLink() {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-lg';
  skipLink.textContent = 'Skip to main content';
  
  return skipLink;
}

/**
 * ARIA live region for dynamic content updates
 */
export function createLiveRegion(priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
  const region = document.createElement('div');
  region.id = `live-region-${Date.now()}`;
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', priority);
  region.setAttribute('aria-atomic', 'true');
  region.className = 'sr-only';
  document.body.appendChild(region);
  return region;
}

/**
 * Announce page changes for screen readers
 */
export function announcePageChange(pageTitle: string) {
  announceToScreenReader(`Navigated to ${pageTitle}`, 'polite');
}

