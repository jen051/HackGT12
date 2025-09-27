"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingCart, DollarSign, Clock, Users, CheckCircle, XCircle, Plus, Minus } from "lucide-react";
import Link from "next/link";

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  estimatedPrice: number;
  quantity: number;
  unit: string;
  isEssential: boolean;
  isSelected: boolean;
  store?: string;
  deal?: {
    originalPrice: number;
    discount: number;
    store: string;
  };
}

export default function GroceryListPage() {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [budget, setBudget] = useState(75); // Mock budget from profile

  // Mock grocery items based on profile preferences
  const mockGroceryItems: GroceryItem[] = [
    // Proteins
    { id: "1", name: "Chicken Breast", category: "Protein", estimatedPrice: 8.99, quantity: 2, unit: "lbs", isEssential: true, isSelected: true },
    { id: "2", name: "Salmon Fillet", category: "Protein", estimatedPrice: 12.99, quantity: 1, unit: "lb", isEssential: false, isSelected: true },
    { id: "3", name: "Greek Yogurt", category: "Dairy", estimatedPrice: 4.99, quantity: 1, unit: "container", isEssential: true, isSelected: true },
    { id: "4", name: "Eggs", category: "Protein", estimatedPrice: 3.99, quantity: 1, unit: "dozen", isEssential: true, isSelected: true },
    
    // Vegetables
    { id: "5", name: "Spinach", category: "Vegetables", estimatedPrice: 2.99, quantity: 1, unit: "bag", isEssential: true, isSelected: true },
    { id: "6", name: "Broccoli", category: "Vegetables", estimatedPrice: 2.49, quantity: 1, unit: "head", isEssential: true, isSelected: true },
    { id: "7", name: "Bell Peppers", category: "Vegetables", estimatedPrice: 3.99, quantity: 3, unit: "pieces", isEssential: false, isSelected: false },
    { id: "8", name: "Sweet Potatoes", category: "Vegetables", estimatedPrice: 2.99, quantity: 3, unit: "lbs", isEssential: true, isSelected: true },
    
    // Grains
    { id: "9", name: "Brown Rice", category: "Grains", estimatedPrice: 3.99, quantity: 1, unit: "bag", isEssential: true, isSelected: true },
    { id: "10", name: "Quinoa", category: "Grains", estimatedPrice: 6.99, quantity: 1, unit: "bag", isEssential: false, isSelected: false },
    { id: "11", name: "Whole Wheat Bread", category: "Grains", estimatedPrice: 2.99, quantity: 1, unit: "loaf", isEssential: true, isSelected: true },
    
    // Fruits
    { id: "12", name: "Bananas", category: "Fruits", estimatedPrice: 1.99, quantity: 1, unit: "bunch", isEssential: true, isSelected: true },
    { id: "13", name: "Apples", category: "Fruits", estimatedPrice: 3.99, quantity: 3, unit: "lbs", isEssential: true, isSelected: true },
    { id: "14", name: "Berries", category: "Fruits", estimatedPrice: 4.99, quantity: 1, unit: "container", isEssential: false, isSelected: false },
    
    // Pantry
    { id: "15", name: "Olive Oil", category: "Pantry", estimatedPrice: 7.99, quantity: 1, unit: "bottle", isEssential: true, isSelected: true },
    { id: "16", name: "Garlic", category: "Pantry", estimatedPrice: 1.99, quantity: 1, unit: "head", isEssential: true, isSelected: true },
    { id: "17", name: "Onions", category: "Pantry", estimatedPrice: 2.99, quantity: 3, unit: "lbs", isEssential: true, isSelected: true },
  ];

  useEffect(() => {
    // Load mock data
    setGroceryItems(mockGroceryItems);
  }, []);

  const handleGenerateList = async () => {
    setIsGenerating(true);
    setMessage(null);
    
    try {
      // Mock API call to generate grocery list based on profile
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage({ 
        type: 'success', 
        text: 'Grocery list generated successfully! You can now customize it before proceeding to recipes.' 
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate grocery list. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setGroceryItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, isSelected: !item.isSelected }
          : item
      )
    );
  };

  const updateQuantity = (itemId: string, change: number) => {
    setGroceryItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const getTotalCost = () => {
    return groceryItems
      .filter(item => item.isSelected)
      .reduce((total, item) => total + (item.estimatedPrice * item.quantity), 0);
  };

  const getSelectedItems = () => {
    return groceryItems.filter(item => item.isSelected);
  };

  const getItemsByCategory = () => {
    const selected = getSelectedItems();
    const categories = [...new Set(selected.map(item => item.category))];
    
    return categories.map(category => ({
      category,
      items: selected.filter(item => item.category === category)
    }));
  };

  const handleProceedToRecipes = () => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one item before proceeding.' });
      return;
    }
    
    // Store selected items in localStorage for recipe generation
    localStorage.setItem('selectedGroceryItems', JSON.stringify(selectedItems));
    window.location.href = '/recipes-from-grocery';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grocery List Generator</h1>
          <p className="text-gray-600">Personalized grocery list based on your profile preferences</p>
        </div>

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
                <p className="text-2xl font-bold text-purple-600">${(budget - getTotalCost()).toFixed(2)}</p>
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
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
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
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        item.isSelected 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleItemSelection(item.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            item.isSelected 
                              ? 'border-green-600 bg-green-600' 
                              : 'border-gray-300'
                          }`}
                        >
                          {item.isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                        </button>
                        
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            ${item.estimatedPrice.toFixed(2)} per {item.unit}
                          </p>
                        </div>
                        
                        {item.isEssential && (
                          <Badge className="bg-yellow-100 text-yellow-800">Essential</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">
                            ${(item.estimatedPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
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
            <Button variant="outline">
              ← Back to Profile Setup
            </Button>
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
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
