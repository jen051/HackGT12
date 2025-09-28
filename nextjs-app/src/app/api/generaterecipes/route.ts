/**
 * Recipe Generation API Route
 * 
 * This API generates 3 recipes based on user's grocery list and profile preferences
 * using OpenAI GPT-4.
 * 
 * POST /api/generaterecipes - Generate recipes from grocery list and user profile
 * 
 * Request body: { "userId": "user-id-here" }
 * 
 * Response: { "recipes": Recipe[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { getDocs, collection, doc, getDoc } from 'firebase/firestore';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Interface for user profile data
interface UserProfile {
  allergies: string[];
  cuisine: string[];
  dietaryRestrictions: string[];
  nutritionalPref: string[];
  budget: number;
  maxTime: number;
  inventory: string;
}

// Interface for grocery item
interface GroceryItem {
  item: string;
  quantity: number;
  category: string;
  isSelected?: boolean;
}

// Interface for recipe
interface Recipe {
  id: string;
  name: string;
  description: string;
  cookTime: number;
  cuisine: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  isFavorite: boolean;
  rating: number;
}

// Helper function to fetch grocery list from Firebase
async function getGroceryListFromFirebase(uid: string): Promise<GroceryItem[]> {
  try {
    const groceryListCollectionRef = collection(db, 'users', uid, 'groceryList');
    const querySnapshot = await getDocs(groceryListCollectionRef);
    
    const groceryItems: GroceryItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      groceryItems.push({
        item: data.item || data.name || '',
        quantity: data.quantity || 1,
        category: data.category || '',
        isSelected: data.isSelected !== false,
      });
    });
    
    return groceryItems;
  } catch (error) {
    console.error('Error fetching grocery list from Firebase:', error);
    return [];
  }
}

// Helper function to fetch user profile from Firebase
async function getUserProfileFromFirebase(uid: string): Promise<UserProfile | null> {
  try {
    const profileDocRef = doc(db, 'users', uid, 'userProfile', 'profileData');
    const profileDoc = await getDoc(profileDocRef);
    
    if (profileDoc.exists()) {
      return profileDoc.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile from Firebase:', error);
    return null;
  }
}

// Helper function to generate recipes using OpenAI
async function generateRecipesWithOpenAI(
  profileData: UserProfile, 
  groceryItems: GroceryItem[]
): Promise<Recipe[]> {
  try {
    // Extract ingredient names from grocery list
    const availableIngredients = groceryItems
      .filter(item => item.isSelected !== false)
      .map(item => item.item);

    const prompt = `
You are tasked with generating exactly 3 recipes based on the user's grocery list and preferences. 

STRICT REQUIREMENTS:
- Return ONLY a JSON object containing a "recipes" array with 3 recipe objects, nothing else.
- Each recipe object must include these fields exactly: id (string), name (string), description (string), cookTime (number), cuisine (string), ingredients (array of strings), instructions (array of strings), tags (array of strings), isFavorite (boolean), rating (number).
- Cuisine must align with the user's cuisine preferences: ${profileData.cuisine?.join(', ') || 'Any cuisine'}.
- Ingredients must be chosen ONLY from the user's available grocery list: ${availableIngredients.join(', ')}.
- Tags should reflect the recipe (e.g., "Healthy", "Quick", "High-Protein", "Vegetarian", "Gluten-Free").
- isFavorite must ALWAYS be false initially.
- rating should be a decimal number between 3.5 and 5.0.
- cookTime must NOT exceed ${profileData.maxTime || 60} minutes.
- Do not include any explanations, comments, or text outside the JSON object.

STRICT CONSTRAINTS (sourced directly from the user's database preferences):
1. DIETARY RESTRICTIONS: The entire plan must be strictly no "${profileData.dietaryRestrictions?.join(', ') || 'None'}". If no dietary restrictions, consider all options.
2. ALLERGIES: Absolutely avoid any ingredients that may contain or be cross-contaminated with: ${profileData.allergies?.join(', ') || 'None'}.
3. NUTRITION: Prioritize these nutritional preferences: ${profileData.nutritionalPref?.join(', ') || 'None'}.
4. MAX COOKING TIME: Recipes should take no longer than ${profileData.maxTime || 60} minutes to prepare.
5. INVENTORY: Use these existing ingredients from the user's inventory where possible: ${profileData.inventory || 'None'}.

Example JSON format (for structure only, do not repeat these recipes):
{
  "recipes": [
    {
      "id": "1",
      "name": "Mediterranean Chicken Bowl",
      "description": "A healthy and flavorful bowl with grilled chicken, quinoa, and fresh vegetables",
      "cookTime": 40,
      "cuisine": "Mediterranean",
      "ingredients": ["Chicken", "Quinoa", "Spinach", "Broccoli", "Sweet Potatoes"],
      "instructions": ["Cook chicken", "Prepare quinoa", "Mix vegetables", "Serve hot"],
      "tags": ["Healthy", "Gluten-Free"],
      "isFavorite": false,
      "rating": 4.5
    },
    {
      "id": "2", 
      "name": "Greek Yogurt Parfait",
      "description": "A refreshing and protein-rich breakfast or snack",
      "cookTime": 10,
      "cuisine": "American",
      "ingredients": ["Greek Yogurt", "Bananas", "Apples", "Berries"],
      "instructions": ["Layer yogurt", "Add fruit", "Drizzle honey"],
      "tags": ["Breakfast", "Quick"],
      "isFavorite": false,
      "rating": 4.2
    },
    {
      "id": "3",
      "name": "Sweet Potato Stir-Fry", 
      "description": "A quick stir-fry with sweet potatoes, bell peppers, and garlic",
      "cookTime": 25,
      "cuisine": "Asian",
      "ingredients": ["Sweet Potatoes", "Bell Peppers", "Garlic", "Onions"],
      "instructions": ["Chop vegetables", "Stir-fry with oil and garlic", "Serve warm"],
      "tags": ["Vegetarian", "Quick"],
      "isFavorite": false,
      "rating": 4.0
    }
  ]
}

Now generate 3 recipes using the user's grocery list and profile constraints in the exact JSON format above.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const parsedResponse = JSON.parse(responseText);
    
    // Extract recipes from the response
    let recipes: Recipe[] = [];
    
    // Check if the response has a recipes property (expected format)
    if (parsedResponse.recipes && Array.isArray(parsedResponse.recipes)) {
      recipes = parsedResponse.recipes;
    }
    // Check if the response is directly an array (fallback)
    else if (Array.isArray(parsedResponse)) {
      recipes = parsedResponse;
    }
    // If neither, try to find any array in the response
    else {
      const possibleArrays = Object.values(parsedResponse).filter(Array.isArray);
      if (possibleArrays.length > 0) {
        recipes = possibleArrays[0] as Recipe[];
      }
    }

    // Validate and format recipes
    const formattedRecipes = recipes.slice(0, 3).map((recipe: any, index: number) => ({
      id: recipe.id || (index + 1).toString(),
      name: recipe.name || `Recipe ${index + 1}`,
      description: recipe.description || '',
      cookTime: Number(recipe.cookTime || 30),
      cuisine: recipe.cuisine || 'International',
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
      tags: Array.isArray(recipe.tags) ? recipe.tags : [],
      isFavorite: false,
      rating: Number(recipe.rating || 4.0),
    }));

    return formattedRecipes;

  } catch (error) {
    console.error('Error generating recipes with OpenAI:', error);
    throw error;
  }
}

// POST /api/generaterecipes - Generate recipes from grocery list and user profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch grocery list from Firebase
    console.log('Fetching grocery list for user:', userId);
    const groceryItems = await getGroceryListFromFirebase(userId);
    console.log('Raw grocery items from Firebase:', groceryItems);
    
    if (groceryItems.length === 0) {
      return NextResponse.json(
        { error: 'No grocery list found. Please generate a grocery list first.' },
        { status: 404 }
      );
    }

    // Fetch user profile from Firebase
    const profileData = await getUserProfileFromFirebase(userId);
    
    if (!profileData) {
      return NextResponse.json(
        { error: 'User profile not found. Please complete your profile setup.' },
        { status: 404 }
      );
    }

    // Generate recipes using OpenAI
    console.log('Generating recipes with OpenAI...');
    console.log('Profile data:', profileData);
    console.log('Grocery items:', groceryItems);
    
    const recipes = await generateRecipesWithOpenAI(profileData, groceryItems);
    
    console.log('OpenAI recipes generated:', recipes);

    return NextResponse.json({ recipes });

  } catch (error) {
    console.error('Error generating recipes:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipes. Please try again.' },
      { status: 500 }
    );
  }
}

