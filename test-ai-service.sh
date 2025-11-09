#!/bin/bash

# AI Service Testing Script
# Tests all AI endpoints and validates functionality

set -e

echo "🧪 Testing AI Service..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

AI_SERVICE_URL="http://localhost:3008"
BASE_URL="${AI_SERVICE_URL}/ai"

# Test health endpoint
echo -e "${BLUE}Testing health endpoint...${NC}"
if curl -f "${BASE_URL}/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi

# Test dashboard summary
echo -e "${BLUE}Testing dashboard summary endpoint...${NC}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/dashboard/summary" \
    -H "Content-Type: application/json" \
    -d '{"restaurantId": 1}')

if echo "$RESPONSE" | grep -q "salesForecast\|popularItem"; then
    echo -e "${GREEN}✅ Dashboard summary endpoint working${NC}"
else
    echo -e "${YELLOW}⚠️  Dashboard summary returned unexpected response${NC}"
fi

# Test analytics query
echo -e "${BLUE}Testing analytics query endpoint...${NC}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/analytics/query" \
    -H "Content-Type: application/json" \
    -d '{"query": "Compare weekend sales", "restaurantId": 1}')

if echo "$RESPONSE" | grep -q "answer\|data"; then
    echo -e "${GREEN}✅ Analytics query endpoint working${NC}"
else
    echo -e "${YELLOW}⚠️  Analytics query returned unexpected response${NC}"
fi

# Test order analysis
echo -e "${BLUE}Testing order analysis endpoint...${NC}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/orders/analyze" \
    -H "Content-Type: application/json" \
    -d '{"order": {"items": [{"name": "Test Item", "quantity": 2, "price": 100}], "totalPrice": 200}, "restaurantId": 1}')

if echo "$RESPONSE" | grep -q "complexity\|priority"; then
    echo -e "${GREEN}✅ Order analysis endpoint working${NC}"
else
    echo -e "${YELLOW}⚠️  Order analysis returned unexpected response${NC}"
fi

# Test review analysis
echo -e "${BLUE}Testing review analysis endpoint...${NC}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/reviews/analyze" \
    -H "Content-Type: application/json" \
    -d '{"review": {"comment": "Great food!", "rating": 5}, "restaurantId": 1}')

if echo "$RESPONSE" | grep -q "sentiment\|themes"; then
    echo -e "${GREEN}✅ Review analysis endpoint working${NC}"
else
    echo -e "${YELLOW}⚠️  Review analysis returned unexpected response${NC}"
fi

echo ""
echo -e "${GREEN}✨ AI Service Testing Complete!${NC}"

