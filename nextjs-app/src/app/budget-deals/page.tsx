"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  MapPin, 
  Clock, 
  Star, 
  ShoppingCart, 
  TrendingDown, 
  Calendar,
  Filter,
  Search
} from "lucide-react";
import Link from "next/link";

interface Deal {
  id: string;
  store: string;
  item: string;
  category: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  discountType: 'percentage' | 'dollar';
  validUntil: string;
  location: string;
  rating: number;
  distance: number;
  image?: string;
  description: string;
  isExpiring: boolean;
}

export default function BudgetDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('discount');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Mock deals data
  const mockDeals: Deal[] = [
    {
      id: "1",
      store: "Walmart",
      item: "Chicken Breast",
      category: "Protein",
      originalPrice: 8.99,
      salePrice: 5.99,
      discount: 33,
      discountType: 'percentage',
      validUntil: "2024-01-15",
      location: "123 Main St, Atlanta, GA",
      rating: 4.2,
      distance: 2.3,
      description: "Fresh, never frozen chicken breast. Great for meal prep!",
      isExpiring: false
    },
    {
      id: "2",
      store: "Kroger",
      item: "Organic Spinach",
      category: "Vegetables",
      originalPrice: 3.99,
      salePrice: 2.49,
      discount: 38,
      discountType: 'percentage',
      validUntil: "2024-01-12",
      location: "456 Oak Ave, Atlanta, GA",
      rating: 4.0,
      distance: 1.8,
      description: "Fresh organic spinach, perfect for salads and smoothies.",
      isExpiring: true
    },
    {
      id: "3",
      store: "Publix",
      item: "Greek Yogurt (32oz)",
      category: "Dairy",
      originalPrice: 6.99,
      salePrice: 4.99,
      discount: 29,
      discountType: 'percentage',
      validUntil: "2024-01-18",
      location: "789 Pine St, Atlanta, GA",
      rating: 4.5,
      distance: 3.1,
      description: "High-protein Greek yogurt, great for breakfast and snacks.",
      isExpiring: false
    },
    {
      id: "4",
      store: "Target",
      item: "Quinoa (2lb bag)",
      category: "Grains",
      originalPrice: 8.99,
      salePrice: 6.99,
      discount: 22,
      discountType: 'percentage',
      validUntil: "2024-01-20",
      location: "321 Elm St, Atlanta, GA",
      rating: 4.3,
      distance: 4.2,
      description: "Organic quinoa, perfect for healthy grain bowls.",
      isExpiring: false
    },
    {
      id: "5",
      store: "Whole Foods",
      item: "Salmon Fillet",
      category: "Protein",
      originalPrice: 15.99,
      salePrice: 11.99,
      discount: 25,
      discountType: 'percentage',
      validUntil: "2024-01-14",
      location: "654 Maple Dr, Atlanta, GA",
      rating: 4.7,
      distance: 5.5,
      description: "Fresh Atlantic salmon, sustainably sourced.",
      isExpiring: true
    },
    {
      id: "6",
      store: "Aldi",
      item: "Bananas (per lb)",
      category: "Fruits",
      originalPrice: 0.89,
      salePrice: 0.49,
      discount: 45,
      discountType: 'percentage',
      validUntil: "2024-01-16",
      location: "987 Cedar Ln, Atlanta, GA",
      rating: 4.1,
      distance: 2.7,
      description: "Fresh bananas, perfect for smoothies and snacks.",
      isExpiring: false
    },
    {
      id: "7",
      store: "Costco",
      item: "Olive Oil (2L)",
      category: "Pantry",
      originalPrice: 24.99,
      salePrice: 18.99,
      discount: 24,
      discountType: 'percentage',
      validUntil: "2024-01-25",
      location: "147 Birch St, Atlanta, GA",
      rating: 4.4,
      distance: 6.8,
      description: "Extra virgin olive oil, great for cooking and dressings.",
      isExpiring: false
    },
    {
      id: "8",
      store: "Trader Joe's",
      item: "Frozen Berries Mix",
      category: "Fruits",
      originalPrice: 4.99,
      salePrice: 3.49,
      discount: 30,
      discountType: 'percentage',
      validUntil: "2024-01-13",
      location: "258 Spruce Ave, Atlanta, GA",
      rating: 4.6,
      distance: 3.9,
      description: "Mixed frozen berries, perfect for smoothies and baking.",
      isExpiring: true
    }
  ];

  const categories = ['all', 'Protein', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Pantry'];
  const stores = ['all', 'Walmart', 'Kroger', 'Publix', 'Target', 'Whole Foods', 'Aldi', 'Costco', 'Trader Joe\'s'];

  useEffect(() => {
    setDeals(mockDeals);
    setFilteredDeals(mockDeals);
  }, []);

  useEffect(() => {
    let filtered = deals;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(deal => deal.category === selectedCategory);
    }

    // Filter by store
    if (selectedStore !== 'all') {
      filtered = filtered.filter(deal => deal.store === selectedStore);
    }

    // Sort
    switch (sortBy) {
      case 'discount':
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      case 'price':
        filtered.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case 'distance':
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    setFilteredDeals(filtered);
  }, [deals, selectedCategory, selectedStore, sortBy]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDiscountColor = (discount: number) => {
    if (discount >= 40) return 'bg-red-100 text-red-800';
    if (discount >= 25) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getExpiringColor = (isExpiring: boolean) => {
    return isExpiring ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Deals & Store Offers</h1>
          <p className="text-gray-600">Find the best deals on healthy ingredients near you</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-green-600" />
              Filter & Sort Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Store</label>
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stores" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store} value={store}>
                        {store === 'all' ? 'All Stores' : store}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Highest Discount</SelectItem>
                    <SelectItem value="price">Lowest Price</SelectItem>
                    <SelectItem value="distance">Nearest Store</SelectItem>
                    <SelectItem value="rating">Highest Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedStore('all');
                    setSortBy('discount');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <Card key={deal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{deal.item}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {deal.store}
                    </CardDescription>
                  </div>
                  <Badge className={getExpiringColor(deal.isExpiring)}>
                    {deal.isExpiring ? 'Expiring Soon' : 'Valid'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Price Information */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        ${deal.salePrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 line-through">
                        ${deal.originalPrice.toFixed(2)}
                      </p>
                    </div>
                    <Badge className={getDiscountColor(deal.discount)}>
                      {deal.discount}% OFF
                    </Badge>
                  </div>

                  {/* Store Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{deal.rating}/5.0</span>
                      <span className="text-gray-500">•</span>
                      <span>{deal.distance} miles away</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Valid until {formatDate(deal.validUntil)}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600">{deal.description}</p>

                  {/* Location */}
                  <div className="text-xs text-gray-500">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {deal.location}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        // Add to grocery list
                        setMessage({ 
                          type: 'success', 
                          text: `${deal.item} added to your grocery list!` 
                        });
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to List
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        // Get directions
                        const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(deal.location)}`;
                        window.open(mapsUrl, '_blank');
                      }}
                    >
                      Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredDeals.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg">No deals found matching your criteria.</p>
              <Button 
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedStore('all');
                  setSortBy('discount');
                }}
                className="mt-4"
              >
                Show All Deals
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Message */}
        {message && (
          <Alert className={`mt-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Future Endeavor Notice */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Future Endeavor</h3>
              <p className="text-blue-800 mb-4">
                We're working on integrating with more stores and real-time deal APIs to bring you 
                the most up-to-date offers from all major grocery chains in your area.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Real-time API integration
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  More store partnerships
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Price comparison
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Deal alerts
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <Link href="/grocery-list">
            <Button variant="outline">
              ← Back to Grocery List
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button className="bg-green-600 hover:bg-green-700">
              Go to Dashboard →
            </Button>
          </Link>
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
