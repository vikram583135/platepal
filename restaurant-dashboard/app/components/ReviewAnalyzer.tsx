'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Sparkles, ThumbsUp, ThumbsDown, AlertCircle, Tag, CheckCircle } from 'lucide-react';
import { analyzeReview, generateReviewReply, type ReviewAnalysis, type ReviewReply } from '@/app/services/ai.service';
import { getRestaurantId } from '@/app/services/restaurant.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface ReviewAnalyzerProps {
  review: {
    id: string;
    comment: string;
    rating: number;
    customerName?: string;
  };
  onReplyGenerated?: (reply: string) => void;
}

export default function ReviewAnalyzer({ review, onReplyGenerated }: ReviewAnalyzerProps) {
  const [restaurantId, setRestaurantId] = React.useState<number | null>(null);
  const [selectedReply, setSelectedReply] = React.useState<string>('');

  React.useEffect(() => {
    getRestaurantId().then(setRestaurantId);
  }, []);

  const { data: analysis, isLoading: analyzing } = useQuery<ReviewAnalysis>({
    queryKey: ['review-analysis', review.id, restaurantId],
    queryFn: () => analyzeReview({ comment: review.comment, rating: review.rating }, restaurantId!),
    enabled: !!restaurantId && !!review.comment,
  });

  const { data: replyData, isLoading: generatingReply, refetch: generateReply } = useQuery<ReviewReply>({
    queryKey: ['review-reply', review.id, analysis?.sentiment, restaurantId],
    queryFn: () => generateReviewReply(
      {
        comment: review.comment,
        rating: review.rating,
        sentiment: analysis?.sentiment,
        themes: analysis?.themes,
      },
      restaurantId!
    ),
    enabled: false, // Only fetch when manually triggered
  });

  React.useEffect(() => {
    if (replyData && onReplyGenerated) {
      onReplyGenerated(replyData.suggestedReply);
      setSelectedReply(replyData.suggestedReply);
    }
  }, [replyData, onReplyGenerated]);

  const handleGenerateReply = () => {
    if (!analysis) {
      toast.error('Please wait for analysis to complete');
      return;
    }
    generateReply();
    toast.info('Generating AI reply...');
  };

  const handleUseReply = () => {
    if (selectedReply && onReplyGenerated) {
      onReplyGenerated(selectedReply);
      toast.success('Reply ready to use');
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-success/10 text-success border-success/20';
      case 'negative':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-info/10 text-info border-info/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error/20 text-error';
      case 'medium':
        return 'bg-accent/20 text-accent-dark';
      default:
        return 'bg-success/20 text-success';
    }
  };

  return (
    <div className="space-y-4">
      {/* Analysis Results */}
      {analyzing && (
        <div className="bg-surface rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary animate-pulse" size={16} />
            <span className="text-sm text-text-secondary">Analyzing review...</span>
          </div>
        </div>
      )}

      {analysis && (
        <div className="bg-surface rounded-lg p-4 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary" size={16} />
              <span className="text-sm font-semibold text-text-primary">AI Analysis</span>
            </div>
            <Badge className={getSentimentColor(analysis.sentiment)}>
              {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-secondary">Sentiment Score:</span>
              <span className="ml-2 font-semibold text-text-primary">
                {Math.round(analysis.sentimentScore * 100)}%
              </span>
            </div>
            <div>
              <span className="text-text-secondary">Priority:</span>
              <Badge className={`ml-2 ${getPriorityColor(analysis.priority)}`}>
                {analysis.priority.toUpperCase()}
              </Badge>
            </div>
          </div>

          {analysis.themes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="text-text-secondary" size={14} />
                <span className="text-sm font-semibold text-text-primary">Themes:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.themes.map((theme, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {analysis.keyPoints.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-text-secondary" size={14} />
                <span className="text-sm font-semibold text-text-primary">Key Points:</span>
              </div>
              <ul className="space-y-1">
                {analysis.keyPoints.map((point, index) => (
                  <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reply Generation */}
          <div className="pt-3 border-t border-border">
            {!replyData && (
              <Button
                onClick={handleGenerateReply}
                disabled={generatingReply}
                className="w-full gradient-primary text-white hover-lift"
                size="sm"
              >
                {generatingReply ? (
                  <>
                    <Sparkles className="mr-2 animate-spin" size={16} />
                    Generating Reply...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" size={16} />
                    Generate AI Reply
                  </>
                )}
              </Button>
            )}

            {replyData && (
              <div className="space-y-3">
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-text-secondary">Suggested Reply:</span>
                    <Badge className="text-xs">
                      {replyData.tone}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{replyData.suggestedReply}</p>
                  <div className="mt-2 text-xs text-text-secondary">
                    Confidence: {Math.round(replyData.confidence * 100)}%
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUseReply}
                    className="flex-1 gradient-primary text-white hover-lift"
                    size="sm"
                  >
                    <CheckCircle className="mr-2" size={16} />
                    Use This Reply
                  </Button>
                  <Button
                    onClick={handleGenerateReply}
                    disabled={generatingReply}
                    variant="outline"
                    size="sm"
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

