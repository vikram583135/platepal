'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { DollarSign, ShoppingCart, Users } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// --- TYPES ---
type Order = { id: string; status: string; total_amount: number };
type SummaryData = {
  todayRevenue: number;
  todayOrders: number;
  newCustomers: number;
};
type WeeklyVolume = { name: string; total: number }[];

// --- API FUNCTIONS ---
const getRecentOrders = async (): Promise<Order[]> => {
  const token = localStorage.getItem('accessToken');
  const { data } = await axios.get('http://localhost:3003/orders/active', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.slice(0, 5);
};

const getSummaryData = async (): Promise<SummaryData> => {
  const token = localStorage.getItem('accessToken');
  const { data } = await axios.get('http://localhost:3003/analytics/summary', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const getWeeklyVolume = async (): Promise<WeeklyVolume> => {
  const token = localStorage.getItem('accessToken');
  const { data } = await axios.get('http://localhost:3003/analytics/weekly-volume', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// --- MAIN PAGE COMPONENT ---
function DashboardPage() {
  const { data: recentOrders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({ 
    queryKey: ['recentOrders'], 
    queryFn: getRecentOrders 
  });

  const { data: summaryData, isLoading: isLoadingSummary } = useQuery<SummaryData>({ 
    queryKey: ['summaryData'], 
    queryFn: getSummaryData 
  });

  const { data: weeklyVolume = [], isLoading: isLoadingVolume } = useQuery<WeeklyVolume>({ 
    queryKey: ['weeklyVolume'], 
    queryFn: getWeeklyVolume 
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingSummary ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summaryData?.todayRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{summaryData?.todayOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{summaryData?.newCustomers}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoadingVolume ? (
              <Skeleton className="h-[350px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={weeklyVolume}>
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>A list of your 5 most recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                      <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                      <TableCell className="text-right">${order.total_amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;