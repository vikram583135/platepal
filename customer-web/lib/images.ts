/**
 * Image generation utilities for restaurants and food items
 * Uses Unsplash API for generating contextual images
 */

const UNSPLASH_BASE = 'https://source.unsplash.com';

/**
 * Generate a restaurant image based on restaurant name/cuisine
 */
export function getRestaurantImage(restaurantName?: string, cuisine?: string): string {
  if (!restaurantName && !cuisine) {
    return `${UNSPLASH_BASE}/400x300/?restaurant,food,indian`;
  }

  // Extract keywords from restaurant name
  const keywords = [
    restaurantName?.toLowerCase().replace(/[^a-z0-9]+/g, ','),
    cuisine?.toLowerCase(),
    'restaurant',
    'food',
    'indian'
  ].filter(Boolean).join(',');

  // Use Unsplash with search terms
  return `${UNSPLASH_BASE}/400x300/?${encodeURIComponent(keywords)}`;
}

/**
 * Generate a food item image based on item name
 */
export function getFoodImage(itemName: string, category?: string): string {
  if (!itemName) {
    return `${UNSPLASH_BASE}/200x200/?food,indian`;
  }

  // Extract keywords from item name and category
  const keywords = [
    itemName.toLowerCase().replace(/[^a-z0-9]+/g, ','),
    category?.toLowerCase(),
    'food',
    'indian',
    'dish'
  ].filter(Boolean).join(',');

  // Use Unsplash with search terms
  return `${UNSPLASH_BASE}/200x200/?${encodeURIComponent(keywords)}`;
}

/**
 * Fallback gradient placeholder generator
 */
export function getGradientPlaceholder(seed: string): string {
  // Generate consistent colors based on seed
  const colors = [
    'FF6B35,4ECDC4', // Primary/Secondary
    '4ECDC4,FFD93D', // Secondary/Accent
    'FF6B35,FFD93D', // Primary/Accent
    '26C281,4ECDC4', // Success/Secondary
  ];
  
  const colorIndex = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const [color1, color2] = colors[colorIndex].split(',');
  
  return `https://via.placeholder.com/400x300/${color1}/${color2}?text=${encodeURIComponent(seed)}`;
}

/**
 * Smart image getter with fallback
 */
export function getImageUrl(
  imageUrl: string | undefined,
  fallbackGenerator: () => string
): string {
  if (imageUrl && imageUrl.trim() && !imageUrl.includes('placeholder')) {
    return imageUrl;
  }
  return fallbackGenerator();
}

