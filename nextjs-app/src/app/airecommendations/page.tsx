"use client";

import React, { useState, useEffect } from "react";
import { UserHealthProfile, User } from "@/entities/all";
import { InvokeLLM } from "@/integrations/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Heart, Clock, Users, ChefHat } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AIRecommendations() {
  const [healthProfile, setHealthProfile] = useState<any>(null);
  const [customRequest, setCustomRequest] = useState("");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    loadHealthProfile();
  }, []);

  const loadHealthProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const user = await User.me();
      const profiles = await UserHealthProfile.filter({ created_by: User.email });
      if (profiles.length > 0) {
        setHealthProfile(profiles[0]);
      }
    } catch (error) {
      console.error("Error loading health profile:", error);
    }
    setIsLoadingProfile(false);
  };

  const getRecommendations = async (requestType = "general") => {
    setIsLoading(true);
    setRecommendations([]);

    try {
      let prompt = "";
      
      if (requestType === "general") {
        if (!healthProfile) {
          prompt = "Suggest 5 healthy, nutritious recipes suitable for general wellness. Include variety in cuisines and cooking methods.";
        } else {
          prompt = `Based on this health profile, suggest 5 personalized healthy recipes:

Health Conditions: ${healthProfile.health_conditions?.join(", ") || "None specified"}
Allergies: ${healthProfile.allergies?.join(", ") || "None"}  
Dietary Preferences: ${healthProfile.dietary_preferences?.join(", ") || "None"}
Daily Calorie Goal: ${healthProfile.daily_calorie_goal || 2000}
Sodium Limit: ${healthProfile.daily_sodium_limit || 2300}mg
Sugar Limit: ${healthProfile.daily_sugar_limit || 50}g

Please provide recipes that are specifically tailored to these health needs.`;
        }
      } else {
        prompt = `${customRequest}

${healthProfile ? `Consider my health profile:
Health Conditions: ${healthProfile.health_conditions?.join(", ") || "None"}
Allergies: ${healthProfile.allergies?.join(", ") || "None"}
Dietary Preferences: ${healthProfile.dietary_preferences?.join(", ") || "None"}` : ""}

Please provide detailed recipes with nutritional information.`;
      }

      const result = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recipes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  prep_time: { type: "number" },
                  cook_time: { type: "number" },
                  servings: { type: "number" },
                  difficulty: { type: "string" },
                  ingredients: {
                    type: "array",
                    items: { type: "string" }
                  },
                  instructions: {
                    type: "array", 
                    items: { type: "string" }
                  },
                  nutrition: {
                    type: "object",
                    properties: {
                      calories: { type: "number" },
                      protein: { type: "number" },
                      carbs: { type: "number" },
                      fat: { type: "number" },
                      fiber: { type: "number" },
                      sodium: { type: "number" }
                    }
                  },
                  health_benefits: {
                    type: "array",
                    items: { type: "string" }
                  },
                  dietary_tags: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      });

      setRecommendations(result.recipes || []);
    } catch (error) {
      console.error("Error getting recommendations:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            AI Recipe Recommendations
          </h1>
          <p className="text-gray-600">
            Get personalized recipe suggestions based on your health profile and preferences
          </p>
        </div>

        {/* Health Profile Status */}
        {!isLoadingProfile && (
          <Card className="mb-8 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              {healthProfile ? (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Health Profile Active</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {healthProfile.health_conditions?.map((condition: string) => (
                        <Badge key={condition} variant="secondary">{condition}</Badge>
                      ))}
                      {healthProfile.dietary_preferences?.map((pref: string) => (
                        <Badge key={pref} className="bg-green-100 text-green-800">{pref}</Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      Recommendations will be tailored to your specific health needs and dietary preferences.
                    </p>
                  </div>
                </div>
              ) : (
                <Alert>
                  <Heart className="w-4 h-4" />
                  <AlertDescription>
                    No health profile found. <a href="/HealthProfile" className="text-blue-600 underline">Create your health profile</a> to get personalized recommendations.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Request Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Quick Recommendations */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-green-600" />
                Quick Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Get instant recipe suggestions based on your health profile
              </p>
              <Button
                onClick={() => getRecommendations("general")}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isLoading ? "Getting Recommendations..." : "Get Recommendations"}
              </Button>
            </CardContent>
          </Card>

          {/* Custom Request */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Custom Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom">Describe what you're looking for</Label>
                <Textarea
                  id="custom"
                  value={customRequest}
                  onChange={(e) => setCustomRequest(e.target.value)}
                  placeholder="e.g., 'I need heart-healthy dinner recipes under 400 calories' or 'Quick breakfast ideas for diabetics'"
                  rows={3}
                />
              </div>
              <Button
                onClick={() => getRecommendations("custom")}
                disabled={isLoading || !customRequest.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isLoading ? "Generating..." : "Get Custom Recommendations"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recipe Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Personalized Recipes</h2>
            <div className="grid gap-6">
              {recommendations.map((recipe, index) => (
                <Card key={index} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-2">{recipe.title}</CardTitle>
                        <p className="text-gray-600">{recipe.description}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {recipe.difficulty || "Easy"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Recipe Stats */}
                    <div className="flex gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {recipe.servings || 4} servings
                      </div>
                      <div className="font-semibold">
                        {recipe.nutrition?.calories || 0} calories
                      </div>
                    </div>

                    {/* Nutrition */}
                    {recipe.nutrition && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Nutrition (per serving)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
                          <div>
                            <div className="font-semibold text-green-600">{Math.round(recipe.nutrition.protein || 0)}g</div>
                            <div className="text-gray-600">Protein</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-600">{Math.round(recipe.nutrition.carbs || 0)}g</div>
                            <div className="text-gray-600">Carbs</div>
                          </div>
                          <div>
                            <div className="font-semibold text-purple-600">{Math.round(recipe.nutrition.fat || 0)}g</div>
                            <div className="text-gray-600">Fat</div>
                          </div>
                          <div>
                            <div className="font-semibold text-orange-600">{Math.round(recipe.nutrition.fiber || 0)}g</div>
                            <div className="text-gray-600">Fiber</div>
                          </div>
                          <div>
                            <div className="font-semibold text-red-600">{Math.round(recipe.nutrition.sodium || 0)}mg</div>
                            <div className="text-gray-600">Sodium</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dietary Tags */}
                    {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Dietary Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {recipe.dietary_tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ingredients */}
                    <div>
                      <h4 className="font-semibold mb-2">Ingredients</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                        {recipe.ingredients?.map((ingredient: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Instructions */}
                    <div>
                      <h4 className="font-semibold mb-2">Instructions</h4>
                      <ol className="space-y-2">
                        {recipe.instructions?.map((instruction: string, idx: number) => (
                          <li key={idx} className="flex gap-3 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-semibold text-green-700">
                              {idx + 1}
                            </span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Health Benefits */}
                    {recipe.health_benefits && recipe.health_benefits.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-green-800">Health Benefits</h4>
                        <ul className="space-y-1">
                          {recipe.health_benefits.map((benefit: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                              <Heart className="w-3 h-3 mt-1 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && recommendations.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready for AI Magic</h3>
            <p className="text-gray-600 mb-6">
              Choose an option above to get personalized healthy recipe recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}