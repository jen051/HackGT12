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
  quantity: string;
  isSelected: boolean;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
  cuisine: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  isFavorite: boolean;
  rating: number;
}

export default function RecipesFromGroceryPage() {
  // Mock grocery items
  const initialItems: GroceryItem[] = [
    { id: "1", name: "Tomato", quantity: "3", isSelected: true },
    { id: "2", name: "Milk", quantity: "1", isSelected: true },
    { id: "3", name: "Bread", quantity: "2", isSelected: true },
  ];

  const [selectedItems, setSelectedItems] = useState<GroceryItem[]>(initialItems);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isDone, setIsDone] = useState(false);

  // Mock recipes
  const mockRecipes: Recipe[] = [
    {
      id: "1",
      name: "Mediterranean Chicken Bowl",
      description: "A healthy and flavorful bowl with grilled chicken, quinoa, and fresh vegetables",
      prepTime: 15,
      cookTime: 25,
      cuisine: "Mediterranean",
      ingredients: ["Chicken", "Quinoa", "Spinach", "Broccoli", "Sweet Potatoes"],
      instructions: ["Cook stuff", "Mix together", "Serve hot"],
      tags: ["Healthy", "Gluten-Free"],
      isFavorite: false,
      rating: 4.5,
    },
    {
      id: "2",
      name: "Greek Yogurt Parfait",
      description: "A refreshing and protein-rich breakfast or snack",
      prepTime: 10,
      cookTime: 0,
      cuisine: "American",
      ingredients: ["Greek Yogurt", "Bananas", "Apples", "Berries"],
      instructions: ["Layer yogurt", "Add fruit", "Drizzle honey"],
      tags: ["Breakfast", "Quick"],
      isFavorite: false,
      rating: 4.2,
    },
  ];

  const handleGenerateRecipes = async () => {
    setIsGenerating(true);
    setMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // mock API delay
      setRecipes(mockRecipes);
      setMessage({
        type: "success",
        text: "Recipes generated successfully! You can now favorite the ones you like.",
      });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to generate recipes. Please try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFavorite = (recipeId: string) => {
    setRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === recipeId ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
      )
    );
  };

  const toggleItem = (id: string) => {
    if (isDone) return; // disable after done
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const handleDone = () => {
    setIsDone(true);
    const finalList = selectedItems.filter((item) => item.isSelected);
    localStorage.setItem("finalGroceryList", JSON.stringify(finalList));
    //alert("Final grocery list saved!");
  };

  const getTotalTime = (prepTime: number, cookTime: number) => prepTime + cookTime;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recipes from Your Grocery List</h1>
          <p className="text-gray-600">AI-generated recipes based on your selected ingredients</p>
        </div>

        {/* Grocery List */}
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
                <Badge
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`cursor-pointer ${
                    item.isSelected
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-200 text-gray-500 line-through"
                  }`}
                >
                  {item.name} ({item.quantity})
                </Badge>
              ))}
            </div>
            <div className="text-center mt-4">
              <Button onClick={handleDone} disabled={isDone} className="bg-green-600 hover:bg-green-700">
                {isDone ? "Done ✔️" : "Finalize List"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="text-center mb-6">
          <Button
            onClick={handleGenerateRecipes}
            disabled={isGenerating || selectedItems.filter((i) => i.isSelected).length === 0}
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
          <Alert
            className={`mb-6 ${
              message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
            }`}
          >
            <AlertDescription
              className={message.type === "error" ? "text-red-800" : "text-green-800"}
            >
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
                      <CardDescription className="text-sm">{recipe.description}</CardDescription>
                    </div>
                    <button
                      onClick={() => toggleFavorite(recipe.id)}
                      className={`p-2 rounded-full transition-colors ${
                        recipe.isFavorite
                          ? "text-red-500 hover:text-red-600"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${recipe.isFavorite ? "fill-current" : ""}`} />
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
                      <span className="text-sm text-gray-500">({recipe.cuisine})</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{recipe.rating}</span>
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
                        {recipe.ingredients.slice(0, 3).join(", ")}
                        {recipe.ingredients.length > 3 &&
                          ` +${recipe.ingredients.length - 3} more`}
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
                        localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
                        window.location.href = "/recipe-detail";
                      }}
                    >
                      View Recipe
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => toggleFavorite(recipe.id)}
                    >
                      {recipe.isFavorite ? "Saved" : "Save"}
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
            <Button variant="outline">← Back to Grocery List</Button>
          </Link>

          <Link href="/dashboard">
            <Button className="bg-green-600 hover:bg-green-700">View My Dashboard →</Button>
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
