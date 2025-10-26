'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import withAuth from '@/app/components/withAuth';

// --- TYPES & SCHEMA ---
const profileSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  cuisine: z.string().min(1, 'Cuisine type is required'),
  opening_hours: z.string().min(1, 'Opening hours are required'),
});

type RestaurantProfile = z.infer<typeof profileSchema>;

// --- API FUNCTIONS ---
const getProfile = async (): Promise<RestaurantProfile> => {
  const token = localStorage.getItem('accessToken');
  const { data } = await axios.get('http://localhost:3002/restaurants/profile', { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

const updateProfile = async (updatedProfile: RestaurantProfile): Promise<RestaurantProfile> => {
  const token = localStorage.getItem('accessToken');
  const { data } = await axios.put('http://localhost:3002/restaurants/profile', updatedProfile, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

// --- MAIN PAGE COMPONENT ---
function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading, isError } = useQuery<RestaurantProfile>({ 
    queryKey: ['profile'], 
    queryFn: getProfile 
  });

  const form = useForm<RestaurantProfile>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', address: '', phone: '', cuisine: '', opening_hours: '' },
  });

  React.useEffect(() => {
    if (profile) {
      form.reset(profile);
    }
  }, [profile, form]);

  const mutation = useMutation<RestaurantProfile, AxiosError, RestaurantProfile, unknown>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully!');
      queryClient.setQueryData(['profile'], data);
    },
    onError: (error) => {
      const errorMsg = (error.response?.data as any)?.message || 'Failed to update profile.';
      toast.error(errorMsg);
    },
  });

  function onSubmit(values: RestaurantProfile) {
    mutation.mutate(values);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Restaurant Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>View and update your restaurant's details.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/4 mt-4" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500">Failed to load profile. Please try again later.</div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Restaurant Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="address" render={({ field }) => <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="cuisine" render={({ field }) => <FormItem><FormLabel>Cuisine Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="opening_hours" render={({ field }) => <FormItem><FormLabel>Opening Hours</FormLabel><FormControl><Input placeholder="e.g., Mon-Fri 9am-10pm, Sat-Sun 10am-11pm" {...field} /></FormControl><FormMessage /></FormItem>} />
                <Button type="submit" disabled={mutation.isPending || !form.formState.isDirty}>
                  {mutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(ProfilePage);