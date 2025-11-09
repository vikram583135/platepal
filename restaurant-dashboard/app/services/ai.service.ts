import axios from 'axios';

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3004';

// Get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// Dashboard Summary
export interface DashboardSummary {
  salesForecast: {
    predictedRevenue: number;
    confidence: number;
    reasoning: string;
    comparison: string;
  };
  popularItem: {
    name: string;
    orders: number;
    revenue: number;
    recommendation: string;
  };
  urgentAlerts: Array<{
    type: 'inventory' | 'opportunity' | 'warning';
    message: string;
    priority: 'high' | 'medium' | 'low';
    action?: string;
  }>;
}

export const getDashboardSummary = async (restaurantId: number): Promise<DashboardSummary> => {
  const token = getAuthToken();
  const { data } = await axios.post(
    `${AI_SERVICE_URL}/ai/dashboard/summary`,
    { restaurantId },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

// Analytics
export interface NaturalLanguageQueryResponse {
  answer: string;
  data?: any;
  visualization?: string;
}

export const processNaturalLanguageQuery = async (
  query: string,
  restaurantId: number,
  dataContext?: any,
): Promise<NaturalLanguageQueryResponse> => {
  const token = getAuthToken();
  const { data } = await axios.post(
    `${AI_SERVICE_URL}/ai/analytics/query`,
    { query, restaurantId, dataContext },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

export interface ChartInsights {
  insights: string[];
  trends: string[];
  recommendations: string[];
}

export const generateChartInsights = async (
  chartData: any,
  chartType: string,
  restaurantId: number,
): Promise<ChartInsights> => {
  const token = getAuthToken();
  const { data } = await axios.post(
    `${AI_SERVICE_URL}/ai/analytics/insights`,
    { chartData, chartType, restaurantId },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

// Orders
export interface OrderAnalysis {
  complexity: 'low' | 'medium' | 'high';
  complexityScore: number;
  estimatedPrepTime: number;
  flags: Array<'large' | 'complex' | 'high-priority' | 'vip'>;
  priority: number;
  reasoning: string;
}

export const analyzeOrder = async (
  order: any,
  restaurantId: number,
  kitchenLoad?: number,
): Promise<OrderAnalysis> => {
  const token = getAuthToken();
  const { data } = await axios.post(
    `${AI_SERVICE_URL}/ai/orders/analyze`,
    { order, restaurantId, kitchenLoad },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

export const prioritizeOrders = async (
  orders: any[],
  restaurantId: number,
): Promise<any[]> => {
  const token = getAuthToken();
  const { data } = await axios.post(
    `${AI_SERVICE_URL}/ai/orders/prioritize`,
    { orders, restaurantId },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

// Menu
export interface MenuItemAnalysis {
  itemId: string;
  name: string;
  performance: {
    revenue: number;
    orders: number;
    avgOrderValue: number;
    performanceScore: number;
  };
  comparison: {
    similarItems: string[];
    performanceVsSimilar: number;
  };
  recommendations: string[];
}

export const analyzeMenuPerformance = async (
  menuItems: any[],
  salesData: any[],
  restaurantId: number,
): Promise<MenuItemAnalysis[]> => {
  const token = getAuthToken();
  const { data } = await axios.post(
    `${AI_SERVICE_URL}/ai/menu/analyze`,
    { menuItems, salesData, restaurantId },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

export interface PricingSuggestion {
  currentPrice: number;
  suggestedPrice: number;
  reasoning: string;
  expectedImpact: {
    revenueChange: number;
    orderChange: number;
  };
  confidence: number;
}

export const suggestPricing = async (
  menuItem: any,
  salesHistory: any[],
  competitorPrices?: any[],
  restaurantId?: number,
): Promise<PricingSuggestion> => {
  const token = getAuthToken();
  const { data } = await axios.post(
    `${AI_SERVICE_URL}/ai/menu/pricing`,
    { menuItem, salesHistory, competitorPrices, restaurantId },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

export interface MenuRecommendations {
  recommendations: string[];
  topPerformers: string[];
  underperformers: string[];
}

export const getMenuRecommendations = async (
  menuItems: any[],
  salesData: any[],
  restaurantId: number,
): Promise<MenuRecommendations> => {
  const token = getAuthToken();
  const { data } = await axios.post(
    `${AI_SERVICE_URL}/ai/menu/recommendations`,
    { menuItems, salesData, restaurantId },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

// Reviews
export interface ReviewAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  themes: string[];
  keyPoints: string[];
  priority: 'high' | 'medium' | 'low';
}

export const analyzeReview = async (
  review: { comment: string; rating: number },
  restaurantId: number,
): Promise<ReviewAnalysis> => {
  const token = getAuthToken();
  const { data } = await axios.post(
    `${AI_SERVICE_URL}/ai/reviews/analyze`,
    { review, restaurantId },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

export interface ReviewReply {
  suggestedReply: string;
  tone: 'apologetic' | 'grateful' | 'professional' | 'friendly';
  confidence: number;
}

export const generateReviewReply = async (
  review: { comment: string; rating: number; sentiment?: string; themes?: string[] },
  restaurantId: number,
): Promise<ReviewReply> => {
  const token = getAuthToken();
  const { data } = await axios.post(
    `${AI_SERVICE_URL}/ai/reviews/generate-reply`,
    { review, restaurantId },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

// Promotions
export interface PromotionSuggestion {
  type: 'discount' | 'combo' | 'bogo' | 'time-based';
  title: string;
  description: string;
  items: string[];
  discountValue?: number;
  timeRange?: { start: string; end: string };
  reasoning: string;
  expectedImpact: {
    revenueIncrease: number;
    orderIncrease: number;
  };
  confidence: number;
}

export const suggestPromotions = async (
  salesData: any[],
  menuItems: any[],
  restaurantId: number,
  timeRange?: { start: string; end: string },
): Promise<PromotionSuggestion[]> => {
  const token = getAuthToken();
  const { data } = await axios.post(
    `${AI_SERVICE_URL}/ai/promotions/suggest`,
    { salesData, menuItems, restaurantId, timeRange },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

export interface PromotionPrediction {
  expectedRevenue: number;
  expectedOrders: number;
  revenueIncrease: number;
  orderIncrease: number;
  confidence: number;
  recommendations: string[];
}

export const predictPromotionImpact = async (
  promotion: any,
  salesHistory: any[],
  restaurantId: number,
): Promise<PromotionPrediction> => {
  const token = getAuthToken();
  const { data } = await axios.post(
    `${AI_SERVICE_URL}/ai/promotions/predict`,
    { promotion, salesHistory, restaurantId },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

