'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { useCartStore, useBehaviorStore } from '@/lib/store';
import { parseNaturalLanguageQuery } from '@/lib/ai-service';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationalCartProps {
  onClose: () => void;
}

export default function ConversationalCart({ onClose }: ConversationalCartProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const { tracker } = useBehaviorStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I&apos;m your cart assistant. You can ask me to add items, modify quantities, or get suggestions. Try saying &apos;Add extra rice to that&apos; or &apos;Do you have any drink specials?&apos;",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Parse the query
      const query = input.toLowerCase();
      let response = '';
      let actionTaken = false;

      // Handle common cart operations
      if (query.includes('add') || query.includes('more')) {
        // Try to extract item name
        const itemMatch = query.match(/add\s+(?:more\s+)?(?:of\s+)?(.+?)(?:\s+to|$)/i);
        if (itemMatch) {
          response = `I&apos;d help you add "${itemMatch[1]}", but I need to know which restaurant it&apos;s from. You can browse the menu and add items from there!`;
        } else {
          response = "I can help you add items! Please browse the menu and select items to add, or tell me the specific item name and restaurant.";
        }
      } else if (query.includes('remove') || query.includes('delete')) {
        if (items.length === 0) {
          response = "Your cart is empty, so there&apos;s nothing to remove!";
        } else {
          response = `You have ${items.length} item${items.length > 1 ? 's' : ''} in your cart. Which item would you like to remove?`;
        }
      } else if (query.includes('total') || query.includes('price') || query.includes('cost')) {
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        response = `Your cart total is ${total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}. You have ${items.length} item${items.length > 1 ? 's' : ''} in your cart.`;
      } else if (query.includes('quantity') || query.includes('change') || query.includes('update')) {
        if (items.length === 0) {
          response = "Your cart is empty!";
        } else {
          response = `You have ${items.length} item${items.length > 1 ? 's' : ''} in your cart. Which item&apos;s quantity would you like to change?`;
        }
      } else if (query.includes('drink') || query.includes('beverage')) {
        response = "Great idea! Drinks pair well with meals. Check out the beverage section in the restaurant menu to add your favorite drinks!";
      } else if (query.includes('suggestion') || query.includes('recommend')) {
        response = "Based on your cart, I&apos;d suggest adding a drink or dessert to complete your meal. Check out the suggestions above your cart items!";
      } else if (query.includes('clear') || query.includes('empty')) {
        response = "To clear your cart, you can remove items individually or use the &apos;Clear Cart&apos; button. Are you sure you want to clear everything?";
      } else {
        // Use AI to parse and respond
        try {
          const parsed = await parseNaturalLanguageQuery(query);
          
          if (parsed.keywords.length > 0) {
            response = `I understand you&apos;re looking for "${parsed.keywords.join(', ')}". You can browse the menu to find items matching your preferences!`;
          } else {
            response = "I&apos;m here to help! You can ask me to add items, check your total, modify quantities, or get suggestions. What would you like to do?";
          }
        } catch (error) {
          response = "I&apos;m here to help! You can ask me about your cart, add items, or get suggestions. What would you like to know?";
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again or use the menu to manage your cart directly.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="gradient-primary text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            <h3 className="font-bold text-lg">Cart Assistant</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-neutral-background text-neutral-text-primary'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-neutral-background rounded-2xl px-4 py-2">
                <Loader2 size={16} className="animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-neutral-border">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your cart&hellip;"
              className="flex-1 px-4 py-2 border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isProcessing}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              className="px-4 py-2 gradient-primary text-white rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

