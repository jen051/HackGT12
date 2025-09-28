"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Heart, Globe, Utensils, X } from "lucide-react";
import Link from "next/link";
import { auth } from "@/firebase/config";
import { updateUserProfile } from "@/firebase/profile";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfileSetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    // Budget
    weeklyBudget: "",
    budgetRange: "",
    
    // Dietary Restrictions
    dietaryRestrictions: [] as string[],
    allergies: [] as string[],
    
    // Cuisine Preferences
    cuisinePreferences: [] as string[],
    
    // Nutrition Preferences
    nutritionGoals: [] as string[],
    mealFrequency: "",
    cookingSkill: ""
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Optionally redirect to login if no user is found
        console.log("No user logged in for profile setup.");
        window.location.href = '/account'; // Redirect to login
      }
    });
    return () => unsubscribe();
  }, []);

  const dietaryOptions = [
    "Vegetarian", "Vegan", "Pescatarian", "Gluten-Free", "Dairy-Free", 
    "Keto", "Paleo", "Low-Carb", "Mediterranean", "Halal", "Kosher"
  ];

  const allergyOptions = [
    "Nuts", "Peanuts", "Shellfish", "Fish", "Eggs", "Milk", "Soy", 
    "Wheat", "Sesame", "Sulfites"
  ];

  const cuisineOptions = [
    "Italian", "Mexican", "Asian", "Indian", "Mediterranean", "American",
    "French", "Thai", "Chinese", "Japanese", "Korean", "Middle Eastern",
    "Caribbean", "African", "Latin American"
  ];

  const nutritionGoals = [
    "Weight Loss", "Muscle Gain", "Heart Health", "Diabetes Management",
    "High Protein", "Low Sodium", "High Fiber", "Anti-Inflammatory",
    "Energy Boost", "Immune Support"
  ];

  const budgetRanges = [
    { value: "under-25", label: "Under $25/week" },
    { value: "25-50", label: "$25-50/week" },
    { value: "50-75", label: "$50-75/week" },
    { value: "75-100", label: "$75-100/week" },
    { value: "100-150", label: "$100-150/week" },
    { value: "over-150", label: "Over $150/week" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const removeFromArray = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      setMessage({ type: 'error', text: 'User not authenticated. Please log in again.' });
      return;
    }

    try {
      await updateUserProfile(userId, profileData);
      setMessage({ type: 'success', text: 'Profile saved successfully! Redirecting to grocery list generator...' });
      setTimeout(() => {
        window.location.href = '/grocery-list';
      }, 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save profile. Please try again.' });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Budget Preferences</h3>
              <p className="text-gray-600">Help us understand your weekly grocery budget</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="weeklyBudget">Weekly Budget (USD)</Label>
                <Input
                  id="weeklyBudget"
                  type="number"
                  value={profileData.weeklyBudget}
                  onChange={(e) => handleInputChange('weeklyBudget', e.target.value)}
                  placeholder="Enter your weekly budget"
                  min="0"
                />
              </div>

              <div>
                <Label>Budget Range</Label>
                <Select value={profileData.budgetRange} onValueChange={(value) => handleInputChange('budgetRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Dietary Restrictions & Allergies</h3>
              <p className="text-gray-600">Tell us about your dietary needs and restrictions</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Dietary Restrictions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dietaryOptions.map((option) => (
                    <Badge
                      key={option}
                      variant={profileData.dietaryRestrictions.includes(option) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-green-100"
                      onClick={() => handleArrayToggle('dietaryRestrictions', option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
                {profileData.dietaryRestrictions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Selected:</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.dietaryRestrictions.map((item) => (
                        <Badge key={item} className="bg-green-100 text-green-800">
                          {item}
                          <X 
                            className="w-3 h-3 ml-1 cursor-pointer" 
                            onClick={() => removeFromArray('dietaryRestrictions', item)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label>Allergies</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allergyOptions.map((option) => (
                    <Badge
                      key={option}
                      variant={profileData.allergies.includes(option) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => handleArrayToggle('allergies', option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
                {profileData.allergies.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Selected:</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.allergies.map((item) => (
                        <Badge key={item} className="bg-red-100 text-red-800">
                          {item}
                          <X 
                            className="w-3 h-3 ml-1 cursor-pointer" 
                            onClick={() => removeFromArray('allergies', item)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Cuisine Preferences</h3>
              <p className="text-gray-600">What types of cuisine do you enjoy?</p>
            </div>

            <div>
              <Label>Cuisine Preferences</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {cuisineOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={profileData.cuisinePreferences.includes(option) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-green-100"
                    onClick={() => handleArrayToggle('cuisinePreferences', option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
              {profileData.cuisinePreferences.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Selected:</p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.cuisinePreferences.map((item) => (
                      <Badge key={item} className="bg-green-100 text-green-800">
                        {item}
                        <X 
                          className="w-3 h-3 ml-1 cursor-pointer" 
                          onClick={() => removeFromArray('cuisinePreferences', item)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Utensils className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nutrition & Cooking Preferences</h3>
              <p className="text-gray-600">Help us personalize your meal recommendations</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Nutrition Goals</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {nutritionGoals.map((option) => (
                    <Badge
                      key={option}
                      variant={profileData.nutritionGoals.includes(option) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-green-100"
                      onClick={() => handleArrayToggle('nutritionGoals', option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
                {profileData.nutritionGoals.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Selected:</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.nutritionGoals.map((item) => (
                        <Badge key={item} className="bg-green-100 text-green-800">
                          {item}
                          <X 
                            className="w-3 h-3 ml-1 cursor-pointer" 
                            onClick={() => removeFromArray('nutritionGoals', item)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label>Meal Frequency</Label>
                <Select value={profileData.mealFrequency} onValueChange={(value) => handleInputChange('mealFrequency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="How many meals do you cook per week?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3">1-3 meals per week</SelectItem>
                    <SelectItem value="4-7">4-7 meals per week</SelectItem>
                    <SelectItem value="8-14">8-14 meals per week</SelectItem>
                    <SelectItem value="15-21">15-21 meals per week</SelectItem>
                    <SelectItem value="all">All meals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cooking Skill Level</Label>
                <Select value={profileData.cookingSkill} onValueChange={(value) => handleInputChange('cookingSkill', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="What's your cooking experience?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner - Simple recipes</SelectItem>
                    <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                    <SelectItem value="advanced">Advanced - Comfortable with complex recipes</SelectItem>
                    <SelectItem value="expert">Expert - Love challenging recipes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Setup</h1>
          <p className="text-gray-600">Let's personalize your NutriCare experience</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} of 4</span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              Complete Setup
            </Button>
          )}
        </div>

        {/* Message */}
        {message && (
          <Alert className={`mt-4 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
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
