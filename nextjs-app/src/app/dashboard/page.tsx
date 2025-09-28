"use client";

import React, { useState, useEffect } from "react";
import { Recipe, UserHealthProfile, User } from "@/entities/all";
import { ChefHat, Heart, Sparkles, Target, TrendingUp } from "lucide-react";

import StatsCard from "../components/dashboard/statscard";
import RecentRecipes from "../components/dashboard/recentrecipes";
import HealthInsights from "../components/dashboard/healthinsights";

export default function Dashboard() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [healthProfile, setHealthProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const userRecipes = await Recipe.filter({ created_by: User.email });
      setRecipes(userRecipes);
      
      // Try to get user's health profile
      const profiles = await UserHealthProfile.filter({ created_by: User.email });
      if (profiles.length > 0) {
        setHealthProfile(profiles[0]);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const totalRecipes = recipes.length;
  const totalCalories = recipes.reduce((sum: number, recipe: any) => sum + (recipe.nutrition?.calories || 0), 0);
  const avgCalories = totalRecipes > 0 ? Math.round(totalCalories / totalRecipes) : 0;

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome to NutriCare
          </h1>
          <p className="text-gray-600 text-lg">
            Your personalized nutrition and recipe management hub
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Recipes"
            value={totalRecipes}
            description="Healthy creations"
            icon={ChefHat}
          />
          <StatsCard
            title="Avg Calories"
            value={avgCalories}
            description="Per recipe serving"
            icon={Target}
          />
          <StatsCard
            title="Health Goals"
            value={healthProfile?.health_conditions?.length || 0}
            description="Conditions tracked"
            icon={Heart}
          />
          <StatsCard
            title="AI Ready"
            value="✓"
            description="Recommendations"
            icon={Sparkles}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Recipes */}
          <div className="lg:col-span-2">
            <RecentRecipes recipes={recipes} />
          </div>

          {/* Health Insights */}
          <div>
            <HealthInsights />
          </div>
        </div>
      </div>
    </div>
  );
}