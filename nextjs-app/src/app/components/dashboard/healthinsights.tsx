"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface HealthInsight {
  id: string;
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
}

interface HealthInsightsProps {
  insights?: HealthInsight[];
  className?: string;
}

export default function HealthInsights({ insights, className }: HealthInsightsProps) {
  // Mock insights if none provided
  const mockInsights: HealthInsight[] = insights || [
    {
      id: '1',
      type: 'positive',
      title: 'Great Progress!',
      description: 'You\'ve been consistent with your healthy eating goals this week.',
      action: 'Keep it up!'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Sodium Intake',
      description: 'Your sodium intake is slightly above the recommended daily limit.',
      action: 'Try reducing processed foods'
    },
    {
      id: '3',
      type: 'info',
      title: 'New Recipe Suggestion',
      description: 'Based on your preferences, try our Mediterranean Quinoa Bowl recipe.',
      action: 'View Recipe'
    },
    {
      id: '4',
      type: 'positive',
      title: 'Protein Goals Met',
      description: 'You\'ve exceeded your daily protein target for 3 days in a row.',
      action: 'Excellent work!'
    }
  ];

  const getIcon = (type: HealthInsight['type']) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default:
        return <Heart className="w-5 h-5 text-green-600" />;
    }
  };

  const getBadgeVariant = (type: HealthInsight['type']) => {
    switch (type) {
      case 'positive':
        return 'default' as const;
      case 'warning':
        return 'secondary' as const;
      case 'info':
        return 'outline' as const;
      default:
        return 'default' as const;
    }
  };

  const getBadgeColor = (type: HealthInsight['type']) => {
    switch (type) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Card className={`border-0 shadow-sm bg-white/80 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-green-600" />
          Health Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockInsights.map((insight) => (
          <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(insight.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                <Badge 
                  variant={getBadgeVariant(insight.type)}
                  className={`text-xs ${getBadgeColor(insight.type)}`}
                >
                  {insight.type}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
              {insight.action && (
                <p className="text-xs font-medium text-green-600">{insight.action}</p>
              )}
            </div>
          </div>
        ))}
        
        {mockInsights.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No insights available</p>
            <p className="text-sm">Complete your health profile to get personalized insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
