'use client';

import { PlatformAnalytics as AnalyticsData } from '@/store/types';
import { formatINR, calculatePercentage, calculateGrowth } from '@/lib/currency';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface PlatformAnalyticsProps {
  analytics: AnalyticsData;
}

const COLORS = ['#3498DB', '#2ECC71', '#E67E22', '#9B59B6', '#1ABC9C'];

export default function PlatformAnalytics({ analytics }: PlatformAnalyticsProps) {
  const { overview, revenue, orders, users, restaurants, deliveryPartners } = analytics;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface shadow-elevated rounded-lg p-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Users</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{overview.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {overview.totalUsers > 0 ? (
                  <>
                    <ArrowTrendingUpIcon className="h-4 w-4 text-success mr-1" />
                    <span className="text-xs text-success">Active: {overview.activeUsers}</span>
                  </>
                ) : (
                  <span className="text-xs text-text-secondary">No data</span>
                )}
              </div>
            </div>
            <UsersIcon className="h-12 w-12 text-secondary opacity-50" />
          </div>
        </div>

        <div className="bg-surface shadow-elevated rounded-lg p-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Revenue</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{formatINR(overview.totalRevenue)}</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-success mr-1" />
                <span className="text-xs text-success">{calculateGrowth(overview.totalRevenue, overview.totalRevenue * 0.9)}</span>
              </div>
            </div>
            <CurrencyDollarIcon className="h-12 w-12 text-success opacity-50" />
          </div>
        </div>

        <div className="bg-surface shadow-elevated rounded-lg p-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Orders</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{overview.totalOrders.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-success mr-1" />
                <span className="text-xs text-success">{calculateGrowth(overview.totalOrders, overview.totalOrders * 0.9)}</span>
              </div>
            </div>
            <ShoppingBagIcon className="h-12 w-12 text-accent opacity-50" />
          </div>
        </div>

        <div className="bg-surface shadow-elevated rounded-lg p-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Avg Order Value</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{formatINR(overview.averageOrderValue)}</p>
              <p className="text-xs text-text-secondary mt-2">Across all orders</p>
            </div>
            <ArrowTrendingUpIcon className="h-12 w-12 text-primary opacity-50" />
          </div>
        </div>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface shadow-elevated rounded-lg p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Daily Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D5DBDB" />
                <XAxis dataKey="date" stroke="#7F8FA4" />
                <YAxis stroke="#7F8FA4" />
                <Tooltip 
                  formatter={(value: any) => [formatINR(value), 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3498DB" 
                  strokeWidth={2}
                  dot={{ fill: '#3498DB', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface shadow-elevated rounded-lg p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D5DBDB" />
                <XAxis dataKey="month" stroke="#7F8FA4" />
                <YAxis stroke="#7F8FA4" />
                <Tooltip 
                  formatter={(value: any) => [formatINR(value), 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="revenue" fill="#3498DB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Orders Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface shadow-elevated rounded-lg p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Orders by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(orders.byStatus).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => {
                    const { name, percent } = props;
                    return `${name}: ${((percent as number) * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(orders.byStatus).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface shadow-elevated rounded-lg p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Orders by Time of Day</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orders.byTimeOfDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D5DBDB" />
                <XAxis dataKey="hour" stroke="#7F8FA4" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                <YAxis stroke="#7F8FA4" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#E67E22" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Growth */}
      <div className="bg-surface shadow-elevated rounded-lg p-6 animate-fade-in">
        <h3 className="text-lg font-semibold text-text-primary mb-4">New Users</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={users.newUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D5DBDB" />
              <XAxis dataKey="date" stroke="#7F8FA4" />
              <YAxis stroke="#7F8FA4" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#2ECC71" 
                strokeWidth={2}
                dot={{ fill: '#2ECC71', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface shadow-elevated rounded-lg p-6 animate-fade-in">
          <h4 className="text-md font-semibold text-text-primary mb-4">Restaurants</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">Total</span>
              <span className="text-text-primary font-semibold">{restaurants.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Active</span>
              <span className="text-success font-semibold">{restaurants.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Pending</span>
              <span className="text-warning font-semibold">{restaurants.pendingApproval}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Suspended</span>
              <span className="text-error font-semibold">{restaurants.suspended}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface shadow-elevated rounded-lg p-6 animate-fade-in">
          <h4 className="text-md font-semibold text-text-primary mb-4">Delivery Partners</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">Total</span>
              <span className="text-text-primary font-semibold">{deliveryPartners.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Active</span>
              <span className="text-success font-semibold">{deliveryPartners.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">On Duty</span>
              <span className="text-info font-semibold">{deliveryPartners.onDuty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Avg Rating</span>
              <span className="text-text-primary font-semibold">{deliveryPartners.averageRating.toFixed(1)} ⭐</span>
            </div>
          </div>
        </div>

        <div className="bg-surface shadow-elevated rounded-lg p-6 animate-fade-in">
          <h4 className="text-md font-semibold text-text-primary mb-4">Orders</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">Avg Delivery Time</span>
              <span className="text-text-primary font-semibold">{orders.averageDeliveryTime} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">User Retention</span>
              <span className="text-success font-semibold">{(users.userRetention * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

