export interface RecipeData {
  id?: string;
  title: string;
  description?: string;
  servings: number;
  prep_time?: number;
  cook_time?: number;
  difficulty?: "easy" | "medium" | "hard";
  ingredients?: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  instructions?: string[];
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sodium?: number;
    sugar?: number;
  };
  health_benefits?: string[];
  suitable_conditions?: string[];
  dietary_tags?: string[];
  image_url?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export class Recipe {
  static async create(data: RecipeData): Promise<RecipeData> {
    // Mock implementation - in a real app, this would save to a database
    const recipe: RecipeData = {
      id: `recipe_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };
    
    // Store in localStorage for demo purposes
    const recipes = this.getAllRecipes();
    recipes.push(recipe);
    localStorage.setItem('recipes', JSON.stringify(recipes));
    
    return recipe;
  }

  static async update(id: string, data: Partial<RecipeData>): Promise<RecipeData> {
    const recipes = this.getAllRecipes();
    const index = recipes.findIndex(r => r.id === id);
    
    if (index === -1) {
      throw new Error('Recipe not found');
    }
    
    recipes[index] = {
      ...recipes[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    localStorage.setItem('recipes', JSON.stringify(recipes));
    return recipes[index];
  }

  static async delete(id: string): Promise<boolean> {
    const recipes = this.getAllRecipes();
    const filtered = recipes.filter(r => r.id !== id);
    localStorage.setItem('recipes', JSON.stringify(filtered));
    return true;
  }

  static async get(id: string): Promise<RecipeData | null> {
    const recipes = this.getAllRecipes();
    return recipes.find(r => r.id === id) || null;
  }

  static async filter(criteria: Partial<RecipeData>): Promise<RecipeData[]> {
    const recipes = this.getAllRecipes();
    return recipes.filter(recipe => {
      return Object.entries(criteria).every(([key, value]) => {
        if (Array.isArray(value)) {
          return value.every(v => recipe[key as keyof RecipeData]?.includes?.(v));
        }
        return recipe[key as keyof RecipeData] === value;
      });
    });
  }

  static async list(): Promise<RecipeData[]> {
    return this.getAllRecipes();
  }

  static async search(query: string): Promise<RecipeData[]> {
    const recipes = this.getAllRecipes();
    const lowercaseQuery = query.toLowerCase();
    
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(lowercaseQuery) ||
      recipe.description?.toLowerCase().includes(lowercaseQuery) ||
      recipe.ingredients?.some(ing => ing.name.toLowerCase().includes(lowercaseQuery)) ||
      recipe.dietary_tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  private static getAllRecipes(): RecipeData[] {
    try {
      const stored = localStorage.getItem('recipes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}
