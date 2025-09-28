import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createPageUrl(pageName: string): string {
  const routeMap: Record<string, string> = {
    Dashboard: "/",
    Account: "/account",
    ProfileSetup: "/profile-setup",
    GroceryList: "/grocery-list",
    BudgetDeals: "/budget-deals",
    RecipesFromGrocery: "/recipes-from-grocery",
    RecipeBuilder: "/recipe-builder",
    AIRecommendations: "/airecommendations",
    MyRecipes: "/myrecipes",
    HealthProfile: "/health-profile",
    RecipeDetail: "/recipe-detail"
  };

  return routeMap[pageName] || "/";
}