'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import withAuth from '@/app/components/withAuth';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '@/app/services/restaurant.service';
import { formatINR } from '@/lib/currency';

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

// --- COMPONENTS ---
function AddMenuItemDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: { name: '', description: '', price: 0, category: '' },
  });

  const mutation = useMutation<MenuItem, AxiosError, Omit<MenuItem, 'id'>, unknown>({
    mutationFn: addMenuItem,
    onSuccess: () => {
      toast.success('Menu item added successfully!');
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      const errorMsg = (error.response?.data as any)?.message || 'Failed to add item. Please try again.';
      toast.error(errorMsg);
    },
  });

  function onSubmit(values: z.infer<typeof menuItemSchema>) {
    mutation.mutate(values);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Add New Menu Item</AlertDialogTitle><AlertDialogDescription>Fill in the details below to add a new item to your menu.</AlertDialogDescription></AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g. Classic Burger" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="description" render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g. A juicy beef patty with lettuce, tomato, and our special sauce" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="price" render={({ field }) => <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g. 9.99" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="category" render={({ field }) => <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g. Burgers" {...field} /></FormControl><FormMessage /></FormItem>} />
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Adding...' : 'Add Item'}</Button></AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function EditMenuItemDialog({ item, open, onOpenChange }: { item: MenuItem | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: item || { name: '', description: '', price: 0, category: '' },
  });

  React.useEffect(() => { if (item) { form.reset(item); } }, [item, form]);

  const mutation = useMutation<MenuItem, AxiosError, MenuItem, unknown>({
    mutationFn: updateMenuItem,
    onSuccess: () => {
      toast.success('Menu item updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      onOpenChange(false);
    },
    onError: (error) => {
      const errorMsg = (error.response?.data as any)?.message || 'Failed to update item. Please try again.';
      toast.error(errorMsg);
    },
  });

  function onSubmit(values: z.infer<typeof menuItemSchema>) {
    if (!item) return;
    mutation.mutate({ ...item, ...values });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Edit Menu Item</AlertDialogTitle><AlertDialogDescription>Update the details for this menu item.</AlertDialogDescription></AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="description" render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="price" render={({ field }) => <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="category" render={({ field }) => <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Changes'}</Button></AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteMenuItemDialog({ item, open, onOpenChange }: { item: MenuItem | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const mutation = useMutation<void, AxiosError, string, unknown>({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      toast.success('Menu item deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      onOpenChange(false);
    },
    onError: (error) => {
      const errorMsg = (error.response?.data as any)?.message || 'Failed to delete item. Please try again.';
      toast.error(errorMsg);
    },
  });

  const handleDelete = () => {
    if (!item) return;
    mutation.mutate(item.id);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the menu item.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={mutation.isPending} className="bg-red-600 hover:bg-red-700">{mutation.isPending ? 'Deleting...' : 'Delete'}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function MenuPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null);

  const { data: menuItems = [], isLoading, isError } = useQuery<MenuItem[]>({ queryKey: ['menuItems'], queryFn: getMenuItems });

  const handleEditClick = (item: MenuItem) => { setSelectedItem(item); setIsEditDialogOpen(true); };
  const handleDeleteClick = (item: MenuItem) => { setSelectedItem(item); setIsDeleteDialogOpen(true); };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add New Item</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Your Menu</CardTitle><CardDescription>A list of all the items on your menu.</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : isError ? (
            <div className="text-center text-red-500">Failed to load menu items. Please try again later.</div>
          ) : menuItems.length === 0 ? (
            <div className="text-center text-muted-foreground">You haven't added any menu items yet.</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead className="hidden md:table-cell">Description</TableHead><TableHead className="text-right">Price</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
              <TableBody>
                {menuItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.description}</TableCell>
                    <TableCell className="text-right">{formatINR(item.price || 0)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditClick(item)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="text-red-600">Delete</DropdownMenuItem>
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
      <AddMenuItemDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      {selectedItem && <EditMenuItemDialog item={selectedItem} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />}
      {selectedItem && <DeleteMenuItemDialog item={selectedItem} open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} />}
    </div>
  );
}

export default withAuth(MenuPage);
