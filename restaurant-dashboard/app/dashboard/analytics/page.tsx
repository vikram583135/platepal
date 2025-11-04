'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, Download, Filter } from 'lucide-react';
import { formatINR, calculateGrowth } from '@/lib/currency';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'custom'>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Mock data - Replace with actual API calls
  const comparisonData = [
    { month: 'Jan', thisYear: 125000, lastYear: 98000 },
    { month: 'Feb', thisYear: 138000, lastYear: 105000 },
    { month: 'Mar', thisYear: 152000, lastYear: 118000 },
    { month: 'Apr', thisYear: 145000, lastYear: 125000 },
    { month: 'May', thisYear: 168000, lastYear: 135000 },
    { month: 'Jun', thisYear: 185000, lastYear: 148000 },
  ];

  const categoryData = [
    { name: 'Main Course', value: 45, revenue: 450000 },
    { name: 'Starters', value: 25, revenue: 250000 },
    { name: 'Desserts', value: 15, revenue: 150000 },
    { name: 'Beverages', value: 15, revenue: 150000 },
  ];

  const COLORS = ['#5B4BB4', '#2ECC71', '#FF9F43', '#3498DB'];

  const handleExport = () => {
    // Generate CSV content
    const csvContent = [
      ['Metric', 'Value'],
      ['Revenue Growth', calculateGrowth(185000, 148000)],
      ['Average Order Value', formatINR(850)],
      ['Customer Retention', '78%'],
      ...comparisonData.map(d => [d.month, formatINR(d.thisYear)]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-report-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Sales Analytics</h1>
          <p className="text-text-secondary mt-1">In-depth analysis of your restaurant performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-border rounded-lg p-1 bg-surface">
            <Filter size={16} className="text-text-secondary" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-1 border-0 bg-transparent text-text-primary focus:outline-none focus:ring-0"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-text-secondary">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
          <button
            onClick={handleExport}
            className="px-4 py-2 gradient-primary text-white rounded-lg hover-lift transition-all flex items-center gap-2 font-medium"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-secondary text-sm font-medium">Revenue Growth</h3>
            <TrendingUp className="text-success" size={20} />
          </div>
          <p className="text-3xl font-bold text-secondary">{calculateGrowth(185000, 148000)}</p>
          <p className="text-sm text-text-secondary mt-1">vs last year</p>
        </div>

        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-secondary text-sm font-medium">Average Order Value</h3>
            <TrendingUp className="text-success" size={20} />
          </div>
          <p className="text-3xl font-bold text-primary">{formatINR(850)}</p>
          <p className="text-sm text-text-secondary mt-1">vs {formatINR(720)} last month</p>
        </div>

        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-secondary text-sm font-medium">Customer Retention</h3>
            <TrendingUp className="text-success" size={20} />
          </div>
          <p className="text-3xl font-bold text-accent-dark">78%</p>
          <p className="text-sm text-text-secondary mt-1">+5% from last month</p>
        </div>
      </div>

      {/* Year-over-Year Comparison */}
      <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
        <h3 className="text-lg font-bold text-text-primary mb-6">Year-over-Year Revenue Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DFE4EA" />
            <XAxis dataKey="month" stroke="#7F8C9B" style={{ fontSize: '12px' }} />
            <YAxis stroke="#7F8C9B" style={{ fontSize: '12px' }} tickFormatter={(value) => `₹${value / 1000}K`} />
            <Tooltip formatter={(value: any) => formatINR(value)} />
            <Bar dataKey="thisYear" fill="#5B4BB4" name="2024" radius={[8, 8, 0, 0]} />
            <Bar dataKey="lastYear" fill="#DFE4EA" name="2023" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <h3 className="text-lg font-bold text-text-primary mb-6">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any, name: any, props: any) => [formatINR(props.payload.revenue), name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <h3 className="text-lg font-bold text-text-primary mb-6">Category Breakdown</h3>
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-text-primary font-medium">{category.name}</span>
                  </div>
                  <span className="text-text-primary font-bold">{formatINR(category.revenue)}</span>
                </div>
                <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${category.value}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

