/**
 * Google Gemini API Service
 * Provides AI-powered features: recommendations, natural language processing, reviews, dietary parsing
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const USE_AI = Boolean(API_KEY);

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (USE_AI) {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (error) {
    console.warn('Failed to initialize Gemini AI:', error);
  }
}

// Cache for AI responses (1 hour TTL)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCached(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Generate personalized recommendations using AI
 */
export async function generatePersonalizedRecommendations(
  userId: string | null,
  behaviorData: any,
  restaurants: any[],
  menuItems: any[],
  orderHistory: any[] = []
): Promise<{
  sections: Array<{
    title: string;
    reason: string;
    items: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      image: string;
      restaurantName: string;
      restaurantId: string;
      reason: string;
    }>;
  }>;
}> {
  const cacheKey = `recommendations_${userId}_${restaurants.length}_${Date.now()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (!USE_AI || !model) {
    return generateFallbackRecommendations(restaurants, menuItems, orderHistory);
  }

  try {
    const prompt = `
You are a food recommendation AI. Analyze the following data and provide personalized restaurant and dish recommendations.

User Order History: ${JSON.stringify(orderHistory.slice(0, 10))}
Available Restaurants: ${restaurants.length} restaurants
Current Time Context: ${new Date().toLocaleTimeString()}

Generate personalized recommendations in JSON format with the following structure:
{
  "sections": [
    {
      "title": "Section title (e.g., 'Based on your orders', 'Perfect for dinner', 'Trending now')",
      "reason": "Why this section is relevant",
      "items": [
        {
          "id": "item-id",
          "name": "Dish name",
          "description": "Brief description",
          "price": 299,
          "image": "image-url",
          "restaurantName": "Restaurant name",
          "restaurantId": "restaurant-id",
          "reason": "Why this is recommended (e.g., 'Ordered 3x', 'Popular at 7pm')"
        }
      ]
    }
  ]
}

Return ONLY valid JSON, no markdown formatting.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      setCache(cacheKey, parsed);
      return parsed;
    }
  } catch (error) {
    console.error('AI recommendation generation failed:', error);
  }

  return generateFallbackRecommendations(restaurants, menuItems, orderHistory);
}

/**
 * Parse natural language query into structured filters
 */
export async function parseNaturalLanguageQuery(
  query: string
): Promise<{
  cuisines: string[];
  dietaryRestrictions: string[];
  priceRange: { min: number; max: number } | null;
  location: string | null;
  keywords: string[];
}> {
  const cacheKey = `query_${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (!USE_AI || !model) {
    return parseFallbackQuery(query);
  }

  try {
    const prompt = `
Parse this food search query into structured filters: "${query}"

Return JSON only:
{
  "cuisines": ["list of cuisine types mentioned"],
  "dietaryRestrictions": ["vegan", "vegetarian", "gluten-free", "keto", etc.],
  "priceRange": {"min": 0, "max": 1000} or null,
  "location": "location mentioned" or null,
  "keywords": ["important keywords from query"]
}

If no specific value is mentioned, use empty array or null.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      setCache(cacheKey, parsed);
      return parsed;
    }
  } catch (error) {
    console.error('AI query parsing failed:', error);
  }

  return parseFallbackQuery(query);
}

/**
 * Suggest cart completion items
 */
export async function suggestCartCompletions(
  cartItems: any[],
  userHistory: any[],
  menuItems: any[]
): Promise<Array<{
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
  restaurantName: string;
  reason: string;
  type: 'complete-meal' | 'frequently-ordered' | 'people-also-ordered' | 'you-might-like';
}>> {
  const cacheKey = `cart_suggestions_${cartItems.map(i => i.id).join(',')}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (!USE_AI || !model) {
    return generateFallbackCartSuggestions(cartItems, menuItems);
  }

  try {
    const prompt = `
Suggest items to complete a meal based on current cart and user history.

Current Cart: ${JSON.stringify(cartItems)}
User Order History: ${JSON.stringify(userHistory.slice(0, 5))}
Available Menu Items: ${menuItems.length} items

Return JSON array of suggestions:
[
  {
    "id": "item-id",
    "name": "Item name",
    "description": "Description",
    "price": 199,
    "image": "image-url",
    "restaurantId": "restaurant-id",
    "restaurantName": "Restaurant name",
    "reason": "Why suggested (e.g., 'Complete your meal', 'Ordered 5 times')",
    "type": "complete-meal" | "frequently-ordered" | "people-also-ordered" | "you-might-like"
  }
]

Return max 6 suggestions. JSON only, no markdown.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      setCache(cacheKey, parsed);
      return parsed;
    }
  } catch (error) {
    console.error('AI cart suggestions failed:', error);
  }

  return generateFallbackCartSuggestions(cartItems, menuItems);
}

/**
 * Generate order status message
 */
export async function generateOrderStatusMessage(
  order: any,
  status: string,
  eta?: string
): Promise<string> {
  const cacheKey = `status_${order.id}_${status}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (!USE_AI || !model) {
    return generateFallbackStatusMessage(status, eta);
  }

  try {
    const prompt = `
Generate a friendly, conversational order status message.

Order Status: ${status}
ETA: ${eta || 'Not available'}
Order Items: ${order.items?.map((i: any) => i.name).join(', ') || 'N/A'}

Create a natural, empathetic message like:
- "Your driver, Alex, is just 5 minutes away!"
- "Your order is being prepared with extra care"
- "We noticed your order might be delayed by 5 minutes. We're working on it!"

Return only the message text, no quotes or formatting.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    
    // Clean up the response
    const message = text.replace(/^["']|["']$/g, '');
    setCache(cacheKey, message);
    return message;
  } catch (error) {
    console.error('AI status message generation failed:', error);
  }

  return generateFallbackStatusMessage(status, eta);
}

/**
 * Generate review suggestions
 */
export async function generateReviewSuggestions(
  order: any,
  items: any[],
  userHistory: any[]
): Promise<{
  prompts: string[];
  suggestions: string[];
  rating: number | null;
}> {
  if (!USE_AI || !model) {
    return generateFallbackReviewSuggestions(order, items);
  }

  try {
    const prompt = `
Generate review suggestions for this order.

Order: ${JSON.stringify(order)}
Items: ${JSON.stringify(items)}
User History: ${userHistory.length} previous orders

Return JSON:
{
  "prompts": ["How was the [Dish Name]? Was it spicy?", "Questions to ask user"],
  "suggestions": ["Pre-filled review text suggestions"],
  "rating": 4 or null (suggested rating based on order patterns)
}

JSON only, no markdown.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('AI review suggestions failed:', error);
  }

  return generateFallbackReviewSuggestions(order, items);
}

/**
 * Parse dietary requirements
 */
export async function parseDietaryRequirements(
  query: string
): Promise<{
  dietaryRestrictions: string[];
  allergens: string[];
  preferences: string[];
  complexRequirements: string[];
}> {
  const cacheKey = `dietary_${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (!USE_AI || !model) {
    return parseFallbackDietary(query);
  }

  try {
    const prompt = `
Parse dietary requirements from: "${query}"

Return JSON:
{
  "dietaryRestrictions": ["vegan", "vegetarian", "gluten-free", "keto", "paleo", etc.],
  "allergens": ["nuts", "dairy", "eggs", "soy", etc.],
  "preferences": ["spicy", "mild", "no-onions", etc.],
  "complexRequirements": ["low-fodmap", "no-added-sugar", etc.]
}

JSON only, no markdown.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      setCache(cacheKey, parsed);
      return parsed;
    }
  } catch (error) {
    console.error('AI dietary parsing failed:', error);
  }

  return parseFallbackDietary(query);
}

// ==================== FALLBACK FUNCTIONS ====================

function generateFallbackRecommendations(
  restaurants: any[],
  menuItems: any[],
  orderHistory: any[]
): any {
  const timeOfDay = new Date().getHours();
  let sectionTitle = 'Recommended for You';
  
  if (timeOfDay >= 6 && timeOfDay < 11) sectionTitle = 'Perfect for Breakfast';
  else if (timeOfDay >= 11 && timeOfDay < 15) sectionTitle = 'Great for Lunch';
  else if (timeOfDay >= 15 && timeOfDay < 21) sectionTitle = 'Perfect for Dinner';
  else sectionTitle = 'Late Night Cravings';

  // Get frequently ordered items
  const frequentItems = orderHistory
    .flatMap((o: any) => o.items || [])
    .reduce((acc: any, item: any) => {
      acc[item.id] = (acc[item.id] || 0) + 1;
      return acc;
    }, {});

  const topItems = Object.entries(frequentItems)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)
    .map(([id]) => menuItems.find((m: any) => m.id === id))
    .filter(Boolean);

  return {
    sections: [
      {
        title: sectionTitle,
        reason: 'Based on time of day',
        items: (menuItems.slice(0, 5) || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          restaurantName: restaurants.find((r: any) => r.id === item.restaurantId)?.name || 'Restaurant',
          restaurantId: item.restaurantId,
          reason: 'Popular choice',
        })),
      },
      ...(topItems.length > 0 ? [{
        title: 'Based on your orders',
        reason: 'You ordered these frequently',
        items: topItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          restaurantName: restaurants.find((r: any) => r.id === item.restaurantId)?.name || 'Restaurant',
          restaurantId: item.restaurantId,
          reason: `Ordered ${frequentItems[item.id]} times`,
        })),
      }] : []),
    ],
  };
}

function parseFallbackQuery(query: string): any {
  const lowerQuery = query.toLowerCase();
  const cuisines: string[] = [];
  const dietaryRestrictions: string[] = [];
  let priceRange: { min: number; max: number } | null = null;
  let location: string | null = null;
  const keywords: string[] = [];

  // Extract cuisines
  const cuisineKeywords: { [key: string]: string } = {
    'italian': 'Italian',
    'chinese': 'Chinese',
    'indian': 'Indian',
    'mexican': 'Mexican',
    'japanese': 'Japanese',
    'thai': 'Thai',
    'american': 'American',
  };

  Object.entries(cuisineKeywords).forEach(([key, value]) => {
    if (lowerQuery.includes(key)) cuisines.push(value);
  });

  // Extract dietary
  if (lowerQuery.includes('vegan')) dietaryRestrictions.push('vegan');
  if (lowerQuery.includes('vegetarian')) dietaryRestrictions.push('vegetarian');
  if (lowerQuery.includes('gluten-free')) dietaryRestrictions.push('gluten-free');
  if (lowerQuery.includes('keto')) dietaryRestrictions.push('keto');

  // Extract price
  const priceMatch = lowerQuery.match(/(?:under|below|less than|max|upto)\s*[₹]?(\d+)/);
  if (priceMatch) {
    priceRange = { min: 0, max: parseInt(priceMatch[1]) };
  }

  // Extract keywords
  const words = query.split(/\s+/).filter(w => w.length > 3);
  keywords.push(...words);

  return { cuisines, dietaryRestrictions, priceRange, location, keywords };
}

function generateFallbackCartSuggestions(cartItems: any[], menuItems: any[]): any[] {
  // Simple logic: suggest drinks and desserts
  const suggestions = menuItems
    .filter((item: any) => {
      const category = item.category?.toLowerCase() || '';
      return category.includes('drink') || category.includes('beverage') || 
             category.includes('dessert') || category.includes('sweet');
    })
    .slice(0, 6)
    .map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      restaurantId: item.restaurantId,
      restaurantName: 'Restaurant',
      reason: 'Complete your meal',
      type: 'complete-meal' as const,
    }));

  return suggestions;
}

function generateFallbackStatusMessage(status: string, eta?: string): string {
  const statusMessages: { [key: string]: string } = {
    'pending': 'Your order is being confirmed. We\'ll update you soon!',
    'confirmed': 'Your order has been confirmed and is being prepared.',
    'preparing': 'Your order is being prepared with care.',
    'ready': 'Your order is ready for pickup!',
    'out_for_delivery': eta ? `Your order is on the way! Arriving in about ${eta}` : 'Your order is on the way!',
    'delivered': 'Your order has been delivered. Enjoy your meal!',
  };

  return statusMessages[status] || `Your order status: ${status}`;
}

function generateFallbackReviewSuggestions(order: any, items: any[]): any {
  const prompts = items.map((item: any) => 
    `How was the ${item.name}? Was it delicious?`
  );

  const suggestions = [
    `Great food from ${order.restaurantName || 'the restaurant'}!`,
    `The ${items[0]?.name || 'food'} was amazing. Highly recommend!`,
  ];

  return { prompts, suggestions, rating: null };
}

function parseFallbackDietary(query: string): any {
  const lowerQuery = query.toLowerCase();
  const dietaryRestrictions: string[] = [];
  const allergens: string[] = [];
  const preferences: string[] = [];
  const complexRequirements: string[] = [];

  // Common dietary terms
  if (lowerQuery.includes('vegan')) dietaryRestrictions.push('vegan');
  if (lowerQuery.includes('vegetarian')) dietaryRestrictions.push('vegetarian');
  if (lowerQuery.includes('gluten-free')) dietaryRestrictions.push('gluten-free');
  if (lowerQuery.includes('keto')) dietaryRestrictions.push('keto');
  if (lowerQuery.includes('paleo')) dietaryRestrictions.push('paleo');

  // Allergens
  if (lowerQuery.includes('no nuts') || lowerQuery.includes('nut-free')) allergens.push('nuts');
  if (lowerQuery.includes('no dairy') || lowerQuery.includes('dairy-free')) allergens.push('dairy');
  if (lowerQuery.includes('no eggs') || lowerQuery.includes('egg-free')) allergens.push('eggs');

  // Preferences
  if (lowerQuery.includes('spicy')) preferences.push('spicy');
  if (lowerQuery.includes('mild')) preferences.push('mild');
  if (lowerQuery.includes('no onions')) preferences.push('no-onions');

  // Complex
  if (lowerQuery.includes('low-fodmap')) complexRequirements.push('low-fodmap');
  if (lowerQuery.includes('no-added-sugar')) complexRequirements.push('no-added-sugar');

  return { dietaryRestrictions, allergens, preferences, complexRequirements };
}

