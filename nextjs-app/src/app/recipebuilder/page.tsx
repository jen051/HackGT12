"use client";

import React, { useState } from "react";
import { Recipe, User } from "@/entities/all";
import { InvokeLLM } from "@/integrations/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Plus, X, Calculator, Save, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RecipeBuilder() {
  const [recipe, setRecipe] = useState<any>({
    title: "",
    description: "",
    servings: 4,
    prep_time: 15,
    cook_time: 30,
    difficulty: "easy",
    ingredients: [{ name: "", amount: "", unit: "" }],
    instructions: [""],
    health_benefits: [],
    suitable_conditions: [],
    dietary_tags: []
  });
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<any>(null);
  const [calculatedNutrition, setCalculatedNutrition] = useState<any>(null);

  const addIngredient = () => {
    setRecipe((prev: any) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", amount: "", unit: "" }]
    }));
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    setRecipe((prev: any) => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient: any, i: number) =>
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  const removeIngredient = (index: number) => {
    setRecipe((prev: any) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_: any, i: number) => i !== index)
    }));
  };

  const addInstruction = () => {
    setRecipe((prev: any) => ({
      ...prev,
      instructions: [...prev.instructions, ""]
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setRecipe((prev: any) => ({
      ...prev,
      instructions: prev.instructions.map((instruction: string, i: number) =>
        i === index ? value : instruction
      )
    }));
  };

  const removeInstruction = (index: number) => {
    setRecipe((prev: any) => ({
      ...prev,
      instructions: prev.instructions.filter((_: string, i: number) => i !== index)
    }));
  };

  const calculateNutrition = async () => {
    setIsCalculating(true);
    try {
      const ingredientsList = recipe.ingredients
        .filter((ing: any) => ing.name.trim())
        .map((ing: any) => `${ing.amount} ${ing.unit} ${ing.name}`)
        .join(", ");

      const nutritionResult = await InvokeLLM({
        prompt: `Calculate the nutrition information for this recipe with ${recipe.servings} servings:

Ingredients: ${ingredientsList}

Instructions: ${recipe.instructions.filter((inst: string) => inst.trim()).join(". ")}

Please provide detailed nutrition information per serving, health benefits, suitable health conditions, and dietary tags.`,
        response_json_schema: {
          type: "object",
          properties: {
            nutrition: {
              type: "object",
              properties: {
                calories: { type: "number" },
                protein: { type: "number" },
                carbs: { type: "number" },
                fat: { type: "number" },
                fiber: { type: "number" },
                sodium: { type: "number" },
                sugar: { type: "number" }
              }
            },
            health_benefits: {
              type: "array",
              items: { type: "string" }
            },
            suitable_conditions: {
              type: "array",
              items: { type: "string" }
            },
            dietary_tags: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setCalculatedNutrition(nutritionResult.nutrition);
      setRecipe((prev: any) => ({
        ...prev,
        nutrition: nutritionResult.nutrition,
        health_benefits: nutritionResult.health_benefits || [],
        suitable_conditions: nutritionResult.suitable_conditions || [],
        dietary_tags: nutritionResult.dietary_tags || []
      }));

      setMessage({ type: "success", text: "Nutrition calculated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Error calculating nutrition. Please try again." });
    }
    setIsCalculating(false);
  };

  const saveRecipe = async () => {
    setIsSaving(true);
    try {
      await Recipe.create(recipe);
      setMessage({ type: "success", text: "Recipe saved successfully!" });
      // Reset form
      setRecipe({
        title: "",
        description: "",
        servings: 4,
        prep_time: 15,
        cook_time: 30,
        difficulty: "easy",
        ingredients: [{ name: "", amount: "", unit: "" }],
        instructions: [""],
        health_benefits: [],
        suitable_conditions: [],
        dietary_tags: []
      });
      setCalculatedNutrition(null);
    } catch (error) {
      setMessage({ type: "error", text: "Error saving recipe. Please try again." });
    }
    setIsSaving(false);
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-green-600" />
            Recipe Builder
          </h1>
          <p className="text-gray-600">
            Create healthy, personalized recipes with automatic nutrition analysis
          </p>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* Basic Recipe Info */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recipe Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Recipe Title</Label>
                  <Input
                    id="title"
                    value={recipe.title}
                    onChange={(e) => setRecipe((prev: any) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter recipe title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={recipe.difficulty}
                    onValueChange={(value) => setRecipe((prev: any) => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={recipe.description}
                    onChange={(e) => setRecipe((prev: any) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the recipe"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={recipe.servings}
                    onChange={(e) => setRecipe((prev: any) => ({ ...prev, servings: parseInt(e.target.value) }))}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prep_time">Prep Time (min)</Label>
                  <Input
                    id="prep_time"
                    type="number"
                    value={recipe.prep_time}
                    onChange={(e) => setRecipe((prev: any) => ({ ...prev, prep_time: parseInt(e.target.value) }))}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cook_time">Cook Time (min)</Label>
                  <Input
                    id="cook_time"
                    type="number"
                    value={recipe.cook_time}
                    onChange={(e) => setRecipe((prev: any) => ({ ...prev, cook_time: parseInt(e.target.value) }))}
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Ingredients
                <Button onClick={addIngredient} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ingredient
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recipe.ingredients.map((ingredient: any, index: number) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select
                      value={ingredient.unit}
                      onValueChange={(value) => updateIngredient(index, 'unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cup">Cup</SelectItem>
                        <SelectItem value="tbsp">Tbsp</SelectItem>
                        <SelectItem value="tsp">Tsp</SelectItem>
                        <SelectItem value="lb">Pound</SelectItem>
                        <SelectItem value="oz">Ounce</SelectItem>
                        <SelectItem value="g">Gram</SelectItem>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="clove">Clove</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ingredient</Label>
                    <Input
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      placeholder="Ingredient name"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    disabled={recipe.ingredients.length === 1}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Instructions
                <Button onClick={addInstruction} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recipe.instructions.map((instruction: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-semibold text-green-700">
                    {index + 1}
                  </div>
                  <Textarea
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder={`Step ${index + 1} instructions...`}
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeInstruction(index)}
                    disabled={recipe.instructions.length === 1}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Nutrition Analysis */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Nutrition Analysis
                <Button 
                  onClick={calculateNutrition} 
                  disabled={isCalculating || !recipe.title.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  {isCalculating ? "Calculating..." : "Analyze Nutrition"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calculatedNutrition ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(calculatedNutrition).map(([key, value]: [string, any]) => (
                      <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(value)}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {key === 'sodium' ? `${key} (mg)` : key === 'calories' ? key : `${key} (g)`}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Dietary Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {recipe.dietary_tags.map((tag: string) => (
                          <Badge key={tag} className="bg-green-100 text-green-800">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {recipe.health_benefits && recipe.health_benefits.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Health Benefits</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {recipe.health_benefits.map((benefit: string, index: number) => (
                          <li key={index} className="text-gray-700">{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Add ingredients and click "Analyze Nutrition" to get detailed nutritional information
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Recipe */}
          <div className="flex justify-end">
            <Button
              onClick={saveRecipe}
              disabled={isSaving || !recipe.title.trim() || recipe.ingredients.filter((ing: any) => ing.name.trim()).length === 0}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Recipe"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}