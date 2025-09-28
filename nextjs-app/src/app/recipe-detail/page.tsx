"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, ArrowLeft } from "lucide-react";

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

export default function RecipeDetailPage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedRecipe = localStorage.getItem("selectedRecipe");
    if (storedRecipe) {
      setRecipe(JSON.parse(storedRecipe));
    }
  }, []);

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No recipe selected.</p>
      </div>
    );
  }

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Recipe Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{recipe.name}</CardTitle>
            <p className="text-gray-600">{recipe.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Meta Info */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {totalTime} min
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                {recipe.rating}
              </div>
              <span className="text-gray-500">{recipe.cuisine}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Ingredients */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Ingredients</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Instructions</h2>
              <ol className="list-decimal pl-5 text-gray-700 space-y-2">
                {recipe.instructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>

            {/* Save Button */}
            <div className="text-center">
              <Button className="bg-green-600 hover:bg-green-700">Save Recipe</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
