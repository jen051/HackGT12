// Entity definitions for the application

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserHealthProfile {
  id: string;
  userId: string;
  dietaryRestrictions: string[];
  allergies: string[];
  healthConditions: string[];
  fitnessGoals: string[];
  ingredientsYouAlreadyHave: string[];
  weeklyBudget: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  nutritionInfo?: NutritionInfo;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  fiber: number; // in grams
  sugar: number; // in grams
  sodium: number; // in mg
}

export interface HealthCondition {
  id: string;
  name: string;
  description: string;
  dietaryRecommendations: string[];
  restrictions: string[];
}

// Export all entities
export * from './healthcondition';
