'use client';

import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatINR, formatINRCompact } from '@/lib/currency';
import { TrendingUp, BarChart3, Clock } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
  hour?: string;
  value?: number;
}

interface PeakHoursDataPoint {
  hour: string;
  orders: number;
}

interface AdvancedChartsProps {
  revenueData: ChartDataPoint[];
  orderVolumeData: ChartDataPoint[];
  peakHoursData: PeakHoursDataPoint[];
  loading?: boolean;
}

// Custom Tooltip for Revenue Chart
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface p-4 rounded-lg shadow-elevated border border-border">
        <p className="text-text-primary font-semibold mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-secondary text-sm">
            Revenue: <span className="font-bold">{formatINR(payload[0].value)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Orders Chart
const OrdersTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface p-4 rounded-lg shadow-elevated border border-border">
        <p className="text-text-primary font-semibold mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-primary text-sm">
            Orders: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function AdvancedCharts({ 
  revenueData, 
  orderVolumeData, 
  peakHoursData,
  loading = false 
}: AdvancedChartsProps) {
  
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface rounded-lg p-6 shadow-soft">
            <div className="h-6 w-48 bg-background rounded mb-4 animate-pulse"></div>
            <div className="h-80 bg-background rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Revenue Trend</h3>
              <p className="text-sm text-text-secondary">Daily revenue over time</p>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2ECC71" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#DFE4EA" />
            <XAxis 
              dataKey="date" 
              stroke="#7F8C9B" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#7F8C9B" 
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => formatINRCompact(value)}
            />
            <Tooltip content={<RevenueTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#2ECC71" 
              strokeWidth={3}
              fill="url(#revenueGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Order Volume Chart */}
      <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
              <BarChart3 className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Order Volume</h3>
              <p className="text-sm text-text-secondary">Number of orders per day</p>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={orderVolumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DFE4EA" />
            <XAxis 
              dataKey="date" 
              stroke="#7F8C9B" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#7F8C9B" 
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<OrdersTooltip />} />
            <Bar 
              dataKey="orders" 
              fill="url(#ordersGradient)" 
              radius={[8, 8, 0, 0]}
            />
            <defs>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5B4BB4" />
                <stop offset="100%" stopColor="#4A3A93" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Peak Hours Chart */}
      <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Peak Hours</h3>
              <p className="text-sm text-text-secondary">Busiest times of the day</p>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={peakHoursData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DFE4EA" />
            <XAxis 
              dataKey="hour" 
              stroke="#7F8C9B" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#7F8C9B" 
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #DFE4EA',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(91, 75, 180, 0.12)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="orders" 
              stroke="#FF9F43" 
              strokeWidth={3}
              dot={{ fill: '#FF9F43', r: 4 }}
              activeDot={{ r: 6 }}
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

