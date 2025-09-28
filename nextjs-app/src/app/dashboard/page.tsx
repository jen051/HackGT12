"use client";

import React, { useState, useEffect } from "react";
import { Recipe, UserHealthProfile, User } from "@/entities/all";
import { ChefHat, Heart, Sparkles, Target, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";

import StatsCard from "../components/dashboard/statscard";
import RecentRecipes from "../components/dashboard/recentrecipes";
import HealthInsights from "../components/dashboard/healthinsights";

export default function Dashboard() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [healthProfile, setHealthProfile] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/"; // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setUserEmail(user.email);

      const userRecipes = await Recipe.filter({ created_by: user.email });
      setRecipes(userRecipes);

      const profiles = await UserHealthProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        setHealthProfile(profiles[0]);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const totalRecipes = recipes.length;
  const totalCalories = recipes.reduce(
    (sum: number, recipe: any) => sum + (recipe.nutrition?.calories || 0),
    0
  );
  const avgCalories = totalRecipes > 0 ? Math.round(totalCalories / totalRecipes) : 0;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-green-600">NutriCare</h1>
            <p className="text-sm text-gray-500">Healthy Recipe Builder</p>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-2">
            <Link
              href="/profile-setup?step=2"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 text-gray-700"
            >
              <Heart className="w-4 h-4 text-green-600" />
              Health Profile
            </Link>
            <Link
              href="/recipes-saved"// change this to saved recipe link
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 text-gray-700"
            >
              <ChefHat className="w-4 h-4 text-green-600" />
              My Saved Recipes
            </Link>
            <Link
              href="/recipebuilder"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 text-gray-700"
            >
              <Sparkles className="w-4 h-4 text-green-600" />
              Recipe Builder
            </Link>
            <Link
              href="/grocery-list"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 text-gray-700"
            >
              <ShoppingCart className="w-4 h-4 text-green-600" />
              Generate Grocery List
            </Link>
          </nav>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-medium text-green-700">
              {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{userEmail || "User"}</p>
              {/* <p className="text-xs text-gray-500">Manage your nutrition</p> */}
              <button
                onClick={handleLogout}
                className="mt-2 text-sm text-red-500 hover:text-red-700 w-full text-left"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome to NutriCare
          </h1>
          <p className="text-gray-600 text-lg">
            Your personalized nutrition and recipe management hub
          </p>
        </div>

        {/* Stats */}
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

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentRecipes recipes={recipes} />
          </div>
          <div>
            <HealthInsights />
          </div>
        </div>
      </main>
    </div>
  );
}


