'use client';

import { useState, useEffect } from 'react';
import { aiService } from '@/lib/ai-service';
import { ShieldExclamationIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Badge from './ui/Badge';
import { motion } from 'framer-motion';

interface RestaurantApplication {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  cuisineType: string;
  documents?: {
    license?: string;
    taxId?: string;
    photos?: string[];
  };
  submittedAt: string;
}

interface AIRiskAssessment {
  fraudRisk: 'low' | 'medium' | 'high';
  confidence: number;
  flags: string[];
  missingDocuments: string[];
  recommendations: string[];
  overallScore: number; // 0-100
}

interface AIApprovalAssistantProps {
  application: RestaurantApplication;
  onRecommendation?: (recommendation: 'approve' | 'reject' | 'request-info') => void;
}

export default function AIApprovalAssistant({ application, onRecommendation }: AIApprovalAssistantProps) {
  const [assessment, setAssessment] = useState<AIRiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeApplication();
  }, [application]);

  const analyzeApplication = async () => {
    setLoading(true);
    try {
      // Simulate AI analysis (in production, this would call the AI service)
      // For now, we'll create a mock assessment based on application data
      const flags: string[] = [];
      const missingDocuments: string[] = [];
      
      if (!application.documents?.license) missingDocuments.push('Business License');
      if (!application.documents?.taxId) missingDocuments.push('Tax ID');
      if (!application.documents?.photos || application.documents.photos.length === 0) {
        missingDocuments.push('Restaurant Photos');
      }

      // Check for potential fraud indicators
      const emailDomain = application.email.split('@')[1];
      if (emailDomain && (emailDomain.includes('tempmail') || emailDomain.includes('guerrillamail'))) {
        flags.push('Suspicious email domain');
      }

      if (!application.phone || application.phone.length < 10) {
        flags.push('Invalid or incomplete phone number');
      }

      if (!application.address || application.address.length < 10) {
        flags.push('Incomplete address');
      }

      // Calculate risk score
      let riskScore = 0;
      if (flags.length > 2) riskScore = 75;
      else if (flags.length > 0) riskScore = 50;
      else riskScore = 25;

      if (missingDocuments.length > 0) riskScore += 15 * missingDocuments.length;
      
      const fraudRisk: 'low' | 'medium' | 'high' = riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low';

      const recommendations: string[] = [];
      if (missingDocuments.length > 0) {
        recommendations.push(`Request missing documents: ${missingDocuments.join(', ')}`);
      }
      if (flags.length > 0) {
        recommendations.push('Verify identity documents before approval');
      }
      if (fraudRisk === 'low' && missingDocuments.length === 0) {
        recommendations.push('Safe to approve - all checks passed');
      }

      const aiAssessment: AIRiskAssessment = {
        fraudRisk,
        confidence: 0.75,
        flags,
        missingDocuments,
        recommendations,
        overallScore: 100 - riskScore,
      };

      setAssessment(aiAssessment);

      // Auto-recommend action
      if (onRecommendation) {
        if (missingDocuments.length > 0) {
          onRecommendation('request-info');
        } else if (fraudRisk === 'high') {
          onRecommendation('reject');
        } else {
          onRecommendation('approve');
        }
      }
    } catch (error) {
      console.error('AI analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg p-6 border border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-background rounded w-1/3"></div>
          <div className="h-20 bg-background rounded"></div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-lg p-6 border border-border space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShieldExclamationIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">AI Risk Assessment</h3>
            <p className="text-sm text-text-secondary">Automated pre-screening analysis</p>
          </div>
        </div>
        <Badge variant={assessment.fraudRisk === 'low' ? 'success' : assessment.fraudRisk === 'medium' ? 'warning' : 'error'}>
          {assessment.fraudRisk.toUpperCase()} RISK
        </Badge>
      </div>

      {/* Overall Score */}
      <div className="bg-background rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-secondary">Overall Approval Score</span>
          <span className="text-2xl font-bold text-text-primary">{assessment.overallScore}/100</span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${assessment.overallScore}%` }}
            transition={{ duration: 0.5 }}
            className={`h-2 rounded-full ${
              assessment.overallScore >= 70
                ? 'bg-green-500'
                : assessment.overallScore >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
          />
        </div>
      </div>

      {/* Missing Documents */}
      {assessment.missingDocuments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-warning" />
            <h4 className="font-semibold text-text-primary">Missing Documents</h4>
          </div>
          <div className="space-y-1">
            {assessment.missingDocuments.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-text-secondary">
                <XCircleIcon className="h-4 w-4 text-error" />
                {doc}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Flags */}
      {assessment.flags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldExclamationIcon className="h-5 w-5 text-warning" />
            <h4 className="font-semibold text-text-primary">Risk Flags</h4>
          </div>
          <div className="space-y-1">
            {assessment.flags.map((flag, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-text-secondary">
                <ShieldExclamationIcon className="h-4 w-4 text-warning" />
                {flag}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-text-primary">AI Recommendations</h4>
        </div>
        <div className="space-y-2">
          {assessment.recommendations.map((rec, idx) => (
            <div key={idx} className="bg-background rounded-lg p-3 text-sm text-text-primary">
              {rec}
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Score */}
      <div className="pt-4 border-t border-border text-xs text-text-secondary">
        <span>Analysis Confidence: {(assessment.confidence * 100).toFixed(0)}%</span>
      </div>
    </motion.div>
  );
}
