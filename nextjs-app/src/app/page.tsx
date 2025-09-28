import Link from "next/link";
import { Heart, ChefHat, Sparkles, BookOpen, User, ArrowRight, ShoppingCart, DollarSign, UserPlus, Settings } from "lucide-react";
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
                <h1 className="text-2xl font-bold text-gray-900">PantryPal</h1>
                <p className="text-sm text-green-600 font-medium">Healthy Recipe Builder</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/account">Sign In</Link>
              </Button>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/account">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Nutrition for{" "}
            <span className="text-green-600">Budget-Conscious</span> Students
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create personalized grocery lists, find the best deals, and generate healthy recipes that fit your budget and dietary needs. 
            Perfect for students who want to eat well without breaking the bank.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/account">
                <UserPlus className="w-5 h-5 mr-2" />
                Create Account
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/grocery-list">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Start Grocery List
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Smart Grocery Lists</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Generate personalized grocery lists based on your budget, dietary restrictions, and preferences.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Budget Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Find the best deals and discounts from local stores to maximize your budget.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Recipe Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Get AI-generated recipes based on your selected ingredients and dietary needs.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Save Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Heart and save your favorite recipes for easy access and meal planning.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-green-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Get Started</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/account" className="group">
              <Card className="border-0 shadow-sm hover:shadow-md transition-all group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Create Account</h4>
                  <p className="text-gray-600 text-sm mb-4">Sign up to start your healthy journey</p>
                  <ArrowRight className="w-4 h-4 text-green-600 mx-auto" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/profile-setup" className="group">
              <Card className="border-0 shadow-sm hover:shadow-md transition-all group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Set Up Profile</h4>
                  <p className="text-gray-600 text-sm mb-4">Configure your budget and preferences</p>
                  <ArrowRight className="w-4 h-4 text-blue-600 mx-auto" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/grocery-list" className="group">
              <Card className="border-0 shadow-sm hover:shadow-md transition-all group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Grocery List</h4>
                  <p className="text-gray-600 text-sm mb-4">Generate your personalized shopping list</p>
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
