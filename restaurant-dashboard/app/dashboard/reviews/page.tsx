'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import withAuth from '@/app/components/withAuth';
import { getReviews, respondToReview } from '@/app/services/restaurant.service';

// --- TYPES ---
type Review = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  response?: string;
};

function ReviewsPage() {
  const queryClient = useQueryClient();
  const { data: reviews = [], isLoading, isError, error } = useQuery<Review[], Error>({ 
    queryKey: ['reviews'], 
    queryFn: getReviews 
  });
  const [response, setResponse] = React.useState('');

  const mutation = useMutation<void, Error, { reviewId: string; response: string }, unknown>({
    mutationFn: ({ reviewId, response }) => respondToReview(reviewId, response),
    onSuccess: () => {
      toast.success('Response submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setResponse('');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleResponseSubmit = (reviewId: string) => {
    mutation.mutate({ reviewId, response });
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Customer Reviews</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Reviews</CardTitle>
          <CardDescription>A list of all reviews from your customers.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
          ) : isError ? (
            <div className="text-center text-red-500">{(error as Error).message}</div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-muted-foreground">You have no reviews yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review: Review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.customerName}</TableCell>
                    <TableCell>{review.rating}/5</TableCell>
                    <TableCell>{review.comment}</TableCell>
                    <TableCell>
                      {review.response ? (
                        <p>{review.response}</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <Textarea value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Write a response..." />
                          <Button onClick={() => handleResponseSubmit(review.id)} disabled={mutation.isPending}>
                            {mutation.isPending ? 'Submitting...' : 'Submit'}
                          </Button>
                        </div>
                      )}
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

export default withAuth(ReviewsPage);
