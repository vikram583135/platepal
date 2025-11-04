'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp, Mail, Phone, MessageCircle, HelpCircle } from 'lucide-react';

export default function HelpPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How do I track my order?',
      answer: 'Once your order is placed, you can track it in real-time from the Orders page. Click on any order to see its current status and estimated delivery time.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, digital wallets, and cash on delivery. Your payment information is securely encrypted.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery times vary by restaurant and location, but typically range from 30-45 minutes. You can see the estimated time before placing your order.',
    },
    {
      question: 'Can I cancel my order?',
      answer: 'You can cancel your order within 2 minutes of placing it. After that, please contact customer support for assistance.',
    },
    {
      question: 'What if my order is wrong or missing items?',
      answer: 'Contact us immediately through the app or call our support team. We\'ll work with the restaurant to resolve the issue and may offer a refund or replacement.',
    },
    {
      question: 'Do you have a minimum order amount?',
      answer: 'Minimum order amounts vary by restaurant. You\'ll see the minimum order requirement on each restaurant\'s menu page.',
    },
    {
      question: 'How do I apply a promo code?',
      answer: 'Enter your promo code at checkout before confirming your order. The discount will be applied to your total automatically.',
    },
    {
      question: 'Is there a delivery fee?',
      answer: 'Delivery fees vary based on distance and restaurant. Some restaurants offer free delivery on orders above a certain amount.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-neutral-background pb-20">
      {/* Header */}
      <div className="bg-white shadow-elevated sticky top-0 z-40 animate-slide-down">
        <div className="flex items-center p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-primary-light rounded-full active:scale-95 transition-all"
          >
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <h1 className="text-lg font-bold text-neutral-text-primary flex-1 text-center">
            Help & Support
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Contact Options */}
        <div className="bg-white rounded-md p-6 shadow-md animate-slide-up">
          <h2 className="text-xl font-bold text-neutral-text-primary mb-4">Contact Us</h2>
          <div className="space-y-3">
            <a
              href="tel:+1234567890"
              className="flex items-center gap-4 p-4 bg-secondary-light rounded-md hover:bg-secondary hover:text-white transition-all group"
            >
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center group-hover:bg-white transition-all">
                <Phone size={24} className="text-white group-hover:text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold group-hover:text-white">Call Us</p>
                <p className="text-sm text-neutral-text-secondary group-hover:text-white">+1 (234) 567-890</p>
              </div>
            </a>

            <a
              href="mailto:support@platepal.com"
              className="flex items-center gap-4 p-4 bg-primary-light rounded-md hover:bg-primary hover:text-white transition-all group"
            >
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center group-hover:bg-white transition-all">
                <Mail size={24} className="text-white group-hover:text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold group-hover:text-white">Email Us</p>
                <p className="text-sm text-neutral-text-secondary group-hover:text-white">support@platepal.com</p>
              </div>
            </a>

            <button className="flex items-center gap-4 p-4 bg-accent-light rounded-md hover:bg-accent hover:text-neutral-text-primary transition-all group w-full">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center group-hover:bg-white transition-all">
                <MessageCircle size={24} className="text-neutral-text-primary group-hover:text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold group-hover:text-neutral-text-primary">Live Chat</p>
                <p className="text-sm text-neutral-text-secondary group-hover:text-neutral-text-primary">Available 24/7</p>
              </div>
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-md p-6 shadow-md animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={24} className="text-primary" />
            <h2 className="text-xl font-bold text-neutral-text-primary">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-neutral-border rounded-md overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-primary-light transition-all"
                >
                  <span className="font-semibold text-neutral-text-primary pr-4">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp size={20} className="text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-neutral-text-secondary flex-shrink-0" />
                  )}
                </button>
                
                {openFaq === index && (
                  <div className="px-4 pb-4 text-sm text-neutral-text-secondary leading-relaxed animate-slide-down">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="bg-gradient-to-br from-primary-light to-secondary-light rounded-md p-6 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="font-bold text-neutral-text-primary mb-2">Still need help?</h3>
          <p className="text-sm text-neutral-text-secondary mb-4">
            Our support team is here to help you 24/7
          </p>
          <button className="gradient-primary text-white px-6 py-3 rounded-md font-semibold shadow-md hover-lift ripple">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

