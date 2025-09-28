import Link from "next/link";
import { Heart, ChefHat, Sparkles, BookOpen, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">NutriCare</h1>
                <p className="text-sm text-green-600 font-medium">Healthy Recipe Builder</p>
              </div>
            </div>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Build Healthy Recipes with{" "}
            <span className="text-green-600">AI-Powered</span> Nutrition
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create personalized, nutritious recipes tailored to your health goals, dietary preferences, and restrictions. 
            Get AI recommendations that fit your lifestyle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/airecommendations">
                <Sparkles className="w-5 h-5 mr-2" />
                Get AI Recommendations
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/recipebuilder">
                <ChefHat className="w-5 h-5 mr-2" />
                Build Recipe
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Get personalized recipe suggestions based on your health profile and preferences.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Recipe Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Create custom recipes with detailed nutrition information and health benefits.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Health Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Track your health conditions, allergies, and dietary preferences for better recommendations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">My Recipes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Save and organize your favorite healthy recipes in one place.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-green-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/dashboard" className="group">
              <Card className="border-0 shadow-sm hover:shadow-md transition-all group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Dashboard</h4>
                  <p className="text-gray-600 text-sm mb-4">View your health stats and insights</p>
                  <ArrowRight className="w-4 h-4 text-green-600 mx-auto" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/airecommendations" className="group">
              <Card className="border-0 shadow-sm hover:shadow-md transition-all group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">AI Recommendations</h4>
                  <p className="text-gray-600 text-sm mb-4">Get personalized recipe suggestions</p>
                  <ArrowRight className="w-4 h-4 text-blue-600 mx-auto" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/healthprofile" className="group">
              <Card className="border-0 shadow-sm hover:shadow-md transition-all group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Health Profile</h4>
                  <p className="text-gray-600 text-sm mb-4">Set up your health preferences</p>
                  <ArrowRight className="w-4 h-4 text-purple-600 mx-auto" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
