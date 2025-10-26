'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import withAuth from '@/app/components/withAuth';
import { getMenuItem, updateMenuItem } from '@/app/services/restaurant.service';

// --- TYPES ---
type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
};

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
});

function EditMenuItemPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const { data: menuItem, isLoading, isError, error } = useQuery<MenuItem, Error>({
    queryKey: ['menuItem', id],
    queryFn: () => getMenuItem(id as string),
    enabled: !!id,
  });

  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: menuItem || { name: '', description: '', price: 0, category: '' },
  });

  React.useEffect(() => {
    if (menuItem) {
      form.reset(menuItem);
    }
  }, [menuItem, form]);

  const mutation = useMutation<MenuItem, Error, MenuItem, unknown>({
    mutationFn: updateMenuItem,
    onSuccess: () => {
      toast.success('Menu item updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      queryClient.invalidateQueries({ queryKey: ['menuItem', id] });
      router.push('/dashboard/menu');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: z.infer<typeof menuItemSchema>) {
    if (!menuItem) return;
    mutation.mutate({ ...menuItem, ...values });
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return <div className="text-red-500">{error.message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Menu Item</CardTitle>
        <CardDescription>Update the details for this menu item.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="description" render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="price" render={({ field }) => <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="category" render={({ field }) => <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default withAuth(EditMenuItemPage);
