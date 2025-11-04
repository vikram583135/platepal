'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR } from '@/lib/currency';

const data = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 4500 },
  { name: 'May', revenue: 6000 },
  { name: 'Jun', revenue: 5500 },
  { name: 'Jul', revenue: 7000 },
  { name: 'Aug', revenue: 6500 },
  { name: 'Sep', revenue: 8000 },
  { name: 'Oct', revenue: 7500 },
  { name: 'Nov', revenue: 9000 },
  { name: 'Dec', revenue: 8500 },
];

export default function RevenueChart() {
  return (
    <div className="bg-surface rounded-lg shadow-elevated p-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Monthly Revenue</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D5DBDB" />
            <XAxis dataKey="name" stroke="#7F8FA4" />
            <YAxis stroke="#7F8FA4" />
            <Tooltip 
              formatter={(value: any) => [formatINR(value), 'Revenue']}
              labelFormatter={(label) => `Month: ${label}`}
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
  );
}
