"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ChefHat } from 'lucide-react';
import { RecipeData } from '@/entities/all';

interface RecentRecipesProps {
  recipes?: RecipeData[];
  className?: string;
}

export default function RecentRecipes({ recipes = [], className }: RecentRecipesProps) {
  // Mock data if no recipes provided
  const mockRecipes: RecipeData[] = recipes.length > 0 ? recipes : [
    {
      id: '1',
      title: 'Mediterranean Quinoa Bowl',
      description: 'A nutritious bowl with quinoa, vegetables, and feta',
      prep_time: 15,
      cook_time: 20,
      servings: 2,
      difficulty: 'easy',
      nutrition: {
        calories: 320,
        protein: 12,
        carbs: 45,
        fat: 11
      },
      dietary_tags: ['vegetarian', 'gluten-free'],
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Green Smoothie Bowl',
      description: 'Refreshing breakfast bowl with spinach and tropical fruits',
      prep_time: 10,
      cook_time: 0,
      servings: 1,
      difficulty: 'easy',
      nutrition: {
        calories: 380,
        protein: 8,
        carbs: 52,
        fat: 16
      },
      dietary_tags: ['vegan', 'raw'],
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      title: 'Baked Salmon with Vegetables',
      description: 'Heart-healthy salmon with roasted vegetables',
      prep_time: 20,
      cook_time: 25,
      servings: 4,
      difficulty: 'medium',
      nutrition: {
        calories: 420,
        protein: 35,
        carbs: 28,
        fat: 18
      },
      dietary_tags: ['high-protein', 'omega-3'],
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={`border-0 shadow-sm bg-white/80 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-green-600" />
          Recent Recipes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockRecipes.map((recipe) => (
          <div key={recipe.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ChefHat className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{recipe.title}</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {(recipe.prep_time || 0) + (recipe.cook_time || 0)}m
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {recipe.servings} servings
                </div>
                <div className="font-medium text-green-600">
                  {recipe.nutrition?.calories} cal
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {recipe.dietary_tags?.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {recipe.dietary_tags && recipe.dietary_tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{recipe.dietary_tags.length - 2}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-400 flex-shrink-0">
              {formatDate(recipe.created_at || '')}
            </div>
          </div>
        ))}
        
        {mockRecipes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ChefHat className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No recipes yet</p>
            <p className="text-sm">Start building your healthy recipe collection!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
