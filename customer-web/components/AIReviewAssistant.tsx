'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Star, Send, Loader2 } from 'lucide-react';
import { generateReviewSuggestions } from '@/lib/ai-service';
import { Order } from '@/lib/api';
import { useBehaviorStore } from '@/lib/store';
import { toast } from 'sonner';

interface AIReviewAssistantProps {
  order: Order;
  onSubmit: (rating: number, review: string) => void;
  onCancel: () => void;
}

export default function AIReviewAssistant({ order, onSubmit, onCancel }: AIReviewAssistantProps) {
  const { tracker } = useBehaviorStore();
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [prompts, setPrompts] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [aiRating, setAiRating] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  useEffect(() => {
    generateSuggestions();
  }, [order]);

  const generateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const orderHistory = tracker.getOrderHistory();
      const result = await generateReviewSuggestions(
        order,
        order.items || [],
        orderHistory
      );

      setPrompts(result.prompts || []);
      setSuggestions(result.suggestions || []);
      if (result.rating) {
        setRating(result.rating);
        setAiRating(result.rating);
      }
    } catch (error) {
      console.error('Failed to generate review suggestions:', error);
      // Fallback prompts
      setPrompts([
        `How was the ${order.items?.[0]?.name || 'food'}?`,
        'Was it delicious?',
        'How was the delivery experience?',
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt);
    // Add prompt to review if it's a question
    if (prompt.includes('?')) {
      setReview((prev) => (prev ? `${prev}\n\n${prompt} ` : `${prompt} `));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setReview((prev) => (prev ? `${prev}\n${suggestion}` : suggestion));
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!review.trim()) {
      toast.error('Please write a review');
      return;
    }

    onSubmit(rating, review);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-primary" />
        <h3 className="text-lg font-bold text-neutral-text-primary">AI Review Assistant</h3>
      </div>

      {/* AI Suggestions */}
      {isGenerating ? (
        <div className="flex items-center gap-2 text-neutral-text-secondary mb-4">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Generating personalized suggestions...</span>
        </div>
      ) : (
        <>
          {/* Prompts */}
          {prompts.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-neutral-text-secondary mb-2">
                Try asking yourself:
              </p>
              <div className="flex flex-wrap gap-2">
                {prompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                      selectedPrompt === prompt
                        ? 'bg-primary text-white border-primary'
                        : 'bg-neutral-background text-neutral-text-primary border-neutral-border hover:border-primary'
                    }`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-neutral-text-secondary mb-2">
                Suggested review text:
              </p>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm bg-neutral-background rounded-lg border border-neutral-border hover:border-primary hover:bg-primary-light transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-neutral-text-primary mb-2">
          Rating {aiRating && <span className="text-xs text-neutral-text-secondary">(AI suggests: {aiRating}⭐)</span>}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`w-10 h-10 rounded-lg transition-all ${
                star <= rating
                  ? 'bg-accent text-accent-dark'
                  : 'bg-neutral-background text-neutral-text-secondary'
              } hover:scale-110 active:scale-95`}
            >
              <Star size={20} className={star <= rating ? 'fill-current' : ''} />
            </button>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-neutral-text-primary mb-2">
          Your Review
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience... (AI suggestions above)"
          className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={5}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-neutral-border rounded-lg font-semibold text-neutral-text-primary hover:bg-neutral-background transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || !review.trim()}
          className="flex-1 px-4 py-2 gradient-primary text-white rounded-lg font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send size={18} />
          Submit Review
        </button>
      </div>
    </div>
  );
}

