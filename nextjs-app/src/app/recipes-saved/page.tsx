"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/firebase/config";
import { getSavedRecipes, removeSavedRecipe } from "@/firebase/recipes";
import { onAuthStateChanged } from "firebase/auth";

interface Recipe {
  id: string;
  name: string;
  description: string;
  cookTime: number;
  cuisine: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  isFavorite?: boolean; // Made optional for compatibility with Firebase data
  rating: number;
  prepTime?: number;
}

export default function SavedRecipesPage() {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Redirect to login if no user is found
        console.log("No user logged in for saved recipes.");
        window.location.href = "/account";
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (userId) {
        try {
          const recipes = await getSavedRecipes(userId);
          setSavedRecipes(recipes);
        } catch (error: any) {
          console.error("Error fetching saved recipes:", error);
          setMessage({ type: "error", text: error.message || "Failed to load saved recipes." });
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (userId) {
      fetchRecipes();
    }
  }, [userId]);

  const handleRemoveRecipe = async (recipeId: string) => {
    if (!userId) {
      setMessage({ type: "error", text: "User not authenticated." });
      return;
    }
    try {
      await removeSavedRecipe(userId, recipeId);
      setSavedRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
      setMessage({ type: "success", text: "Recipe removed successfully!" });
    } catch (error: any) {
      console.error("Error removing recipe:", error);
      setMessage({ type: "error", text: error.message || "Failed to remove recipe." });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading saved recipes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Saved Recipes</h1>
          <p className="text-gray-600">Your collection of favorited meals</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-3 rounded-md ${message.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
            {message.text}
          </div>
        )}

        {/* Saved Recipes Grid */}
        {savedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRecipes.map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{recipe.name}</CardTitle>
                      <CardDescription className="text-sm">{recipe.description}</CardDescription>
                    </div>
                    <button
                      onClick={() => handleRemoveRecipe(recipe.id)}
                      className="p-2 rounded-full text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Recipe Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {recipe.cookTime} min
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
                      {(recipe.tags || []).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Ingredients Preview */}
                    <div>
                      <p className="text-sm font-medium mb-2">Key Ingredients:</p>
                      <div className="text-xs text-gray-600">
                        {(recipe.ingredients || []).slice(0, 3).join(", ")}
                        {(recipe.ingredients || []).length > 3 &&
                          ` +${(recipe.ingredients || []).length - 3} more`}
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600 text-lg mb-4">You haven't saved any recipes yet.</p>
            <Link href="/recipes-from-grocery">
              <Button className="bg-green-600 hover:bg-green-700">Discover New Recipes</Button>
            </Link>
          </div>
        )}

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
