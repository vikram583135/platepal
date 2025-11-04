'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useEarningsStore } from '@/lib/store';
import { formatINR, formatINRCompact } from '@/lib/utils';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Package, Calendar, Download, ChevronDown, Target, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface EarningsData {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  deliveries: number;
  averagePerDelivery: number;
}

export default function EarningsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { totalEarnings, todayEarnings, completedDeliveries, updateEarnings } = useEarningsStore();
  const [earningsData, setEarningsData] = useState<EarningsData>({
    total: totalEarnings,
    today: todayEarnings,
    thisWeek: 0,
    thisMonth: 0,
    deliveries: completedDeliveries,
    averagePerDelivery: completedDeliveries > 0 ? totalEarnings / completedDeliveries : 0,
  });
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    // In a real app, this would fetch from API
    // For now, use store data
    setEarningsData({
      total: totalEarnings,
      today: todayEarnings,
      thisWeek: todayEarnings * 7, // Mock data
      thisMonth: todayEarnings * 30, // Mock data
      deliveries: completedDeliveries,
      averagePerDelivery: completedDeliveries > 0 ? totalEarnings / completedDeliveries : 0,
    });
  }, [token, totalEarnings, todayEarnings, completedDeliveries, router]);

  const handleExport = () => {
    toast.success('Exporting earnings data...', {
      icon: '📊',
      duration: 2000,
    });
    // In real app, would trigger CSV/PDF export
    setTimeout(() => {
      toast.success('Earnings data exported successfully!', {
        icon: '✅',
      });
    }, 1500);
  };

  // Calculate trends (mock - in real app would compare with previous period)
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, direction: 'neutral' };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  };

  const todayTrend = calculateTrend(earningsData.today, earningsData.today * 0.9);
  const weekTrend = calculateTrend(earningsData.thisWeek, earningsData.thisWeek * 0.85);

  // Simple bar chart data for visualization
  const weeklyData = [200, 350, 280, 420, 380, 450, todayEarnings];
  const maxWeekly = Math.max(...weeklyData, 1);

  const stats = [
    {
      label: 'Total Earnings',
      value: formatINR(earningsData.total),
      icon: DollarSign,
      color: 'text-status-active',
      bgColor: 'bg-primary-light',
      gradient: 'from-primary-light to-primary/20',
      trend: null,
    },
    {
      label: 'Today',
      value: formatINR(earningsData.today),
      icon: Calendar,
      color: 'text-status-available',
      bgColor: 'bg-status-available/10',
      gradient: 'from-status-available/10 to-status-available/5',
      trend: todayTrend,
    },
    {
      label: 'This Week',
      value: formatINR(earningsData.thisWeek),
      icon: TrendingUp,
      color: 'text-accent-dark',
      bgColor: 'bg-accent/10',
      gradient: 'from-accent/10 to-accent/5',
      trend: weekTrend,
    },
    {
      label: 'Completed Deliveries',
      value: earningsData.deliveries.toString(),
      icon: Package,
      color: 'text-status-completed',
      bgColor: 'bg-status-completed/10',
      gradient: 'from-status-completed/10 to-status-completed/5',
      trend: null,
    },
  ];

  const breakdown = [
    { label: 'Average per Delivery', value: formatINR(earningsData.averagePerDelivery) },
    { label: 'This Month', value: formatINR(earningsData.thisMonth) },
    { label: 'Total Deliveries', value: earningsData.deliveries.toString() },
  ];

  return (
    <div className="min-h-screen bg-neutral-background">
      {/* Enhanced Header */}
      <div className="gradient-primary text-white p-5 sticky top-0 z-40 shadow-xl-glow">
        <div className="flex items-center gap-4 animate-slide-down mb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-white/10 rounded-full active:scale-95 transition-transform touch-target"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Earnings</h1>
            <p className="text-sm opacity-90">Track your delivery earnings</p>
          </div>
          <button
            onClick={handleExport}
            className="p-2 hover:bg-white/10 rounded-full active:scale-95 transition-transform touch-target"
            aria-label="Export earnings"
            title="Export earnings data"
          >
            <Download size={22} />
          </button>
        </div>
        {/* Date Range Picker */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {(['today', 'week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              aria-label={`Filter earnings by ${range}`}
              aria-pressed={dateRange === range}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary ${
                dateRange === range
                  ? 'bg-white text-primary shadow-lg'
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Enhanced Stats Grid with Trends */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-5 shadow-xl border border-primary/10 hover-lift animate-fade-in-up animate-stagger-${index} relative overflow-hidden`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative z-10">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
                    <Icon size={24} className={stat.color} />
                  </div>
                  <p className="text-sm font-semibold text-neutral-text-secondary mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-bold ${stat.color} animate-fade-in`}>{stat.value}</p>
                    {stat.trend && stat.trend.direction !== 'neutral' && (
                      <div className={`flex items-center gap-1 text-xs font-bold ${
                        stat.trend.direction === 'up' ? 'text-success' : 'text-error'
                      }`}>
                        {stat.trend.direction === 'up' ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                        <span>{stat.trend.value.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                  {stat.trend && stat.trend.direction !== 'neutral' && (
                    <p className={`text-xs mt-1 ${stat.trend.direction === 'up' ? 'text-success' : 'text-error'}`}>
                      vs previous period
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Chart Visualization */}
        <div className="bg-gradient-to-br from-neutral-surface to-white rounded-xl p-6 shadow-xl border border-primary/10 animate-fade-in-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 size={24} className="text-primary" />
              <h2 className="text-xl font-bold text-neutral-text-primary">Weekly Earnings</h2>
            </div>
            <span className="text-sm text-neutral-text-secondary">Last 7 days</span>
          </div>
          <div className="h-48 flex items-end justify-between gap-2" role="img" aria-label="Weekly earnings chart">
            {weeklyData.map((value, index) => {
              const height = (value / maxWeekly) * 100;
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end relative group">
                    <div
                      className="w-full bg-gradient-to-t from-primary to-primary-hover rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative"
                      style={{ height: `${height}%`, minHeight: '8px' }}
                      role="presentation"
                      aria-label={`${days[index]}: ₹${value}`}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neutral-text-primary text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" role="tooltip">
                        ₹{value}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-text-secondary font-medium">{days[index]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Earnings Breakdown */}
        <div className="bg-gradient-to-br from-neutral-surface to-white rounded-xl p-6 shadow-xl border border-primary/10 animate-fade-in-up">
          <h2 className="text-xl font-bold text-neutral-text-primary mb-5 flex items-center gap-2">
            <DollarSign size={24} className="text-primary" />
            Earnings Breakdown
          </h2>
          <div className="space-y-3">
            {breakdown.map((item, index) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-4 bg-primary-light/5 rounded-lg border border-primary/10 hover:bg-primary-light/10 transition-colors"
              >
                <span className="font-semibold text-neutral-text-primary">{item.label}</span>
                <span className="font-bold text-status-active text-xl">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Recent Earnings Timeline */}
        <div className="bg-gradient-to-br from-neutral-surface to-white rounded-xl p-6 shadow-xl border border-primary/10 animate-fade-in-up">
          <h2 className="text-xl font-bold text-neutral-text-primary mb-5 flex items-center gap-2">
            <Calendar size={24} className="text-primary" />
            Recent Earnings
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i, index) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-neutral-background to-white rounded-xl border border-neutral-border hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <Package size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-neutral-text-primary">Order #{String(1000 + i).slice(-6)}</p>
                  <p className="text-sm text-neutral-text-secondary flex items-center gap-1">
                    <Calendar size={12} />
                    Today, {2 + index}:30 PM
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-status-active text-lg">{formatINR(150 * i)}</p>
                  <p className="text-xs text-neutral-text-secondary">Earnings</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Tracking Visualization */}
        <div className="bg-gradient-to-br from-primary-light to-primary/10 rounded-xl p-6 shadow-xl border-2 border-primary/20 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <Target size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-neutral-text-primary text-lg">Daily Goal</h3>
              <p className="text-sm text-neutral-text-secondary">Track your progress</p>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-neutral-text-primary">
                ₹{formatINR(earningsData.today)} / ₹{formatINR(1000)}
              </span>
              <span className="text-sm font-bold text-primary">
                {Math.min((earningsData.today / 1000) * 100, 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-neutral-background rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-primary rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min((earningsData.today / 1000) * 100, 100)}%` }}
              />
            </div>
          </div>
          {earningsData.today >= 1000 && (
            <div className="bg-success-light border border-success rounded-lg p-3 flex items-center gap-2">
              <Target size={18} className="text-success" />
              <span className="text-sm font-semibold text-success">🎉 Daily goal achieved!</span>
            </div>
          )}
        </div>

        {/* Enhanced Info Card */}
        <div className="bg-gradient-to-br from-primary-light to-primary/20 border-2 border-primary/30 rounded-xl p-6 shadow-elevated animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <DollarSign size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-neutral-text-primary text-lg mb-2">Earnings Calculation</h3>
              <p className="text-sm text-neutral-text-secondary mb-3">
                You earn <span className="font-bold text-primary">15% commission</span> on each delivery order. Earnings are calculated based on the order total.
              </p>
              <div className="flex items-center gap-2 text-xs text-neutral-text-secondary">
                <Package size={14} />
                <span>Average per delivery: {formatINR(earningsData.averagePerDelivery)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

