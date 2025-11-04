'use client';

import { Download, FileText, Calendar, TrendingUp } from 'lucide-react';
import { formatINR } from '@/lib/currency';
import { toast } from 'sonner';

export default function ReportsPage() {
  const reports = [
    { name: 'Daily Sales Report', description: 'Summary of today\'s sales and transactions', date: '2024-10-26', revenue: 125000, type: 'daily' },
    { name: 'Weekly Summary', description: 'Performance overview for the past week', date: '2024-10-20', revenue: 850000, type: 'weekly' },
    { name: 'Monthly Report', description: 'Comprehensive monthly business insights', date: '2024-10-01', revenue: 3500000, type: 'monthly' },
    { name: 'Tax Report Q3', description: 'Quarterly tax and financial report', date: '2024-09-30', revenue: 10200000, type: 'quarterly' },
  ];

  const handleDownload = (reportName: string) => {
    toast.success(`Downloading ${reportName}...`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-primary/10 text-primary';
      case 'weekly':
        return 'bg-secondary/10 text-secondary';
      case 'monthly':
        return 'bg-accent/10 text-accent-dark';
      case 'quarterly':
        return 'bg-info/10 text-info';
      default:
        return 'bg-background text-text-secondary';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Reports & Insights</h1>
        <p className="text-text-secondary mt-1">Download and view detailed business reports</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg gradient-secondary flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <h3 className="text-text-secondary text-sm font-medium">Today's Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-secondary">{formatINR(125000)}</p>
        </div>

        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Calendar className="text-white" size={20} />
            </div>
            <h3 className="text-text-secondary text-sm font-medium">This Week</h3>
          </div>
          <p className="text-3xl font-bold text-primary">{formatINR(850000)}</p>
        </div>

        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <h3 className="text-text-secondary text-sm font-medium">This Month</h3>
          </div>
          <p className="text-3xl font-bold text-accent-dark">{formatINR(3500000)}</p>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          onClick={() => toast.info('Generate Daily Report')}
          className="bg-surface p-6 rounded-lg shadow-soft hover-lift transition-all text-left"
        >
          <FileText className="text-primary mb-3" size={32} />
          <h3 className="text-lg font-bold text-text-primary mb-2">Daily Report</h3>
          <p className="text-sm text-text-secondary">Generate today's sales and order summary</p>
        </button>

        <button
          onClick={() => toast.info('Generate Weekly Report')}
          className="bg-surface p-6 rounded-lg shadow-soft hover-lift transition-all text-left"
        >
          <FileText className="text-secondary mb-3" size={32} />
          <h3 className="text-lg font-bold text-text-primary mb-2">Weekly Report</h3>
          <p className="text-sm text-text-secondary">Last 7 days performance overview</p>
        </button>

        <button
          onClick={() => toast.info('Generate Monthly Report')}
          className="bg-surface p-6 rounded-lg shadow-soft hover-lift transition-all text-left"
        >
          <FileText className="text-accent-dark mb-3" size={32} />
          <h3 className="text-lg font-bold text-text-primary mb-2">Monthly Report</h3>
          <p className="text-sm text-text-secondary">Comprehensive monthly insights</p>
        </button>
      </div>

      {/* Recent Reports */}
      <div className="bg-surface rounded-lg shadow-soft overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">Recent Reports</h2>
        </div>
        <div className="divide-y divide-border">
          {reports.map((report, index) => (
            <div key={index} className="p-6 hover:bg-background transition-colors animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                    <FileText className="text-primary" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-text-primary">{report.name}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(report.type)}`}>
                        {report.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{report.description}</p>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span>Generated: {new Date(report.date).toLocaleDateString()}</span>
                      <span>Revenue: <span className="font-semibold text-secondary">{formatINR(report.revenue)}</span></span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(report.name)}
                  className="px-4 py-2 gradient-primary text-white rounded-lg hover-lift transition-all flex items-center gap-2 font-medium"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

