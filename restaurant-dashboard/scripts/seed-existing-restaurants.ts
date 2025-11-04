/**
 * Add Menu Items to Existing Restaurants
 * Use this if restaurants already exist but need menu items added
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const USER_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001';

// Restaurant credentials (these should already exist)
const restaurants = [
  {
    email: 'italian@platepal.com',
    password: 'italian123',
    name: 'The Italian Bistro',
    dishes: [
      { name: 'Bruschetta Al Pomodoro', description: 'Toasted bread with fresh tomatoes, garlic, and basil', price: 299, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Caprese Salad', description: 'Fresh mozzarella, tomatoes, and basil with olive oil', price: 349, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Garlic Bread', description: 'Crispy bread with butter and garlic', price: 199, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Antipasto Platter', description: 'Assorted Italian meats and cheeses', price: 599, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Margherita Pizza', description: 'Classic pizza with tomato sauce, mozzarella, and basil', price: 449, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Pepperoni Pizza', description: 'Spicy pepperoni with cheese and tomato sauce', price: 549, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Spaghetti Carbonara', description: 'Creamy pasta with bacon and parmesan', price: 479, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Penne Arrabbiata', description: 'Spicy tomato sauce with garlic and chili', price: 399, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Lasagna Bolognese', description: 'Layered pasta with meat sauce and cheese', price: 529, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Risotto ai Funghi', description: 'Creamy rice with mixed mushrooms', price: 459, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Chicken Parmigiana', description: 'Breaded chicken with marinara and mozzarella', price: 599, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Seafood Linguine', description: 'Pasta with mixed seafood in garlic white wine sauce', price: 699, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Tiramisu', description: 'Classic Italian dessert with coffee and mascarpone', price: 299, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Panna Cotta', description: 'Creamy vanilla dessert with berry compote', price: 249, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Gelato (3 Scoops)', description: 'Italian ice cream in various flavors', price: 199, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Italian Espresso', description: 'Strong Italian coffee', price: 99, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Cappuccino', description: 'Coffee with steamed milk foam', price: 129, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Fresh Lemonade', description: 'Freshly squeezed lemon juice', price: 89, category: 'Beverages', isVegetarian: true, isAvailable: true },
    ]
  },
  // Add more restaurants here if needed - I'll just show one as an example
];

async function loginAndAddMenuItems(restaurant: typeof restaurants[0]) {
  try {
    console.log(`\n📍 Processing: ${restaurant.name}...`);
    
    // Login with existing credentials
    const loginResponse = await axios.post(`${USER_SERVICE_URL}/auth/login`, {
      email: restaurant.email,
      password: restaurant.password,
    });

    const token = loginResponse.data.accessToken || loginResponse.data.token;
    console.log(`✓ Logged in as ${restaurant.name}`);

    // Get restaurant ID
    const restaurantsResponse = await axios.get(`${API_BASE_URL}/restaurants`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const restaurantData = restaurantsResponse.data[0]; // Assuming first restaurant
    const restaurantId = restaurantData?.id;

    if (!restaurantId) {
      console.log(`⚠ No restaurant profile found, creating one...`);
      const createResponse = await axios.post(
        `${API_BASE_URL}/restaurants`,
        {
          name: restaurant.name,
          description: `Delicious ${restaurant.name} cuisine`,
          cuisineType: 'Various',
          address: '123 Food Street, Bangalore',
          phone: '+91 98765 43210',
          operatingHours: '9:00 AM - 11:00 PM',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(`✓ Created restaurant profile`);
    }

    // Get existing menu items
    const existingMenuResponse = await axios.get(`${API_BASE_URL}/menus`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const existingItems = existingMenuResponse.data || [];
    console.log(`📋 Found ${existingItems.length} existing menu items`);

    // Add menu items
    let added = 0;
    let skipped = 0;

    for (const dish of restaurant.dishes) {
      // Check if item already exists
      const exists = existingItems.some((item: any) => 
        item.name.toLowerCase() === dish.name.toLowerCase()
      );

      if (exists) {
        skipped++;
        continue;
      }

      try {
        await axios.post(
          `${API_BASE_URL}/menus`,
          {
            restaurantId,
            name: dish.name,
            description: dish.description,
            price: dish.price,
            category: dish.category,
            isVegetarian: dish.isVegetarian,
            isAvailable: dish.isAvailable,
            imageUrl: `https://via.placeholder.com/400x300/5B4BB4/FFFFFF?text=${encodeURIComponent(dish.name)}`,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        added++;
      } catch (error) {
        // Item might already exist, skip
        skipped++;
      }
    }

    console.log(`✓ Added ${added} new items, skipped ${skipped} existing items`);
    return { success: true, added, skipped };

  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message;
    console.error(`✗ Error processing ${restaurant.name}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Add Menu Items to Existing Restaurants');
  console.log('='.repeat(60));
  console.log(`\nProcessing ${restaurants.length} restaurant(s)...\n`);

  let totalAdded = 0;
  let totalSkipped = 0;
  let successCount = 0;

  for (const restaurant of restaurants) {
    const result = await loginAndAddMenuItems(restaurant);
    if (result.success && result.added !== undefined) {
      successCount++;
      totalAdded += result.added;
      totalSkipped += result.skipped || 0;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Successfully processed: ${successCount}/${restaurants.length} restaurants`);
  console.log(`✓ Total items added: ${totalAdded}`);
  console.log(`✓ Total items skipped: ${totalSkipped}`);
  console.log('\n' + '='.repeat(60));
}

main().catch(console.error);

