"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Clock, Users, ChefHat, Star, ShoppingCart, Utensils } from "lucide-react";
import Link from "next/link";

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  estimatedPrice: number;
  quantity: number;
  unit: string;
  isEssential: boolean;
  isSelected: boolean;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags: string[];
  isFavorite: boolean;
  rating: number;
}

export default function RecipesFromGroceryPage() {
  const [selectedItems, setSelectedItems] = useState<GroceryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Mock recipes based on selected grocery items
  const mockRecipes: Recipe[] = [
    {
      id: "1",
      name: "Mediterranean Chicken Bowl",
      description: "A healthy and flavorful bowl with grilled chicken, quinoa, and fresh vegetables",
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: 'Easy',
      cuisine: 'Mediterranean',
      ingredients: [
        "2 lbs Chicken Breast, diced",
        "1 cup Quinoa",
        "2 cups Spinach",
        "1 head Broccoli, chopped",
        "3 Sweet Potatoes, cubed",
        "2 tbsp Olive Oil",
        "3 cloves Garlic, minced",
        "1 Onion, diced",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Preheat oven to 400°F. Toss sweet potatoes with olive oil and roast for 20 minutes.",
        "Cook quinoa according to package instructions.",
        "Season chicken with salt, pepper, and garlic. Cook in a pan until golden brown.",
        "Steam broccoli until tender, about 5 minutes.",
        "Sauté spinach with garlic until wilted.",
        "Assemble bowls with quinoa, chicken, vegetables, and sweet potatoes."
      ],
      nutrition: {
        calories: 450,
        protein: 35,
        carbs: 45,
        fat: 12
      },
      tags: ["High Protein", "Gluten-Free", "Healthy"],
      isFavorite: false,
      rating: 4.5
    },
    {
      id: "2",
      name: "Greek Yogurt Parfait",
      description: "A refreshing and protein-rich breakfast or snack",
      prepTime: 10,
      cookTime: 0,
      servings: 2,
      difficulty: 'Easy',
      cuisine: 'American',
      ingredients: [
        "1 container Greek Yogurt",
        "1 bunch Bananas, sliced",
        "3 lbs Apples, diced",
        "1 container Berries",
        "2 tbsp Honey (optional)"
      ],
      instructions: [
        "Layer Greek yogurt in serving glasses.",
        "Add sliced bananas and diced apples.",
        "Top with berries and drizzle with honey if desired.",
        "Serve immediately or refrigerate for up to 2 hours."
      ],
      nutrition: {
        calories: 280,
        protein: 20,
        carbs: 35,
        fat: 8
      },
      tags: ["Breakfast", "High Protein", "Quick"],
      isFavorite: false,
      rating: 4.2
    },
    {
      id: "3",
      name: "Vegetable Stir-Fry with Brown Rice",
      description: "A colorful and nutritious stir-fry perfect for a quick weeknight meal",
      prepTime: 20,
      cookTime: 15,
      servings: 4,
      difficulty: 'Easy',
      cuisine: 'Asian',
      ingredients: [
        "1 head Broccoli, cut into florets",
        "3 Bell Peppers, sliced",
        "1 head Spinach",
        "3 cloves Garlic, minced",
        "1 Onion, sliced",
        "2 tbsp Olive Oil",
        "1 bag Brown Rice",
        "Soy sauce to taste"
      ],
      instructions: [
        "Cook brown rice according to package instructions.",
        "Heat olive oil in a large wok or pan over high heat.",
        "Add garlic and onion, stir-fry for 2 minutes.",
        "Add broccoli and bell peppers, cook for 5 minutes.",
        "Add spinach and cook until wilted.",
        "Season with soy sauce and serve over brown rice."
      ],
      nutrition: {
        calories: 320,
        protein: 12,
        carbs: 55,
        fat: 8
      },
      tags: ["Vegetarian", "Quick", "Healthy"],
      isFavorite: false,
      rating: 4.0
    }
  ];

  useEffect(() => {
    // Load selected items from localStorage
    const storedItems = localStorage.getItem('selectedGroceryItems');
    if (storedItems) {
      setSelectedItems(JSON.parse(storedItems));
    }
  }, []);

  const handleGenerateRecipes = async () => {
    setIsGenerating(true);
    setMessage(null);
    
    try {
      // Mock API call to generate recipes based on selected items
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRecipes(mockRecipes);
      setMessage({ 
        type: 'success', 
        text: 'Recipes generated successfully! You can now favorite the ones you like.' 
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate recipes. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFavorite = (recipeId: string) => {
    setRecipes(prev => 
      prev.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, isFavorite: !recipe.isFavorite }
          : recipe
      )
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalTime = (prepTime: number, cookTime: number) => {
    return prepTime + cookTime;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recipes from Your Grocery List</h1>
          <p className="text-gray-600">AI-generated recipes based on your selected ingredients</p>
        </div>

        {/* Selected Items Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              Selected Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedItems.map((item) => (
                <Badge key={item.id} variant="outline" className="bg-green-50">
                  {item.name} ({item.quantity} {item.unit})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="text-center mb-6">
          <Button 
            onClick={handleGenerateRecipes}
            disabled={isGenerating || selectedItems.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isGenerating ? (
              <>
                <ChefHat className="w-4 h-4 mr-2 animate-spin" />
                Generating Recipes...
              </>
            ) : (
              <>
                <Utensils className="w-4 h-4 mr-2" />
                Generate Recipes
              </>
            )}
          </Button>
        </div>

        {/* Message */}
        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Recipes Grid */}
        {recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{recipe.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {recipe.description}
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => toggleFavorite(recipe.id)}
                      className={`p-2 rounded-full transition-colors ${
                        recipe.isFavorite 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${recipe.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Recipe Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getTotalTime(recipe.prepTime, recipe.cookTime)} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {recipe.servings} servings
                      </div>
                      <Badge className={getDifficultyColor(recipe.difficulty)}>
                        {recipe.difficulty}
                      </Badge>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{recipe.rating}</span>
                      <span className="text-sm text-gray-500">({recipe.cuisine})</span>
                    </div>

                    {/* Nutrition */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="font-medium">{recipe.nutrition.calories}</p>
                        <p className="text-gray-500">Cal</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="font-medium">{recipe.nutrition.protein}g</p>
                        <p className="text-gray-500">Protein</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="font-medium">{recipe.nutrition.carbs}g</p>
                        <p className="text-gray-500">Carbs</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="font-medium">{recipe.nutrition.fat}g</p>
                        <p className="text-gray-500">Fat</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {recipe.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Ingredients Preview */}
                    <div>
                      <p className="text-sm font-medium mb-2">Key Ingredients:</p>
                      <div className="text-xs text-gray-600">
                        {recipe.ingredients.slice(0, 3).join(', ')}
                        {recipe.ingredients.length > 3 && ` +${recipe.ingredients.length - 3} more`}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        // Store recipe in localStorage for viewing
                        localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
                        window.location.href = '/recipe-detail';
                      }}
                    >
                      View Recipe
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        // Add to favorites
                        toggleFavorite(recipe.id);
                      }}
                    >
                      {recipe.isFavorite ? 'Saved' : 'Save'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <Link href="/grocery-list">
            <Button variant="outline">
              ← Back to Grocery List
            </Button>
          </Link>
          
          <Link href="/myrecipes">
            <Button className="bg-green-600 hover:bg-green-700">
              View All Saved Recipes →
            </Button>
          </Link>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
