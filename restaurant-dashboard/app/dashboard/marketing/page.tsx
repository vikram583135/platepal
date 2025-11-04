'use client';

import { Megaphone, TrendingUp, Users, Eye, MousePointerClick } from 'lucide-react';

export default function MarketingPage() {
  const campaigns = [
    { name: 'Summer Special Campaign', impressions: 12500, clicks: 856, conversions: 142, roi: 320 },
    { name: 'Weekend Offer', impressions: 8900, clicks: 645, conversions: 98, roi: 280 },
    { name: 'New Menu Launch', impressions: 15600, clicks: 1205, conversions: 215, roi: 410 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Marketing Dashboard</h1>
        <p className="text-text-secondary mt-1">Track your marketing campaigns and customer engagement</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Eye className="text-white" size={20} />
            </div>
            <h3 className="text-text-secondary text-sm font-medium">Total Impressions</h3>
          </div>
          <p className="text-3xl font-bold text-text-primary">37,000</p>
        </div>

        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg gradient-secondary flex items-center justify-center">
              <MousePointerClick className="text-white" size={20} />
            </div>
            <h3 className="text-text-secondary text-sm font-medium">Click Rate</h3>
          </div>
          <p className="text-3xl font-bold text-text-primary">7.3%</p>
        </div>

        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
              <Users className="text-white" size={20} />
            </div>
            <h3 className="text-text-secondary text-sm font-medium">Conversions</h3>
          </div>
          <p className="text-3xl font-bold text-text-primary">455</p>
        </div>

        <div className="bg-surface rounded-lg p-6 shadow-soft hover-lift">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <TrendingUp className="text-info" size={20} />
            </div>
            <h3 className="text-text-secondary text-sm font-medium">Avg ROI</h3>
          </div>
          <p className="text-3xl font-bold text-text-primary">337%</p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-surface rounded-lg shadow-soft overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">Active Campaigns</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Impressions</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Clicks</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Conversions</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.map((campaign, index) => (
                <tr key={index} className="hover:bg-background transition-colors">
                  <td className="px-6 py-4 font-medium text-text-primary">{campaign.name}</td>
                  <td className="px-6 py-4 text-text-primary">{campaign.impressions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-text-primary">{campaign.clicks.toLocaleString()}</td>
                  <td className="px-6 py-4 text-text-primary">{campaign.conversions}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-success/10 text-success text-sm font-semibold rounded-full">
                      {campaign.roi}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

