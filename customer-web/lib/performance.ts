/**
 * Performance optimization utilities
 */

/**
 * Debounce function to limit function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Lazy load image with intersection observer
 */
export function lazyLoadImage(
  imgElement: HTMLImageElement,
  src: string,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          imgElement.src = src;
          imgElement.classList.add('opacity-0');
          imgElement.onload = () => {
            imgElement.classList.remove('opacity-0');
            imgElement.classList.add('opacity-100', 'transition-opacity', 'duration-300');
          };
          observer.unobserve(imgElement);
        }
      });
    },
    {
      rootMargin: '50px',
      ...options,
    }
  );

  observer.observe(imgElement);

  return () => observer.unobserve(imgElement);
}

/**
 * Preload resource
 */
export function preloadResource(href: string, as: string, type?: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) {
    link.type = type;
  }
  document.head.appendChild(link);
}

/**
 * Prefetch resource
 */
export function prefetchResource(href: string): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Measure performance
 */
export function measurePerformance(name: string, fn: () => void): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    
    performance.mark(startMark);
    fn();
    performance.mark(endMark);
    
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      console.log(`Performance [${name}]: ${measure.duration.toFixed(2)}ms`);
    } catch (e) {
      console.warn('Performance measurement failed:', e);
    }
  } else {
    fn();
  }
}

/**
 * Check if image is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Optimize image URL (add dimensions, format)
 */
export function optimizeImageUrl(
  url: string,
  width?: number,
  height?: number,
  format: 'webp' | 'avif' | 'jpg' = 'webp'
): string {
  // In production, integrate with image CDN (e.g., Cloudinary, Imgix)
  // For now, return original URL
  return url;
}

/**
 * Batch API requests
 */
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>,
  batchSize: number = 5
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((req) => req()));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Cache with expiration
 */
export class Cache<T> {
  private cache = new Map<string, { data: T; expires: number }>();

  set(key: string, data: T, ttl: number = 60000): void {
    const expires = Date.now() + ttl;
    this.cache.set(key, { data, expires });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (item && Date.now() <= item.expires) {
      return true;
    }
    if (item) {
      this.cache.delete(key);
    }
    return false;
  }
}

