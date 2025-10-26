'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { MoreHorizontal, Truck } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import withAuth from '@/app/components/withAuth';

// --- TYPES ---
type OrderItem = { id: string; name: string; quantity: number; price: number };
type Order = {
  id: string;
  customer_name: string;
  order_date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  total_amount: number;
  items: OrderItem[];
};

const ORDER_STATUSES: Order['status'][] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

// --- API FUNCTIONS ---
const getOrders = async (): Promise<Order[]> => {
  const token = localStorage.getItem('accessToken');
  const { data } = await axios.get('http://localhost:3003/orders', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const updateOrderStatus = async ({ orderId, status }: { orderId: string; status: Order['status'] }): Promise<Order> => {
  const token = localStorage.getItem('accessToken');
  const { data } = await axios.patch(`http://localhost:3003/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

// --- MAIN PAGE COMPONENT ---
function OrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading, isError } = useQuery<Order[]>({ queryKey: ['orders'], queryFn: getOrders });

  const mutation = useMutation<Order, AxiosError, { orderId: string; status: Order['status'] }, unknown>({
    mutationFn: updateOrderStatus,
    onSuccess: (data) => {
      toast.success(`Order #${data.id.substring(0, 8)} status updated to ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      const errorMsg = (error.response?.data as any)?.message || 'Failed to update order status.';
      toast.error(errorMsg);
    },
  });

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    mutation.mutate({ orderId, status });
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Order Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>A list of all orders from your customers.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : isError ? (
            <div className="text-center text-red-500">Failed to load orders. Please try again later.</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-muted-foreground">You have no orders yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}>{order.status}</Badge></TableCell>
                    <TableCell className="text-right">${order.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {ORDER_STATUSES.map(status => (
                            <DropdownMenuItem key={status} onClick={() => handleStatusChange(order.id, status)} disabled={order.status === status}>
                              Set as {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(OrdersPage);