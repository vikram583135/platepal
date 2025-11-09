# AI Service

AI-powered microservice for restaurant dashboard insights and recommendations.

## Overview

This service provides AI-powered features for the restaurant dashboard including:
- Dashboard summaries with sales forecasts
- Natural language query processing for analytics
- Order analysis and prioritization
- Menu performance analysis and pricing optimization
- Review sentiment analysis and reply generation
- Smart promotion suggestions

## Features

### Dashboard
- Sales forecasting based on historical data
- Popular item identification
- Urgent alerts for inventory and opportunities

### Analytics
- Natural language query processing
- Chart insights and pattern detection

### Orders
- Order complexity analysis
- AI-based prioritization
- Optimal preparation time estimation

### Menu
- Performance analysis comparing items
- Pricing optimization suggestions
- Menu recommendations

### Reviews
- Sentiment analysis (positive/negative/neutral)
- Theme extraction
- AI-generated reply suggestions

### Promotions
- Data-driven promotion suggestions
- Impact prediction
- Promotion optimization

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
ORDER_SERVICE_URL=http://localhost:3003
RESTAURANT_SERVICE_URL=http://localhost:3002
PORT=3004
NODE_ENV=development
```

3. Run the service:
```bash
npm run start:dev
```

The service will run on `http://localhost:3004`

## API Endpoints

All endpoints are prefixed with `/ai`:

- `POST /ai/dashboard/summary` - Get AI dashboard summary
- `POST /ai/analytics/query` - Process natural language query
- `POST /ai/analytics/insights` - Generate chart insights
- `POST /ai/orders/analyze` - Analyze order complexity
- `POST /ai/orders/prioritize` - Prioritize orders
- `POST /ai/menu/analyze` - Analyze menu performance
- `POST /ai/menu/pricing` - Suggest pricing optimizations
- `POST /ai/menu/recommendations` - Get menu recommendations
- `POST /ai/reviews/analyze` - Analyze review sentiment
- `POST /ai/reviews/generate-reply` - Generate review reply
- `GET /ai/reviews/insights/:restaurantId` - Get aggregate review insights
- `POST /ai/promotions/suggest` - Suggest promotions
- `POST /ai/promotions/predict` - Predict promotion impact
- `POST /ai/promotions/optimize` - Optimize promotion

## OpenAI Integration

The service uses OpenAI GPT-4o-mini for text analysis and recommendations. When `OPENAI_API_KEY` is not configured, the service will return mock responses for development purposes.

## Docker

Build and run with Docker:
```bash
docker build -t ai-service .
docker run -p 3004:3004 --env-file .env ai-service
```

