
"use client";

import React, { useState, useEffect } from "react";
import { Recipe, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Clock, Users, Heart, Plus, Filter } from "lucide-react";
import Link from "next/link";

export default function MyRecipes() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecipes();
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('favoriteRecipes');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  };

  const toggleFavorite = (recipeId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(recipeId)) {
      newFavorites.delete(recipeId);
    } else {
      newFavorites.add(recipeId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoriteRecipes', JSON.stringify([...newFavorites]));
  };

  useEffect(() => {
    const filterRecipes = () => {
      let filtered = recipes;

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter((recipe: any) =>
          recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.ingredients?.some((ing: any) =>
            ing.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }

      // Category filter
      if (selectedFilter !== "all") {
        filtered = filtered.filter((recipe: any) => {
          switch(selectedFilter) {
            case "favorites":
              return favorites.has(recipe.id);
            case "quick":
              return (recipe.prep_time || 0) + (recipe.cook_time || 0) <= 30;
            case "healthy":
              return recipe.nutrition?.calories && recipe.nutrition.calories < 400;
            case "easy":
              return recipe.difficulty === "easy";
            default:
              return true;
          }
        });
      }

      setFilteredRecipes(filtered);
    };

    filterRecipes();
  }, [recipes, searchTerm, selectedFilter, favorites]);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const userRecipes = await Recipe.filter({ created_by: User.email });
      setRecipes(userRecipes);
    } catch (error) {
      console.error("Error loading recipes:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-green-600" />
            My Recipes
          </h1>
          <p className="text-gray-600">
            Your collection of healthy, personalized recipes
          </p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-8 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search recipes, ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {["all", "favorites", "quick", "healthy", "easy"].map(filter => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? "default" : "outline"}
                    onClick={() => setSelectedFilter(filter)}
                    size="sm"
                    className={selectedFilter === filter ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {filter === "favorites" ? (
                      <Heart className="w-3 h-3 mr-1" />
                    ) : (
                      <Filter className="w-3 h-3 mr-1" />
                    )}
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid gap-6">
            {filteredRecipes.map((recipe: any) => (
              <Card key={recipe.id} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <div className="flex flex-col md:flex-row">
                  {/* Recipe Image Placeholder */}
                  <div className="w-full md:w-48 h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                    <Heart className="w-12 h-12 text-green-500" />
                  </div>

                  {/* Recipe Content */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{recipe.title}</h3>
                        <p className="text-gray-600 line-clamp-2">{recipe.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(recipe.id)}
                          className={`p-2 rounded-full transition-colors ${
                            favorites.has(recipe.id)
                              ? 'text-red-500 hover:text-red-600 bg-red-50'
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${favorites.has(recipe.id) ? 'fill-current' : ''}`} />
                        </button>
                        <Badge className="bg-green-100 text-green-800">
                          {recipe.difficulty || "Easy"}
                        </Badge>
                      </div>
                    </div>

                    {/* Recipe Stats */}
                    <div className="flex gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {recipe.servings} servings
                      </div>
                      {recipe.nutrition?.calories && (
                        <div className="font-semibold">
                          {Math.round(recipe.nutrition.calories)} cal
                        </div>
                      )}
                    </div>

                    {/* Nutrition Bar */}
                    {recipe.nutrition && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="grid grid-cols-4 gap-3 text-xs">
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
                        </div>
                      </div>
                    )}

                    {/* Dietary Tags */}
                    {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {recipe.dietary_tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {recipe.dietary_tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{recipe.dietary_tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
              {searchTerm || selectedFilter !== "all" ? (
                <Search className="w-8 h-8 text-green-500" />
              ) : (
                <Plus className="w-8 h-8 text-green-500" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || selectedFilter !== "all" ? "No recipes found" : "No recipes yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start building your healthy recipe collection"}
            </p>
            {!searchTerm && selectedFilter === "all" && (
              <Link href="/recipebuilder">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Recipe
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
