'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import withAuth from '@/app/components/withAuth';
import { addMenuItem } from '@/app/services/restaurant.service';

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

function AddMenuItemPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: { name: '', description: '', price: 0, category: '' },
  });

  const mutation = useMutation<MenuItem, Error, Omit<MenuItem, 'id'>, unknown>({
    mutationFn: addMenuItem,
    onSuccess: () => {
      toast.success('Menu item added successfully!');
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      router.push('/dashboard/menu');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: z.infer<typeof menuItemSchema>) {
    mutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Menu Item</CardTitle>
        <CardDescription>Fill in the details below to add a new item to your menu.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g. Classic Burger" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="description" render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g. A juicy beef patty with lettuce, tomato, and our special sauce" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="price" render={({ field }) => <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g. 9.99" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="category" render={({ field }) => <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g. Burgers" {...field} /></FormControl><FormMessage /></FormItem>} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Adding...' : 'Add Item'}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default withAuth(AddMenuItemPage);
