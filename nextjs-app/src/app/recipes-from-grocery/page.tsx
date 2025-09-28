"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Clock, Users, ChefHat, Star, ShoppingCart, Utensils } from "lucide-react";
import Link from "next/link";
import { auth } from "@/firebase/config";
import { saveRecipe, removeSavedRecipe } from "@/firebase/recipes";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection } from "firebase/firestore";
import { db } from "@/firebase/config";

interface GroceryItem {
  name: string;
  quantity: number;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  cookTime: number;
  cuisine: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  isFavorite?: boolean; // Made optional for compatibility with Firebase saving
  rating: number;
}

export default function RecipesFromGroceryPage() {
  const [selectedItems, setSelectedItems] = useState<GroceryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Mock recipes
  const mockRecipes: Recipe[] = [
    {
      id: "1",
      name: "Mediterranean Chicken Bowl",
      description: "A healthy and flavorful bowl with grilled chicken, quinoa, and fresh vegetables",
      cookTime: 40,
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
      cookTime: 10,
      cuisine: "American",
      ingredients: ["Greek Yogurt", "Bananas", "Apples", "Berries"],
      instructions: ["Layer yogurt", "Add fruit", "Drizzle honey"],
      tags: ["Breakfast", "Quick"],
      isFavorite: false,
      rating: 4.2,
    },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchGroceryList(user.uid);
      } else {
        console.log("No user logged in for recipe generation.");
        window.location.href = '/account';
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchGroceryList = async (uid: string) => {
    try {
      const groceryListDocRef = doc(db, "users", uid, "groceryList", "listData");
      const docSnap = await getDoc(groceryListDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.items)) {
          setSelectedItems(data.items as GroceryItem[]);
        }
      } else {
        console.log("No grocery list found!");
        setSelectedItems([]);
      }
    } catch (error) {
      console.error("Error fetching grocery list:", error);
      setMessage({ type: "error", text: "Failed to load grocery list." });
    }
  };

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

  const toggleFavorite = async (recipeId: string) => {
    if (!userId) {
      setMessage({ type: "error", text: "User not authenticated. Please log in again." });
      return;
    }

    const updatedRecipes = recipes.map((recipe) =>
      recipe.id === recipeId ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
    );
    setRecipes(updatedRecipes);

    const favoritedRecipe = updatedRecipes.find((recipe) => recipe.id === recipeId);

    if (favoritedRecipe) {
      try {
        if (favoritedRecipe.isFavorite) {
          // Save to Firestore, exclude isFavorite field
          const { isFavorite, ...recipeToSave } = favoritedRecipe;
          await saveRecipe(userId, recipeToSave);
          setMessage({ type: "success", text: "Recipe saved to your favorites!" });
        } else {
          // Remove from Firestore
          await removeSavedRecipe(userId, recipeId);
          setMessage({ type: "success", text: "Recipe removed from your favorites." });
        }
      } catch (error: any) {
        console.error("Error updating favorite status:", error);
        setMessage({ type: "error", text: error.message || "Failed to update favorite status." });
        // Revert UI state if Firebase update fails
        setRecipes((prev) =>
          prev.map((recipe) =>
            recipe.id === recipeId ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
          )
        );
      }
    }
  };

  // const toggleItem = (id: string) => {
  //   if (isDone) return; // disable after done
  //   setSelectedItems((prev) =>
  //     prev.map((item) =>
  //       item.id === id ? { ...item, isSelected: !item.isSelected } : item
  //     )
  //   );
  // };

  // const handleDone = () => {
  //   setIsDone(true);
  //   const finalList = selectedItems.filter((item) => item.isSelected);
  //   localStorage.setItem("finalGroceryList", JSON.stringify(finalList));
  //   //alert("Final grocery list saved!");
  // };

  const getTotalTime = (cookTime: number) => cookTime;

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
                  key={item.name}
                  className="bg-green-100 text-green-800"
                >
                  {item.name} ({item.quantity})
                </Badge>
              ))}
            </div>
            {/* <div className="text-center mt-4">
              <Button onClick={handleDone} disabled={isDone} className="bg-green-600 hover:bg-green-700">
                {isDone ? "Done ✔️" : "Finalize List"}
              </Button>
            </div> */}
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="text-center mb-6">
          <Button
            onClick={handleGenerateRecipes}
            disabled={isGenerating || selectedItems.filter((i) => i.quantity > 0).length === 0}
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
                        {getTotalTime(recipe.cookTime)} min
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
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
