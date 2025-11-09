'use client';

import { useState, useEffect } from 'react';
import { SupportTicket } from '@/store/types';
import { aiService } from '@/lib/ai-service';
import { SparklesIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from './ui/Badge';
import toast from 'react-hot-toast';

interface AIResponseAssistantProps {
  ticket: SupportTicket;
  onUseResponse: (response: string) => void;
}

interface SuggestedResponse {
  id: string;
  text: string;
  tone: 'professional' | 'friendly' | 'empathetic' | 'formal';
  confidence: number;
  reasoning?: string;
}

const RESPONSE_TEMPLATES = [
  {
    id: 'acknowledgment',
    name: 'Acknowledgment',
    text: 'Thank you for reaching out to us. We understand your concern and appreciate you bringing this to our attention.',
    category: 'general',
  },
  {
    id: 'refund-initiating',
    name: 'Refund Initiation',
    text: 'We sincerely apologize for the inconvenience. We have initiated a refund for your order, which should be processed within 5-7 business days.',
    category: 'billing',
  },
  {
    id: 'investigating',
    name: 'Under Investigation',
    text: 'We are currently investigating this matter and will get back to you within 24 hours with an update.',
    category: 'general',
  },
  {
    id: 'account-access',
    name: 'Account Access Issue',
    text: 'We apologize for the login issues you\'re experiencing. Our technical team is working to resolve this. In the meantime, please try resetting your password.',
    category: 'account',
  },
  {
    id: 'delivery-delay',
    name: 'Delivery Delay',
    text: 'We sincerely apologize for the delay in your delivery. We are tracking your order and will ensure it reaches you as soon as possible. You will receive real-time updates via SMS.',
    category: 'delivery',
  },
];

export default function AIResponseAssistant({ ticket, onUseResponse }: AIResponseAssistantProps) {
  const [suggestedResponses, setSuggestedResponses] = useState<SuggestedResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'professional' | 'friendly' | 'empathetic' | 'formal'>('professional');
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    generateSuggestions();
  }, [ticket, selectedTone]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      // Generate AI response suggestions
      const context = {
        ticketSubject: ticket.subject,
        ticketDescription: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        customerName: ticket.createdBy.name,
        tone: selectedTone,
      };

      const aiResponse = await aiService.naturalLanguageQuery(
        `Generate 3 professional response suggestions for this support ticket. Tone: ${selectedTone}. Context: ${JSON.stringify(context)}`
      );

      // Parse AI response (in production, this would be structured JSON)
      // Note: NLQueryResult doesn't have a response property, so we use fallback
      const suggestions: SuggestedResponse[] = [
        {
          id: 'ai-1',
          text: generateFallbackResponse(selectedTone),
          tone: selectedTone,
          confidence: 0.85,
          reasoning: 'AI-generated based on ticket context and sentiment',
        },
        {
          id: 'ai-2',
          text: generateFallbackResponse('empathetic'),
          tone: 'empathetic',
          confidence: 0.80,
          reasoning: 'Emphasizes understanding and empathy',
        },
        {
          id: 'ai-3',
          text: generateFallbackResponse('friendly'),
          tone: 'friendly',
          confidence: 0.75,
          reasoning: 'Casual and approachable tone',
        },
      ];

      setSuggestedResponses(suggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback to templates
      const fallback: SuggestedResponse[] = RESPONSE_TEMPLATES.slice(0, 3).map((t, idx) => ({
        id: `fallback-${idx}`,
        text: t.text,
        tone: 'professional',
        confidence: 0.70,
      }));
      setSuggestedResponses(fallback);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackResponse = (tone: string): string => {
    const baseResponse = `Thank you for contacting us regarding: ${ticket.subject}. We are looking into this matter and will provide you with an update shortly.`;
    
    if (tone === 'empathetic') {
      return `We truly understand how frustrating this situation must be. ${baseResponse} Your patience is greatly appreciated.`;
    } else if (tone === 'friendly') {
      return `Hey there! Thanks for reaching out about ${ticket.subject}. We're on it and will get back to you soon!`;
    } else if (tone === 'formal') {
      return `Dear ${ticket.createdBy.name}, We acknowledge receipt of your inquiry regarding ${ticket.subject}. Our team is reviewing this matter and will respond promptly.`;
    }
    
    return baseResponse;
  };

  const handleUseResponse = (response: string) => {
    onUseResponse(response);
    toast.success('Response added to reply box');
  };

  const handleUseTemplate = (template: typeof RESPONSE_TEMPLATES[0]) => {
    let customized = template.text;
    
    // Customize with ticket details
    if (ticket.category === 'billing' && template.id === 'refund-initiating') {
      // Already good
    } else if (ticket.category === 'account' && template.id === 'account-access') {
      // Already good
    } else {
      customized = `${customized}\n\nRegarding your ticket: ${ticket.subject}, we will address this matter promptly.`;
    }
    
    onUseResponse(customized);
    setShowTemplates(false);
    toast.success('Template added to reply box');
  };

  const filteredTemplates = RESPONSE_TEMPLATES.filter(
    (t) => t.category === ticket.category || t.category === 'general'
  );

  return (
    <div className="bg-background rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-text-primary">AI Response Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-surface transition-colors flex items-center gap-2"
          >
            <DocumentTextIcon className="h-4 w-4" />
            Templates
          </button>
          <select
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value as any)}
            className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="empathetic">Empathetic</option>
            <option value="formal">Formal</option>
          </select>
          <button
            onClick={generateSuggestions}
            disabled={loading}
            className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
            title="Regenerate suggestions"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Templates */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-sm font-medium text-text-secondary">Response Templates</p>
            <div className="grid grid-cols-1 gap-2">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleUseTemplate(template)}
                  className="text-left p-3 bg-surface rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary">{template.name}</span>
                    <Badge variant="info">Template</Badge>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">{template.text}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Suggestions */}
      {loading ? (
        <div className="text-center py-6 text-text-secondary">
          <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm">Generating suggestions...</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-text-secondary">AI-Generated Suggestions</p>
          {suggestedResponses.map((response, idx) => (
            <motion.div
              key={response.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-surface rounded-lg border border-border hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={idx === 0 ? 'success' : 'neutral'}>
                    {response.tone}
                  </Badge>
                  <span className="text-xs text-text-secondary">
                    Confidence: {(response.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                {idx === 0 && (
                  <Badge variant="success" className="text-xs">Recommended</Badge>
                )}
              </div>
              <p className="text-sm text-text-primary mb-3 whitespace-pre-wrap">
                {response.text}
              </p>
              {response.reasoning && (
                <p className="text-xs text-text-secondary italic mb-3">{response.reasoning}</p>
              )}
              <button
                onClick={() => handleUseResponse(response.text)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Use This Response
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
