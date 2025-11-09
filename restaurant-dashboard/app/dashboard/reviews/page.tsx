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
import ReviewAnalyzer from '@/app/components/ReviewAnalyzer';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';

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
  const [reviewResponses, setReviewResponses] = React.useState<Record<string, string>>({});

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
    const replyText = reviewResponses[reviewId] || response;
    if (!replyText.trim()) {
      toast.error('Please enter a response');
      return;
    }
    mutation.mutate({ reviewId, response: replyText });
  };

  const handleReplyGenerated = (reviewId: string, reply: string) => {
    setReviewResponses((prev) => ({ ...prev, [reviewId]: reply }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Customer Reviews</h1>
        <p className="text-text-secondary mt-1">Manage and respond to customer feedback with AI assistance</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-error">{(error as Error).message}</div>
          </CardContent>
        </Card>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="mx-auto mb-4 text-text-secondary opacity-50" size={48} />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No reviews yet</h3>
            <p className="text-text-secondary">Customer reviews will appear here once they start coming in.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: Review) => (
            <Card key={review.id} className="hover-lift">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{review.customerName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < review.rating ? 'text-accent fill-accent' : 'text-border'}
                          />
                        ))}
                        <span className="text-sm text-text-secondary ml-2">{review.rating}/5</span>
                      </div>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>

                  {/* Review Comment */}
                  <div className="bg-background/50 rounded-lg p-4">
                    <p className="text-text-primary whitespace-pre-wrap">{review.comment}</p>
                  </div>

                  {/* AI Analysis */}
                  {!review.response && (
                    <ReviewAnalyzer
                      review={review}
                      onReplyGenerated={(reply) => handleReplyGenerated(review.id, reply)}
                    />
                  )}

                  {/* Response Section */}
                  {review.response ? (
                    <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="text-success" size={16} />
                        <span className="text-sm font-semibold text-text-primary">Your Response:</span>
                      </div>
                      <p className="text-sm text-text-primary">{review.response}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Textarea
                        value={reviewResponses[review.id] || response}
                        onChange={(e) => {
                          if (reviewResponses[review.id]) {
                            setReviewResponses((prev) => ({ ...prev, [review.id]: e.target.value }));
                          } else {
                            setResponse(e.target.value);
                          }
                        }}
                        placeholder="Write a response or use AI-generated reply above..."
                        className="min-h-[100px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleResponseSubmit(review.id)}
                          disabled={mutation.isPending}
                          className="gradient-primary text-white hover-lift"
                        >
                          {mutation.isPending ? 'Submitting...' : 'Submit Response'}
                        </Button>
                        {reviewResponses[review.id] && (
                          <Button
                            onClick={() => {
                              setReviewResponses((prev) => {
                                const newState = { ...prev };
                                delete newState[review.id];
                                return newState;
                              });
                            }}
                            variant="outline"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAuth(ReviewsPage);
