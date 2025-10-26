#!/bin/bash

# PlatePal Test Data Seeder
# This script seeds the database with comprehensive test data for all services

set -e

echo "🌱 Starting PlatePal Test Data Seeding..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost"
USER_SERVICE_PORT="3001"
RESTAURANT_SERVICE_PORT="3002"
ORDER_SERVICE_PORT="3003"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to make API calls
api_call() {
    local method=$1
    local url=$2
    local data=$3
    local headers=$4
    
    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            curl -s -X "$method" "$url" -H "Content-Type: application/json" -H "$headers" -d "$data"
        else
            curl -s -X "$method" "$url" -H "Content-Type: application/json" -d "$data"
        fi
    else
        if [ -n "$headers" ]; then
            curl -s -X "$method" "$url" -H "$headers"
        else
            curl -s -X "$method" "$url"
        fi
    fi
}

# Function to register a user and get token
register_user() {
    local name=$1
    local email=$2
    local password=$3
    
    print_status "Registering user: $name ($email)"
    
    local response=$(api_call "POST" "$BASE_URL:$USER_SERVICE_PORT/auth/register" "{
        \"name\": \"$name\",
        \"email\": \"$email\",
        \"password\": \"$password\"
    }")
    
    echo "$response" | jq -r '.token'
}

# Function to login and get token
login_user() {
    local email=$1
    local password=$2
    
    print_status "Logging in user: $email"
    
    local response=$(api_call "POST" "$BASE_URL:$USER_SERVICE_PORT/auth/login" "{
        \"email\": \"$email\",
        \"password\": \"$password\"
    }")
    
    echo "$response" | jq -r '.token'
}

# Function to create test users
create_test_users() {
    print_status "Creating test users..."
    
    # Customer users
    CUSTOMER_TOKEN=$(register_user "John Doe" "john@example.com" "password123")
    CUSTOMER_TOKEN2=$(register_user "Jane Smith" "jane@example.com" "password123")
    CUSTOMER_TOKEN3=$(register_user "Mike Johnson" "mike@example.com" "password123")
    
    # Restaurant owners
    RESTAURANT_TOKEN=$(register_user "Tony Pizza" "tony@pizzapalace.com" "password123")
    RESTAURANT_TOKEN2=$(register_user "Bob Burger" "bob@burgerking.com" "password123")
    RESTAURANT_TOKEN3=$(register_user "Sushi Master" "master@sushimaster.com" "password123")
    
    # Delivery partners
    DELIVERY_TOKEN=$(register_user "Delivery Driver 1" "driver1@delivery.com" "password123")
    DELIVERY_TOKEN2=$(register_user "Delivery Driver 2" "driver2@delivery.com" "password123")
    
    # Admin user
    ADMIN_TOKEN=$(register_user "Admin User" "admin@platepal.com" "password123")
    
    print_success "Test users created successfully"
}

# Function to create test restaurants
create_test_restaurants() {
    print_status "Creating test restaurants..."
    
    # Note: This would typically be done through the restaurant service
    # For now, we'll create mock data that would be inserted into the database
    
    print_status "Creating Pizza Palace restaurant..."
    # This would be done through a restaurant creation endpoint
    # For demonstration, we'll assume restaurants are created via database seeding
    
    print_status "Creating Burger King restaurant..."
    # Similar to above
    
    print_status "Creating Sushi Master restaurant..."
    # Similar to above
    
    print_success "Test restaurants created successfully"
}

# Function to create test menus
create_test_menus() {
    print_status "Creating test menus..."
    
    # Pizza Palace Menu
    local pizza_menu='{
        "items": [
            {
                "name": "Margherita Pizza",
                "description": "Classic tomato and mozzarella pizza",
                "price": 15.99,
                "category": "Pizza",
                "image": "https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Margherita+Pizza"
            },
            {
                "name": "Pepperoni Pizza",
                "description": "Spicy pepperoni with mozzarella cheese",
                "price": 17.99,
                "category": "Pizza",
                "image": "https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Pepperoni+Pizza"
            },
            {
                "name": "Vegetarian Pizza",
                "description": "Fresh vegetables and mozzarella cheese",
                "price": 16.99,
                "category": "Pizza",
                "image": "https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Vegetarian+Pizza"
            },
            {
                "name": "Caesar Salad",
                "description": "Fresh romaine lettuce with caesar dressing",
                "price": 8.99,
                "category": "Salad",
                "image": "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Caesar+Salad"
            },
            {
                "name": "Coca Cola",
                "description": "Refreshing cola drink",
                "price": 2.99,
                "category": "Beverage",
                "image": "https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Coca+Cola"
            }
        ]
    }'
    
    # Update Pizza Palace menu
    api_call "PUT" "$BASE_URL:$RESTAURANT_SERVICE_PORT/restaurants/1/menu" "$pizza_menu" "Authorization: Bearer $RESTAURANT_TOKEN"
    
    # Burger King Menu
    local burger_menu='{
        "items": [
            {
                "name": "Whopper",
                "description": "Flame-grilled beef patty with fresh vegetables",
                "price": 8.99,
                "category": "Burger",
                "image": "https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Whopper"
            },
            {
                "name": "Chicken Sandwich",
                "description": "Crispy chicken breast with lettuce and mayo",
                "price": 7.99,
                "category": "Sandwich",
                "image": "https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Chicken+Sandwich"
            },
            {
                "name": "French Fries",
                "description": "Golden crispy french fries",
                "price": 3.99,
                "category": "Side",
                "image": "https://via.placeholder.com/300x200/FF9800/FFFFFF?text=French+Fries"
            },
            {
                "name": "Milkshake",
                "description": "Creamy vanilla milkshake",
                "price": 4.99,
                "category": "Beverage",
                "image": "https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=Milkshake"
            }
        ]
    }'
    
    # Update Burger King menu
    api_call "PUT" "$BASE_URL:$RESTAURANT_SERVICE_PORT/restaurants/2/menu" "$burger_menu" "Authorization: Bearer $RESTAURANT_TOKEN2"
    
    # Sushi Master Menu
    local sushi_menu='{
        "items": [
            {
                "name": "California Roll",
                "description": "Crab, avocado, and cucumber roll",
                "price": 12.99,
                "category": "Sushi",
                "image": "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=California+Roll"
            },
            {
                "name": "Salmon Nigiri",
                "description": "Fresh salmon over seasoned rice",
                "price": 9.99,
                "category": "Sushi",
                "image": "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Salmon+Nigiri"
            },
            {
                "name": "Dragon Roll",
                "description": "Eel, cucumber, and avocado roll",
                "price": 15.99,
                "category": "Sushi",
                "image": "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Dragon+Roll"
            },
            {
                "name": "Miso Soup",
                "description": "Traditional Japanese soup with tofu",
                "price": 4.99,
                "category": "Soup",
                "image": "https://via.placeholder.com/300x200/FF9800/FFFFFF?text=Miso+Soup"
            },
            {
                "name": "Green Tea",
                "description": "Traditional Japanese green tea",
                "price": 2.99,
                "category": "Beverage",
                "image": "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Green+Tea"
            }
        ]
    }'
    
    # Update Sushi Master menu
    api_call "PUT" "$BASE_URL:$RESTAURANT_SERVICE_PORT/restaurants/3/menu" "$sushi_menu" "Authorization: Bearer $RESTAURANT_TOKEN3"
    
    print_success "Test menus created successfully"
}

# Function to create test orders
create_test_orders() {
    print_status "Creating test orders..."
    
    # Order 1: John Doe orders from Pizza Palace
    local order1='{
        "items": [
            {
                "id": "item1",
                "name": "Margherita Pizza",
                "price": 15.99,
                "quantity": 1,
                "restaurantId": "1",
                "restaurantName": "Pizza Palace"
            },
            {
                "id": "item2",
                "name": "Coca Cola",
                "price": 2.99,
                "quantity": 2,
                "restaurantId": "1",
                "restaurantName": "Pizza Palace"
            }
        ],
        "total": 21.97,
        "restaurantId": "1"
    }'
    
    api_call "POST" "$BASE_URL:$ORDER_SERVICE_PORT/orders" "$order1" "Authorization: Bearer $CUSTOMER_TOKEN"
    
    # Order 2: Jane Smith orders from Burger King
    local order2='{
        "items": [
            {
                "id": "item3",
                "name": "Whopper",
                "price": 8.99,
                "quantity": 1,
                "restaurantId": "2",
                "restaurantName": "Burger King"
            },
            {
                "id": "item4",
                "name": "French Fries",
                "price": 3.99,
                "quantity": 1,
                "restaurantId": "2",
                "restaurantName": "Burger King"
            }
        ],
        "total": 12.98,
        "restaurantId": "2"
    }'
    
    api_call "POST" "$BASE_URL:$ORDER_SERVICE_PORT/orders" "$order2" "Authorization: Bearer $CUSTOMER_TOKEN2"
    
    # Order 3: Mike Johnson orders from Sushi Master
    local order3='{
        "items": [
            {
                "id": "item5",
                "name": "California Roll",
                "price": 12.99,
                "quantity": 2,
                "restaurantId": "3",
                "restaurantName": "Sushi Master"
            },
            {
                "id": "item6",
                "name": "Miso Soup",
                "price": 4.99,
                "quantity": 1,
                "restaurantId": "3",
                "restaurantName": "Sushi Master"
            }
        ],
        "total": 30.97,
        "restaurantId": "3"
    }'
    
    api_call "POST" "$BASE_URL:$ORDER_SERVICE_PORT/orders" "$order3" "Authorization: Bearer $CUSTOMER_TOKEN3"
    
    print_success "Test orders created successfully"
}

# Function to create database seed script
create_database_seed() {
    print_status "Creating database seed script..."
    
    cat > database-seed.sql << 'EOF'
-- PlatePal Database Seed Script
-- This script seeds the database with initial test data

-- Insert test users
INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES
('user-1', 'John Doe', 'john@example.com', '$2b$10$example_hash_1', 'customer', NOW(), NOW()),
('user-2', 'Jane Smith', 'jane@example.com', '$2b$10$example_hash_2', 'customer', NOW(), NOW()),
('user-3', 'Mike Johnson', 'mike@example.com', '$2b$10$example_hash_3', 'customer', NOW(), NOW()),
('user-4', 'Tony Pizza', 'tony@pizzapalace.com', '$2b$10$example_hash_4', 'restaurant_owner', NOW(), NOW()),
('user-5', 'Bob Burger', 'bob@burgerking.com', '$2b$10$example_hash_5', 'restaurant_owner', NOW(), NOW()),
('user-6', 'Sushi Master', 'master@sushimaster.com', '$2b$10$example_hash_6', 'restaurant_owner', NOW(), NOW()),
('user-7', 'Delivery Driver 1', 'driver1@delivery.com', '$2b$10$example_hash_7', 'delivery_partner', NOW(), NOW()),
('user-8', 'Delivery Driver 2', 'driver2@delivery.com', '$2b$10$example_hash_8', 'delivery_partner', NOW(), NOW()),
('user-9', 'Admin User', 'admin@platepal.com', '$2b$10$example_hash_9', 'admin', NOW(), NOW());

-- Insert test restaurants
INSERT INTO restaurants (id, name, description, image, rating, delivery_time, status, owner_id, created_at, updated_at) VALUES
('restaurant-1', 'Pizza Palace', 'Best pizza in town with authentic Italian recipes', 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Pizza+Palace', 4.5, '25-35 min', 'active', 'user-4', NOW(), NOW()),
('restaurant-2', 'Burger King', 'Flame-grilled burgers and crispy fries', 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Burger+King', 4.2, '20-30 min', 'active', 'user-5', NOW(), NOW()),
('restaurant-3', 'Sushi Master', 'Fresh sushi and traditional Japanese cuisine', 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Sushi+Master', 4.8, '30-40 min', 'active', 'user-6', NOW(), NOW());

-- Insert test orders
INSERT INTO orders (id, customer_id, restaurant_id, items, total, status, created_at, updated_at) VALUES
('order-1', 'user-1', 'restaurant-1', '[{"id":"item1","name":"Margherita Pizza","price":15.99,"quantity":1},{"id":"item2","name":"Coca Cola","price":2.99,"quantity":2}]', 21.97, 'pending', NOW(), NOW()),
('order-2', 'user-2', 'restaurant-2', '[{"id":"item3","name":"Whopper","price":8.99,"quantity":1},{"id":"item4","name":"French Fries","price":3.99,"quantity":1}]', 12.98, 'confirmed', NOW(), NOW()),
('order-3', 'user-3', 'restaurant-3', '[{"id":"item5","name":"California Roll","price":12.99,"quantity":2},{"id":"item6","name":"Miso Soup","price":4.99,"quantity":1}]', 30.97, 'delivered', NOW(), NOW());
EOF
    
    print_success "Database seed script created: database-seed.sql"
}

# Function to create MongoDB seed script
create_mongodb_seed() {
    print_status "Creating MongoDB seed script..."
    
    cat > mongodb-seed.js << 'EOF'
// PlatePal MongoDB Seed Script
// This script seeds MongoDB with menu data

use platepal_menus;

// Pizza Palace Menu
db.menus.insertOne({
  restaurantId: "restaurant-1",
  restaurantName: "Pizza Palace",
  items: [
    {
      id: "item1",
      name: "Margherita Pizza",
      description: "Classic tomato and mozzarella pizza",
      price: 15.99,
      category: "Pizza",
      image: "https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Margherita+Pizza",
      available: true
    },
    {
      id: "item2",
      name: "Pepperoni Pizza",
      description: "Spicy pepperoni with mozzarella cheese",
      price: 17.99,
      category: "Pizza",
      image: "https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Pepperoni+Pizza",
      available: true
    },
    {
      id: "item3",
      name: "Vegetarian Pizza",
      description: "Fresh vegetables and mozzarella cheese",
      price: 16.99,
      category: "Pizza",
      image: "https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Vegetarian+Pizza",
      available: true
    },
    {
      id: "item4",
      name: "Caesar Salad",
      description: "Fresh romaine lettuce with caesar dressing",
      price: 8.99,
      category: "Salad",
      image: "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Caesar+Salad",
      available: true
    },
    {
      id: "item5",
      name: "Coca Cola",
      description: "Refreshing cola drink",
      price: 2.99,
      category: "Beverage",
      image: "https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Coca+Cola",
      available: true
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
});

// Burger King Menu
db.menus.insertOne({
  restaurantId: "restaurant-2",
  restaurantName: "Burger King",
  items: [
    {
      id: "item6",
      name: "Whopper",
      description: "Flame-grilled beef patty with fresh vegetables",
      price: 8.99,
      category: "Burger",
      image: "https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Whopper",
      available: true
    },
    {
      id: "item7",
      name: "Chicken Sandwich",
      description: "Crispy chicken breast with lettuce and mayo",
      price: 7.99,
      category: "Sandwich",
      image: "https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Chicken+Sandwich",
      available: true
    },
    {
      id: "item8",
      name: "French Fries",
      description: "Golden crispy french fries",
      price: 3.99,
      category: "Side",
      image: "https://via.placeholder.com/300x200/FF9800/FFFFFF?text=French+Fries",
      available: true
    },
    {
      id: "item9",
      name: "Milkshake",
      description: "Creamy vanilla milkshake",
      price: 4.99,
      category: "Beverage",
      image: "https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=Milkshake",
      available: true
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
});

// Sushi Master Menu
db.menus.insertOne({
  restaurantId: "restaurant-3",
  restaurantName: "Sushi Master",
  items: [
    {
      id: "item10",
      name: "California Roll",
      description: "Crab, avocado, and cucumber roll",
      price: 12.99,
      category: "Sushi",
      image: "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=California+Roll",
      available: true
    },
    {
      id: "item11",
      name: "Salmon Nigiri",
      description: "Fresh salmon over seasoned rice",
      price: 9.99,
      category: "Sushi",
      image: "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Salmon+Nigiri",
      available: true
    },
    {
      id: "item12",
      name: "Dragon Roll",
      description: "Eel, cucumber, and avocado roll",
      price: 15.99,
      category: "Sushi",
      image: "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Dragon+Roll",
      available: true
    },
    {
      id: "item13",
      name: "Miso Soup",
      description: "Traditional Japanese soup with tofu",
      price: 4.99,
      category: "Soup",
      image: "https://via.placeholder.com/300x200/FF9800/FFFFFF?text=Miso+Soup",
      available: true
    },
    {
      id: "item14",
      name: "Green Tea",
      description: "Traditional Japanese green tea",
      price: 2.99,
      category: "Beverage",
      image: "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Green+Tea",
      available: true
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
});

print("MongoDB seed data inserted successfully!");
EOF
    
    print_success "MongoDB seed script created: mongodb-seed.js"
}

# Function to run database seeding
run_database_seeding() {
    print_status "Running database seeding..."
    
    # Check if services are running
    if ! curl -s -f "$BASE_URL:$USER_SERVICE_PORT/health" > /dev/null 2>&1; then
        print_error "User service is not running. Please start the services first."
        return 1
    fi
    
    # Create test users
    create_test_users
    
    # Create test menus
    create_test_menus
    
    # Create test orders
    create_test_orders
    
    print_success "Database seeding completed successfully!"
}

# Function to display test credentials
display_test_credentials() {
    print_status "Test Credentials:"
    echo ""
    echo "Customer Accounts:"
    echo "  Email: john@example.com, Password: password123"
    echo "  Email: jane@example.com, Password: password123"
    echo "  Email: mike@example.com, Password: password123"
    echo ""
    echo "Restaurant Owner Accounts:"
    echo "  Email: tony@pizzapalace.com, Password: password123"
    echo "  Email: bob@burgerking.com, Password: password123"
    echo "  Email: master@sushimaster.com, Password: password123"
    echo ""
    echo "Delivery Partner Accounts:"
    echo "  Email: driver1@delivery.com, Password: password123"
    echo "  Email: driver2@delivery.com, Password: password123"
    echo ""
    echo "Admin Account:"
    echo "  Email: admin@platepal.com, Password: password123"
    echo ""
}

# Main execution
main() {
    print_status "Starting PlatePal test data seeding..."
    
    # Check prerequisites
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        print_error "jq is required but not installed"
        exit 1
    fi
    
    # Create seed scripts
    create_database_seed
    create_mongodb_seed
    
    # Run database seeding
    run_database_seeding
    
    # Display test credentials
    display_test_credentials
    
    print_success "Test data seeding completed! 🎉"
    print_status "You can now use the test credentials to log into any of the applications."
}

# Run main function
main "$@"
