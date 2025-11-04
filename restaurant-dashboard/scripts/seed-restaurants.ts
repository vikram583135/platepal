/**
 * Restaurant and Menu Items Seeding Script
 * Creates 10+ restaurant accounts with 15-20 dishes each
 * All prices in INR
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const USER_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001';

// Restaurant data with comprehensive menu items
const restaurants = [
  {
    name: 'The Italian Bistro',
    email: 'italian@platepal.com',
    password: 'italian123',
    phone: '+91 98765 43210',
    address: '123 MG Road, Bangalore, Karnataka 560001',
    cuisineType: 'Italian',
    description: 'Authentic Italian cuisine with wood-fired pizzas and fresh pasta',
    dishes: [
      // Starters
      { name: 'Bruschetta Al Pomodoro', description: 'Toasted bread with fresh tomatoes, garlic, and basil', price: 299, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Caprese Salad', description: 'Fresh mozzarella, tomatoes, and basil with olive oil', price: 349, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Garlic Bread', description: 'Crispy bread with butter and garlic', price: 199, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Antipasto Platter', description: 'Assorted Italian meats and cheeses', price: 599, category: 'Starters', isVegetarian: false, isAvailable: true },
      // Main Course
      { name: 'Margherita Pizza', description: 'Classic pizza with tomato sauce, mozzarella, and basil', price: 449, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Pepperoni Pizza', description: 'Spicy pepperoni with cheese and tomato sauce', price: 549, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Spaghetti Carbonara', description: 'Creamy pasta with bacon and parmesan', price: 479, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Penne Arrabbiata', description: 'Spicy tomato sauce with garlic and chili', price: 399, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Lasagna Bolognese', description: 'Layered pasta with meat sauce and cheese', price: 529, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Risotto ai Funghi', description: 'Creamy rice with mixed mushrooms', price: 459, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Chicken Parmigiana', description: 'Breaded chicken with marinara and mozzarella', price: 599, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Seafood Linguine', description: 'Pasta with mixed seafood in garlic white wine sauce', price: 699, category: 'Main Course', isVegetarian: false, isAvailable: true },
      // Desserts
      { name: 'Tiramisu', description: 'Classic Italian dessert with coffee and mascarpone', price: 299, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Panna Cotta', description: 'Creamy vanilla dessert with berry compote', price: 249, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Gelato (3 Scoops)', description: 'Italian ice cream in various flavors', price: 199, category: 'Desserts', isVegetarian: true, isAvailable: true },
      // Beverages
      { name: 'Italian Espresso', description: 'Strong Italian coffee', price: 99, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Cappuccino', description: 'Coffee with steamed milk foam', price: 129, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Fresh Lemonade', description: 'Freshly squeezed lemon juice', price: 89, category: 'Beverages', isVegetarian: true, isAvailable: true },
    ]
  },
  {
    name: 'Spice Palace',
    email: 'spice@platepal.com',
    password: 'spice123',
    phone: '+91 98765 43211',
    address: '456 Brigade Road, Bangalore, Karnataka 560025',
    cuisineType: 'North Indian',
    description: 'Authentic North Indian flavors with traditional recipes',
    dishes: [
      { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 299, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Chicken Tikka', description: 'Marinated grilled chicken pieces', price: 349, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Samosa (2 pcs)', description: 'Crispy pastry with spiced potato filling', price: 79, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Tandoori Chicken (Half)', description: 'Clay oven roasted chicken with spices', price: 399, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Butter Chicken', description: 'Creamy tomato gravy with tender chicken', price: 429, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Paneer Butter Masala', description: 'Cottage cheese in rich tomato cream sauce', price: 369, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Dal Makhani', description: 'Black lentils cooked in butter and cream', price: 299, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 449, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Veg Biryani', description: 'Mixed vegetables with aromatic rice', price: 349, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Rogan Josh', description: 'Spicy lamb curry with aromatic spices', price: 549, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Palak Paneer', description: 'Cottage cheese in spinach gravy', price: 329, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Naan (Plain)', description: 'Indian flatbread from clay oven', price: 49, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Garlic Naan', description: 'Naan bread with garlic topping', price: 69, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Gulab Jamun (2 pcs)', description: 'Sweet milk balls in sugar syrup', price: 89, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Rasmalai (2 pcs)', description: 'Soft cheese patties in sweet milk', price: 129, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Lassi (Sweet)', description: 'Refreshing yogurt drink', price: 79, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Masala Chai', description: 'Spiced Indian tea', price: 49, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Mango Lassi', description: 'Yogurt drink with mango pulp', price: 99, category: 'Beverages', isVegetarian: true, isAvailable: true },
    ]
  },
  {
    name: 'Tokyo Express',
    email: 'tokyo@platepal.com',
    password: 'tokyo123',
    phone: '+91 98765 43212',
    address: '789 Indiranagar, Bangalore, Karnataka 560038',
    cuisineType: 'Japanese',
    description: 'Fresh sushi and authentic Japanese dishes',
    dishes: [
      { name: 'Edamame', description: 'Steamed soybeans with sea salt', price: 199, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Vegetable Gyoza (5 pcs)', description: 'Pan-fried vegetable dumplings', price: 249, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Chicken Gyoza (5 pcs)', description: 'Pan-fried chicken dumplings', price: 279, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Miso Soup', description: 'Traditional Japanese soup with tofu', price: 149, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'California Roll (8 pcs)', description: 'Crab, avocado, and cucumber sushi', price: 399, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Vegetable Sushi Platter (12 pcs)', description: 'Assorted vegetable sushi', price: 449, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Salmon Nigiri (6 pcs)', description: 'Fresh salmon on rice', price: 599, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Chicken Teriyaki', description: 'Grilled chicken with teriyaki sauce', price: 499, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Vegetable Ramen', description: 'Noodle soup with mixed vegetables', price: 349, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Chicken Ramen', description: 'Noodle soup with tender chicken', price: 399, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Tempura Udon', description: 'Thick noodles with tempura', price: 429, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Yakisoba', description: 'Stir-fried noodles with vegetables', price: 369, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Mochi Ice Cream (3 pcs)', description: 'Japanese rice cake with ice cream', price: 199, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Matcha Cheesecake', description: 'Green tea flavored cheesecake', price: 249, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Green Tea', description: 'Traditional Japanese green tea', price: 79, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Sake (Hot)', description: 'Japanese rice wine', price: 299, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Ramune Soda', description: 'Japanese marble soda', price: 99, category: 'Beverages', isVegetarian: true, isAvailable: true },
    ]
  },
  {
    name: 'The Burger Joint',
    email: 'burger@platepal.com',
    password: 'burger123',
    phone: '+91 98765 43213',
    address: '321 Koramangala, Bangalore, Karnataka 560034',
    cuisineType: 'American',
    description: 'Gourmet burgers and American comfort food',
    dishes: [
      { name: 'Classic Fries', description: 'Crispy golden french fries', price: 149, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Loaded Fries', description: 'Fries with cheese, bacon, and sour cream', price: 249, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Chicken Wings (6 pcs)', description: 'Spicy buffalo wings with ranch', price: 329, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Onion Rings', description: 'Crispy battered onion rings', price: 199, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Classic Beef Burger', description: 'Beef patty with lettuce, tomato, and cheese', price: 399, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Chicken Burger', description: 'Crispy chicken patty with mayo and lettuce', price: 349, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Veggie Burger', description: 'Plant-based patty with fresh vegetables', price: 329, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Double Cheese Burger', description: 'Two beef patties with double cheese', price: 499, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'BBQ Bacon Burger', description: 'Beef with bacon and BBQ sauce', price: 549, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Mushroom Swiss Burger', description: 'Beef with sautéed mushrooms and Swiss cheese', price: 449, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Chicken Wrap', description: 'Grilled chicken with veggies in tortilla', price: 299, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Fish & Chips', description: 'Battered fish with french fries', price: 449, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Chocolate Brownie', description: 'Warm brownie with vanilla ice cream', price: 199, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Apple Pie', description: 'Classic apple pie with cinnamon', price: 179, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Milkshake (Chocolate)', description: 'Thick chocolate milkshake', price: 179, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Milkshake (Vanilla)', description: 'Classic vanilla milkshake', price: 179, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Cola', description: 'Chilled cola drink', price: 79, category: 'Beverages', isVegetarian: true, isAvailable: true },
    ]
  },
  {
    name: 'Dragon Wok',
    email: 'dragon@platepal.com',
    password: 'dragon123',
    phone: '+91 98765 43214',
    address: '654 Whitefield, Bangalore, Karnataka 560066',
    cuisineType: 'Chinese',
    description: 'Authentic Chinese cuisine with Szechuan specialties',
    dishes: [
      { name: 'Spring Rolls (4 pcs)', description: 'Crispy vegetable spring rolls', price: 199, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Chicken Spring Rolls (4 pcs)', description: 'Crispy chicken spring rolls', price: 229, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Veg Manchurian', description: 'Fried vegetable balls in spicy sauce', price: 249, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Chilli Chicken', description: 'Spicy chicken with bell peppers', price: 349, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Kung Pao Chicken', description: 'Spicy stir-fried chicken with peanuts', price: 399, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Sweet and Sour Chicken', description: 'Chicken in tangy sweet sauce', price: 379, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Szechuan Tofu', description: 'Spicy tofu with Szechuan peppers', price: 329, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Vegetable Fried Rice', description: 'Wok-fried rice with mixed vegetables', price: 249, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Chicken Fried Rice', description: 'Fried rice with tender chicken', price: 299, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Hakka Noodles (Veg)', description: 'Stir-fried noodles with vegetables', price: 269, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Hakka Noodles (Chicken)', description: 'Stir-fried noodles with chicken', price: 319, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Honey Chilli Potato', description: 'Crispy potato in honey chilli sauce', price: 249, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Peking Duck', description: 'Crispy duck with pancakes', price: 799, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Fried Banana', description: 'Crispy fried banana with honey', price: 149, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Date Pancake', description: 'Sweet pancake with date filling', price: 179, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Jasmine Tea', description: 'Fragrant Chinese tea', price: 79, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Hot and Sour Soup', description: 'Spicy and tangy Chinese soup', price: 149, category: 'Beverages', isVegetarian: true, isAvailable: true },
    ]
  },
  {
    name: 'Taco Fiesta',
    email: 'taco@platepal.com',
    password: 'taco123',
    phone: '+91 98765 43215',
    address: '987 HSR Layout, Bangalore, Karnataka 560102',
    cuisineType: 'Mexican',
    description: 'Vibrant Mexican flavors and fresh ingredients',
    dishes: [
      { name: 'Nachos Supreme', description: 'Tortilla chips with cheese, salsa, and guacamole', price: 299, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Quesadilla (Veg)', description: 'Grilled tortilla with cheese and vegetables', price: 249, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Quesadilla (Chicken)', description: 'Grilled tortilla with chicken and cheese', price: 299, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Guacamole & Chips', description: 'Fresh avocado dip with tortilla chips', price: 229, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Chicken Tacos (3 pcs)', description: 'Soft tacos with spiced chicken', price: 349, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Vegetarian Tacos (3 pcs)', description: 'Soft tacos with grilled vegetables', price: 299, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Beef Burrito', description: 'Large tortilla wrap with beef and beans', price: 449, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Vegetarian Burrito', description: 'Tortilla wrap with beans and vegetables', price: 379, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Chicken Enchiladas', description: 'Rolled tortillas with chicken and sauce', price: 429, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Fajitas (Chicken)', description: 'Sizzling chicken with peppers and onions', price: 499, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Fajitas (Veg)', description: 'Sizzling vegetables with peppers', price: 429, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Mexican Rice Bowl', description: 'Rice with beans, corn, and salsa', price: 329, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Churros (5 pcs)', description: 'Fried dough with cinnamon sugar', price: 179, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Tres Leches Cake', description: 'Three milk sponge cake', price: 229, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Horchata', description: 'Rice milk drink with cinnamon', price: 99, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Mexican Beer', description: 'Chilled Mexican beer', price: 249, category: 'Beverages', isVegetarian: true, isAvailable: true },
    ]
  },
  {
    name: 'South Spice Kitchen',
    email: 'southspice@platepal.com',
    password: 'south123',
    phone: '+91 98765 43216',
    address: '147 Jayanagar, Bangalore, Karnataka 560041',
    cuisineType: 'South Indian',
    description: 'Traditional South Indian delicacies',
    dishes: [
      { name: 'Idli (3 pcs)', description: 'Steamed rice cakes with chutney', price: 79, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Vada (2 pcs)', description: 'Fried lentil donuts with sambar', price: 89, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Medu Vada (3 pcs)', description: 'Crispy fried lentil rings', price: 99, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Sambar Idli', description: 'Idlis soaked in sambar', price: 99, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Masala Dosa', description: 'Crispy crepe with spiced potato filling', price: 129, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Plain Dosa', description: 'Crispy rice crepe', price: 89, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Rava Dosa', description: 'Crispy semolina crepe', price: 119, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Mysore Masala Dosa', description: 'Spicy dosa with red chutney', price: 149, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Uttapam (Onion)', description: 'Thick pancake with onion topping', price: 119, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Pongal', description: 'Rice and lentil dish with ghee', price: 99, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Curd Rice', description: 'Rice with yogurt and tempering', price: 89, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Bisi Bele Bath', description: 'Spicy rice with lentils and vegetables', price: 129, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Meals (Full)', description: 'Complete South Indian thali', price: 249, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Payasam', description: 'Sweet rice pudding', price: 89, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Kesari Bath', description: 'Sweet semolina dessert', price: 79, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Filter Coffee', description: 'Traditional South Indian coffee', price: 49, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Buttermilk', description: 'Spiced yogurt drink', price: 39, category: 'Beverages', isVegetarian: true, isAvailable: true },
    ]
  },
  {
    name: 'Mediterranean Grill',
    email: 'mediterranean@platepal.com',
    password: 'med123',
    phone: '+91 98765 43217',
    address: '258 Malleshwaram, Bangalore, Karnataka 560003',
    cuisineType: 'Mediterranean',
    description: 'Fresh Mediterranean cuisine with Greek and Lebanese flavors',
    dishes: [
      { name: 'Hummus with Pita', description: 'Chickpea dip with warm pita bread', price: 229, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Falafel (5 pcs)', description: 'Fried chickpea balls', price: 249, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Greek Salad', description: 'Fresh salad with feta cheese and olives', price: 279, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Baba Ganoush', description: 'Smoky eggplant dip with tahini', price: 249, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Chicken Shawarma Wrap', description: 'Grilled chicken in flatbread', price: 329, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Falafel Wrap', description: 'Falafel with tahini in flatbread', price: 269, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Lamb Kebabs', description: 'Grilled spiced lamb skewers', price: 549, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Chicken Souvlaki', description: 'Greek-style chicken skewers', price: 449, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Vegetable Moussaka', description: 'Baked eggplant casserole', price: 399, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Chicken Gyros Platter', description: 'Sliced chicken with rice and salad', price: 479, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Spanakopita', description: 'Spinach and feta pie', price: 299, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Mediterranean Rice Bowl', description: 'Rice with grilled vegetables and feta', price: 329, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Baklava (3 pcs)', description: 'Sweet pastry with nuts and honey', price: 199, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Turkish Delight', description: 'Assorted flavored jellies', price: 149, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Turkish Coffee', description: 'Strong traditional coffee', price: 99, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Mint Lemonade', description: 'Fresh lemon juice with mint', price: 89, category: 'Beverages', isVegetarian: true, isAvailable: true },
    ]
  },
  {
    name: 'Thai Orchid',
    email: 'thai@platepal.com',
    password: 'thai123',
    phone: '+91 98765 43218',
    address: '369 Marathahalli, Bangalore, Karnataka 560037',
    cuisineType: 'Thai',
    description: 'Authentic Thai cuisine with bold flavors',
    dishes: [
      { name: 'Tom Yum Soup', description: 'Spicy and sour Thai soup', price: 249, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Spring Rolls (Veg)', description: 'Fresh vegetable spring rolls', price: 199, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Chicken Satay', description: 'Grilled chicken skewers with peanut sauce', price: 329, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Papaya Salad', description: 'Spicy green papaya salad', price: 229, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Pad Thai (Chicken)', description: 'Stir-fried rice noodles with chicken', price: 399, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Pad Thai (Vegetarian)', description: 'Stir-fried noodles with vegetables', price: 349, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Green Curry (Chicken)', description: 'Chicken in coconut green curry', price: 429, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Red Curry (Vegetable)', description: 'Vegetables in red curry sauce', price: 379, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Basil Chicken', description: 'Spicy stir-fried chicken with basil', price: 399, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Massaman Curry', description: 'Mild curry with peanuts and potatoes', price: 429, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Thai Fried Rice', description: 'Stir-fried rice with vegetables and egg', price: 299, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Pineapple Fried Rice', description: 'Fried rice served in pineapple', price: 449, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Mango Sticky Rice', description: 'Sweet coconut rice with mango', price: 199, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Thai Custard', description: 'Coconut custard dessert', price: 149, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Thai Iced Tea', description: 'Sweet creamy tea', price: 99, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Coconut Water', description: 'Fresh tender coconut', price: 79, category: 'Beverages', isVegetarian: true, isAvailable: true },
    ]
  },
  {
    name: 'La Pizzeria',
    email: 'pizzeria@platepal.com',
    password: 'pizza123',
    phone: '+91 98765 43219',
    address: '741 Rajajinagar, Bangalore, Karnataka 560010',
    cuisineType: 'Italian',
    description: 'Wood-fired pizzas and Italian classics',
    dishes: [
      { name: 'Garlic Bread Sticks', description: 'Crispy breadsticks with garlic butter', price: 179, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Cheese Garlic Bread', description: 'Garlic bread topped with cheese', price: 229, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Caesar Salad', description: 'Romaine lettuce with Caesar dressing', price: 249, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Minestrone Soup', description: 'Italian vegetable soup', price: 179, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Margherita Pizza (10")', description: 'Classic tomato, mozzarella, basil', price: 399, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Veggie Supreme Pizza (10")', description: 'Mixed vegetables with cheese', price: 449, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'BBQ Chicken Pizza (10")', description: 'Chicken with BBQ sauce', price: 499, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Four Cheese Pizza (10")', description: 'Mozzarella, cheddar, parmesan, feta', price: 529, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Meat Lovers Pizza (10")', description: 'Pepperoni, sausage, bacon, ham', price: 599, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Mushroom Truffle Pizza (10")', description: 'Mushrooms with truffle oil', price: 549, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Alfredo Pasta', description: 'Fettuccine in cream sauce', price: 399, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Pasta Arrabiata', description: 'Spicy tomato sauce pasta', price: 349, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Cannoli (2 pcs)', description: 'Sicilian pastry with sweet filling', price: 199, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Affogato', description: 'Vanilla gelato with espresso', price: 179, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Italian Soda', description: 'Flavored sparkling soda', price: 99, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Iced Latte', description: 'Cold coffee with milk', price: 149, category: 'Beverages', isVegetarian: true, isAvailable: true },
    ]
  },
  {
    name: 'Biryani Blues',
    email: 'biryani@platepal.com',
    password: 'biryani123',
    phone: '+91 98765 43220',
    address: '852 BTM Layout, Bangalore, Karnataka 560076',
    cuisineType: 'Mughlai',
    description: 'Authentic Hyderabadi biryanis and Mughlai cuisine',
    dishes: [
      { name: 'Chicken 65', description: 'Spicy fried chicken appetizer', price: 299, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Mutton Seekh Kebab', description: 'Grilled minced lamb kebabs', price: 399, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Paneer Tikka Roll', description: 'Paneer tikka wrapped in paratha', price: 249, category: 'Starters', isVegetarian: true, isAvailable: true },
      { name: 'Chicken Tikka Roll', description: 'Chicken tikka wrapped in paratha', price: 279, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Hyderabadi Chicken Biryani', description: 'Authentic Hyderabadi chicken biryani', price: 499, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Mutton Biryani', description: 'Tender mutton with fragrant rice', price: 599, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Vegetable Biryani', description: 'Mixed vegetables with basmati rice', price: 379, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Egg Biryani', description: 'Boiled eggs with spiced rice', price: 329, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Paneer Biryani', description: 'Cottage cheese with aromatic rice', price: 399, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Chicken Korma', description: 'Mild chicken curry with cream', price: 449, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Mutton Rogan Josh', description: 'Kashmiri lamb curry', price: 549, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Hyderabadi Marag', description: 'Mutton soup with spices', price: 199, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Raita (Large)', description: 'Yogurt with cucumber and spices', price: 79, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Double Ka Meetha', description: 'Bread pudding dessert', price: 129, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Qubani Ka Meetha', description: 'Apricot dessert', price: 149, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Irani Chai', description: 'Special Hyderabadi tea', price: 49, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Sharbat', description: 'Sweet rose flavored drink', price: 79, category: 'Beverages', isVegetarian: true, isAvailable: true },
    ]
  },
  {
    name: 'Coastal Catch',
    email: 'coastal@platepal.com',
    password: 'coastal123',
    phone: '+91 98765 43221',
    address: '963 JP Nagar, Bangalore, Karnataka 560078',
    cuisineType: 'Seafood',
    description: 'Fresh seafood and coastal delicacies',
    dishes: [
      { name: 'Fish Fingers', description: 'Crispy fried fish strips', price: 329, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Prawn Tempura', description: 'Battered fried prawns', price: 449, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Calamari Rings', description: 'Fried squid rings', price: 399, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Fish Tikka', description: 'Grilled spiced fish chunks', price: 379, category: 'Starters', isVegetarian: false, isAvailable: true },
      { name: 'Fish Curry', description: 'Traditional fish curry with spices', price: 429, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Prawn Masala', description: 'Prawns in spicy gravy', price: 549, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Crab Curry (Kerala Style)', description: 'Crab in coconut curry', price: 699, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Lobster Thermidor', description: 'Baked lobster with cheese', price: 1299, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Grilled Fish', description: 'Marinated grilled fish fillet', price: 499, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Seafood Platter', description: 'Mix of fish, prawns, and calamari', price: 899, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Prawn Biryani', description: 'Prawns with fragrant rice', price: 529, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Fish Fry (Pomfret)', description: 'Crispy fried whole fish', price: 599, category: 'Main Course', isVegetarian: false, isAvailable: true },
      { name: 'Coconut Rice', description: 'Rice cooked in coconut milk', price: 149, category: 'Main Course', isVegetarian: true, isAvailable: true },
      { name: 'Coconut Jelly', description: 'Soft coconut dessert', price: 149, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Banana Fritters', description: 'Fried banana in batter', price: 129, category: 'Desserts', isVegetarian: true, isAvailable: true },
      { name: 'Sol Kadi', description: 'Kokum and coconut drink', price: 79, category: 'Beverages', isVegetarian: true, isAvailable: true },
      { name: 'Lime Soda', description: 'Fresh lime with soda', price: 69, category: 'Beverages', isVegetarian: true, isAvailable: true },
    ]
  },
];

interface RestaurantCredential {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  cuisineType: string;
  dishCount: number;
  token?: string;
  restaurantId?: string;
}

const credentials: RestaurantCredential[] = [];

async function registerRestaurant(restaurant: typeof restaurants[0]) {
  try {
    console.log(`\nRegistering: ${restaurant.name}...`);
    
    // Register the restaurant owner - try multiple endpoint variations
    let registerResponse;
    let token;
    
    try {
      // Try the standard registration endpoint with role
      registerResponse = await axios.post(`${USER_SERVICE_URL}/auth/register`, {
        name: restaurant.name,
        email: restaurant.email,
        password: restaurant.password,
        role: 'RESTAURANT',
        phone: restaurant.phone,
        address: restaurant.address,
      });
      token = registerResponse.data.accessToken || registerResponse.data.token;
    } catch (firstError: any) {
      // If that fails, try without the role
      try {
        registerResponse = await axios.post(`${USER_SERVICE_URL}/auth/register`, {
          name: restaurant.name,
          email: restaurant.email,
          password: restaurant.password,
          phone: restaurant.phone,
          address: restaurant.address,
        });
        token = registerResponse.data.accessToken || registerResponse.data.token;
      } catch (secondError: any) {
        throw firstError; // Throw the first error for better debugging
      }
    }

    console.log(`✓ Registered ${restaurant.name}`);

    // Create restaurant profile
    const restaurantResponse = await axios.post(
      `${API_BASE_URL}/restaurants`,
      {
        name: restaurant.name,
        description: restaurant.description,
        cuisineType: restaurant.cuisineType,
        address: restaurant.address,
        phone: restaurant.phone,
        operatingHours: '9:00 AM - 11:00 PM',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const restaurantId = restaurantResponse.data.id;
    console.log(`✓ Created restaurant profile`);

    // Add menu items
    let successCount = 0;
    for (const dish of restaurant.dishes) {
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
        successCount++;
      } catch (error) {
        console.log(`  ✗ Failed to add: ${dish.name}`);
      }
    }

    console.log(`✓ Added ${successCount}/${restaurant.dishes.length} menu items`);

    // Store credentials
    credentials.push({
      name: restaurant.name,
      email: restaurant.email,
      password: restaurant.password,
      phone: restaurant.phone,
      address: restaurant.address,
      cuisineType: restaurant.cuisineType,
      dishCount: successCount,
      token,
      restaurantId,
    });

    return { success: true, dishCount: successCount };
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message;
    const errorDetails = error.response?.data || '';
    console.error(`✗ Error registering ${restaurant.name}:`, errorMsg);
    if (errorDetails && typeof errorDetails === 'object') {
      console.error('   Error details:', JSON.stringify(errorDetails, null, 2));
    }
    if (error.response?.status) {
      console.error(`   Status code: ${error.response.status}`);
    }
    return { success: false, error: errorMsg };
  }
}

async function generateCredentialsFile() {
  const credentialsPath = path.join(process.cwd(), 'RESTAURANT_CREDENTIALS.md');
  
  let content = '# Restaurant Dashboard Credentials\n\n';
  content += '**Total Restaurants**: ' + credentials.length + '\n\n';
  content += '**All prices are in INR (₹)**\n\n';
  content += '---\n\n';

  // Summary Table
  content += '## Quick Reference Table\n\n';
  content += '| Restaurant Name | Email | Password | Cuisine | Dishes |\n';
  content += '|----------------|--------|----------|---------|--------|\n';
  
  credentials.forEach(cred => {
    content += `| ${cred.name} | ${cred.email} | ${cred.password} | ${cred.cuisineType} | ${cred.dishCount} |\n`;
  });

  content += '\n---\n\n';

  // Detailed Information
  content += '## Detailed Information\n\n';
  
  credentials.forEach((cred, index) => {
    content += `### ${index + 1}. ${cred.name}\n\n`;
    content += `- **Email**: \`${cred.email}\`\n`;
    content += `- **Password**: \`${cred.password}\`\n`;
    content += `- **Phone**: ${cred.phone}\n`;
    content += `- **Address**: ${cred.address}\n`;
    content += `- **Cuisine Type**: ${cred.cuisineType}\n`;
    content += `- **Total Menu Items**: ${cred.dishCount}\n`;
    content += `- **Restaurant ID**: ${cred.restaurantId}\n\n`;
  });

  content += '---\n\n';
  content += '## How to Login\n\n';
  content += '1. Navigate to: `http://localhost:3004/login` (or your restaurant dashboard URL)\n';
  content += '2. Use any email/password combination from the table above\n';
  content += '3. Access your restaurant dashboard\n\n';
  content += '---\n\n';
  content += '*Generated on: ' + new Date().toLocaleString() + '*\n';

  fs.writeFileSync(credentialsPath, content, 'utf-8');
  console.log(`\n✓ Credentials file generated: ${credentialsPath}`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('Restaurant & Menu Seeding Script');
  console.log('='.repeat(60));
  console.log(`\nTarget: ${restaurants.length} restaurants with 15-20 dishes each`);
  console.log('All prices in INR (₹)\n');
  
  let successCount = 0;
  let totalDishes = 0;

  for (const restaurant of restaurants) {
    const result = await registerRestaurant(restaurant);
    if (result.success && result.dishCount) {
      successCount++;
      totalDishes += result.dishCount;
    }
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('SEEDING SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Successfully created: ${successCount}/${restaurants.length} restaurants`);
  console.log(`✓ Total menu items added: ${totalDishes}`);
  console.log(`✓ Average dishes per restaurant: ${(totalDishes / successCount).toFixed(1)}`);

  if (credentials.length > 0) {
    await generateCredentialsFile();
  }

  console.log('\n' + '='.repeat(60));
  console.log('SEEDING COMPLETE!');
  console.log('='.repeat(60));
  console.log('\nCheck RESTAURANT_CREDENTIALS.md for login details\n');
}

// Run the seeding script
main().catch(console.error);

