"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingCart, DollarSign, Clock, CheckCircle, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/firebase/config";
import { saveGroceryList } from "@/firebase/profile"; // Assuming saveGroceryList is in profile.ts
import { onAuthStateChanged } from "firebase/auth";

interface GroceryItem {
  name: string;
  quantity: number;
  isSelected: boolean;
  category: string;
}

export default function GroceryListPage() {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [budget, setBudget] = useState(75); // Mock budget from profile
  const [userId, setUserId] = useState<string | null>(null);

  // Mock grocery items based on profile preferences
  const mockGroceryItems: GroceryItem[] = [
    { name: "Chicken Breast", category: "Protein", quantity: 2, isSelected: true },
    { name: "Salmon Fillet", category: "Protein", quantity: 1, isSelected: true },
    { name: "Greek Yogurt", category: "Dairy", quantity: 1, isSelected: true },
    { name: "Eggs", category: "Protein", quantity: 1, isSelected: true },
    { name: "Spinach", category: "Vegetables", quantity: 1, isSelected: true },
    { name: "Broccoli", category: "Vegetables", quantity: 1, isSelected: true },
    { name: "Bell Peppers", category: "Vegetables", quantity: 3, isSelected: false },
    { name: "Sweet Potatoes", category: "Vegetables", quantity: 3, isSelected: true },
    { name: "Brown Rice", category: "Grains", quantity: 1, isSelected: true },
    { name: "Quinoa", category: "Grains", quantity: 1, isSelected: false },
    { name: "Whole Wheat Bread", category: "Grains", quantity: 1, isSelected: true },
    { name: "Bananas", category: "Fruits", quantity: 1, isSelected: true },
    { name: "Apples", category: "Fruits", quantity: 3, isSelected: true },
    { name: "Berries", category: "Fruits", quantity: 1, isSelected: false },
    { name: "Olive Oil", category: "Pantry", quantity: 1, isSelected: true },
    { name: "Garlic", category: "Pantry", quantity: 1, isSelected: true },
    { name: "Onions", category: "Pantry", quantity: 3, isSelected: true },
  ];

  useEffect(() => {
    // Load mock data
    setGroceryItems(mockGroceryItems);

    // Load user profile data from API
    const loadUserProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.uid || user.user?.uid;
        
        if (userId) {
          const response = await fetch(`/api/user?uid=${userId}`);
          
          if (response.ok) {
            const userData = await response.json();
            
            // Update budget from user profile
            if (userData.profile?.budget) {
              setBudget(userData.profile.budget);
            }

            // Update pantry items from user profile
            if (userData.profile?.inventory) {
              const inventoryItems = userData.profile.inventory.split(',').map((item: string) => item.trim()).filter((item: string) => item);
              setPantryItems(inventoryItems);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to localStorage if API fails
        const storedProfile = localStorage.getItem("profileData");
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          if (parsed.ingredientsYouAlreadyHave) {
            setPantryItems(parsed.ingredientsYouAlreadyHave);
          }
          if (parsed.weeklyBudget) {
            setBudget(parseFloat(parsed.weeklyBudget) || 75);
          }
        }
      }
    };

    loadUserProfile();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.log("No user logged in for grocery list.");
        // Optionally redirect to login if no user is found
        window.location.href = '/account';
      }
    });

    // Load pantry items from profile (mocked with localStorage)
    const storedProfile = localStorage.getItem("profileData");
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      if (parsed.ingredientsYouAlreadyHave) {
        setPantryItems(parsed.ingredientsYouAlreadyHave);
      }
    }
    return () => unsubscribe();
  }, []);

  const handleGenerateList = async () => {
    setIsGenerating(true);
    setMessage(null);

    try {
      // Get user ID from localStorage or Firebase Auth
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('user', user);
      const userId = user.uid || user.user?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated. Please log in again.');
      }

      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: userId,
          user_query: 'Generate a recipe and a grocery list based on my profile preferences',
        })
      });

      console.log('response', response);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }
      // Fetch user profile data from API
      // const response = await fetch('http://localhost:4000/generate-list', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     user_id: userId,
      //     user_query: 'Generate a recipe and a grocery list based on my profile preferences',
      //   })
      // });

      console.log('response', response);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('User profile not found. Please complete your profile setup.');
        } else {
          throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }
      }

      const userData = await response.json();
      
      // Update budget from user profile
      if (userData.profile?.budget) {
        setBudget(userData.profile.budget);
      }

      // Update pantry items from user profile
      if (userData.profile?.inventory) {
        const inventoryItems = userData.profile.inventory.split(',').map((item: string) => item.trim()).filter((item: string) => item);
        setPantryItems(inventoryItems);
      }

      setMessage({
        type: "success",
        text: "Grocery list generated successfully based on your profile! You can now customize it before proceeding to recipes.",
      });
    } catch (error) {
      console.error('Error generating grocery list:', error);
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Failed to generate grocery list. Please try again." 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleItemSelection = (itemName: string) => {
    setGroceryItems((prev) =>
      prev.map((item) =>
        item.name === itemName ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const updateQuantity = (itemName: string, change: number) => {
    setGroceryItems((prev) =>
      prev.map((item) =>
        item.name === itemName
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const getTotalCost = () => {
    // This will now always be 0 as estimatedPrice is removed
    return 0;
  };

  const getSelectedItems = () => groceryItems.filter((item) => item.isSelected);

  const getItemsByCategory = () => {
    const selected = groceryItems.filter((item) => item.isSelected);
    const categories = [...new Set(selected.map((item) => item.category))];

    return categories.map((category) => ({
      category,
      items: selected.filter((item) => item.category === category),
    }));
  };

  const handleProceedToRecipes = async () => {
    const selectedItems = getSelectedItems().map(item => ({ name: item.name, quantity: item.quantity }));
    if (selectedItems.length === 0) {
      setMessage({ type: "error", text: "Please select at least one item before proceeding." });
      return;
    }

    if (!userId) {
      setMessage({ type: 'error', text: 'User not authenticated. Please log in again.' });
      return;
    }

    try {
      await saveGroceryList(userId, selectedItems);
      // Store selected items AND pantry items
      localStorage.setItem("selectedGroceryItems", JSON.stringify(selectedItems));
      localStorage.setItem("pantryItems", JSON.stringify(pantryItems));
      window.location.href = "/recipes-from-grocery";
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save grocery list. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grocery List Generator</h1>
          <p className="text-gray-600">Personalized grocery list based on your profile preferences</p>
        </div>

        {/* Pantry Items Section */}
        {pantryItems.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ingredients You Already Have</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {pantryItems.map((item, idx) => (
                  <Badge key={idx} className="bg-blue-100 text-blue-800">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Budget Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Budget Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">${budget}</p>
                <p className="text-sm text-gray-600">Weekly Budget</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">${getTotalCost().toFixed(2)}</p>
                <p className="text-sm text-gray-600">Estimated Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  ${(budget - getTotalCost()).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Remaining Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="text-center mb-6">
          <Button
            onClick={handleGenerateList}
            disabled={isGenerating}
            className="bg-green-600 hover:bg-green-700"
          >
            {isGenerating ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Generate New List
              </>
            )}
          </Button>
        </div>

        {/* Message */}
        {message && (
          <Alert
            className={`mb-6 ${
              message.type === "error"
                ? "border-red-200 bg-red-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <AlertDescription
              className={message.type === "error" ? "text-red-800" : "text-green-800"}
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Grocery Items by Category */}
        <div className="space-y-6">
          {getItemsByCategory().map(({ category, items }) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{category}</span>
                  <Badge variant="outline">{items.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.name}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        item.isSelected
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleItemSelection(item.name)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            item.isSelected
                              ? "border-green-600 bg-green-600"
                              : "border-gray-300"
                          }`}
                        >
                          {item.isSelected && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </button>

                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            Category: {item.category}
                          </p>
                        </div>

                        {/* {item.isEssential && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Essential
                          </Badge>
                        )} */}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.name, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.name, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* <div className="text-right">
                          <p className="font-medium">
                            ${(item.estimatedPrice * item.quantity).toFixed(2)}
                          </p>
                        </div> */}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <Link href="/profile-setup">
            <Button variant="outline">← Back to Profile Setup</Button>
          </Link>

          <Button
            onClick={handleProceedToRecipes}
            className="bg-green-600 hover:bg-green-700"
            disabled={getSelectedItems().length === 0}
          >
            Generate Recipes from Selected Items →
          </Button>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
