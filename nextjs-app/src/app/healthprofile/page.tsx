"use client";

import React, { useState, useEffect } from "react";
import { UserHealthProfile, HealthCondition, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Plus, X, Save, User as UserIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const COMMON_CONDITIONS = [
  "Diabetes Type 2",
  "High Blood Pressure",
  "High Cholesterol", 
  "Heart Disease",
  "Obesity",
  "Celiac Disease",
  "Lactose Intolerance",
  "Food Allergies"
];

const DIETARY_PREFERENCES = [
  "Vegetarian",
  "Vegan", 
  "Keto",
  "Low Carb",
  "Mediterranean",
  "DASH",
  "Gluten Free",
  "Dairy Free"
];

const COMMON_ALLERGIES = [
  "Nuts",
  "Peanuts",
  "Shellfish",
  "Fish",
  "Eggs",
  "Dairy",
  "Soy",
  "Wheat/Gluten"
];

export default function HealthProfile() {
  const [profile, setProfile] = useState<any>({
    health_conditions: [],
    allergies: [],
    dietary_preferences: [],
    daily_calorie_goal: 2000,
    daily_sodium_limit: 2300,
    daily_sugar_limit: 50,
    age: "",
    weight: "",
    height: "",
    activity_level: "moderately_active"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<any>(null);
  const [existingProfileId, setExistingProfileId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const profiles = await UserHealthProfile.filter({ created_by: User.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setExistingProfileId(profiles[0].id || null);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setIsLoading(false);
  };

  const addToArray = (key: string, value: string) => {
    if (value && !profile[key].includes(value)) {
      setProfile((prev: any) => ({
        ...prev,
        [key]: [...prev[key], value]
      }));
    }
  };

  const removeFromArray = (key: string, value: string) => {
    setProfile((prev: any) => ({
      ...prev,
      [key]: prev[key].filter((item: string) => item !== value)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (existingProfileId) {
        await UserHealthProfile.update(existingProfileId, profile);
      } else {
        const newProfile = await UserHealthProfile.create(profile);
        setExistingProfileId(newProfile.id || null);
      }
      setMessage({ type: "success", text: "Health profile saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Error saving profile. Please try again." });
    }
    setIsSaving(false);
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-green-600" />
            Health Profile
          </h1>
          <p className="text-gray-600">
            Tell us about your health conditions and preferences to get personalized recipe recommendations
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
          {/* Basic Information */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, age: e.target.value }))}
                    placeholder="Enter your age"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, weight: e.target.value }))}
                    placeholder="Weight"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (inches)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, height: e.target.value }))}
                    placeholder="Height"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="activity">Activity Level</Label>
                <Select
                  value={profile.activity_level}
                  onValueChange={(value) => setProfile((prev: any) => ({ ...prev, activity_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                    <SelectItem value="lightly_active">Lightly Active (light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (hard exercise 6-7 days/week)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Health Conditions */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Health Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.health_conditions.map((condition: string) => (
                  <Badge key={condition} variant="secondary" className="gap-1">
                    {condition}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeFromArray('health_conditions', condition)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {COMMON_CONDITIONS.filter(c => !profile.health_conditions.includes(c)).map((condition) => (
                  <Button
                    key={condition}
                    variant="outline"
                    size="sm"
                    onClick={() => addToArray('health_conditions', condition)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {condition}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                ⚠️ Food Allergies & Intolerances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map((allergy: string) => (
                  <Badge key={allergy} variant="destructive" className="gap-1">
                    {allergy}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeFromArray('allergies', allergy)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGIES.filter(a => !profile.allergies.includes(a)).map((allergy) => (
                  <Button
                    key={allergy}
                    variant="outline"
                    size="sm"
                    onClick={() => addToArray('allergies', allergy)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {allergy}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dietary Preferences */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                🥗 Dietary Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.dietary_preferences.map((preference: string) => (
                  <Badge key={preference} className="gap-1 bg-green-100 text-green-800">
                    {preference}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeFromArray('dietary_preferences', preference)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {DIETARY_PREFERENCES.filter(p => !profile.dietary_preferences.includes(p)).map((preference) => (
                  <Button
                    key={preference}
                    variant="outline"
                    size="sm"
                    onClick={() => addToArray('dietary_preferences', preference)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {preference}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Goals */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                🎯 Daily Nutrition Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Daily Calorie Goal</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={profile.daily_calorie_goal}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, daily_calorie_goal: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sodium">Max Sodium (mg)</Label>
                  <Input
                    id="sodium"
                    type="number"
                    value={profile.daily_sodium_limit}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, daily_sodium_limit: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sugar">Max Sugar (g)</Label>
                  <Input
                    id="sugar"
                    type="number"
                    value={profile.daily_sugar_limit}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, daily_sugar_limit: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Health Profile"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}