import { db } from "./config";
import { doc, setDoc, getDocs, deleteDoc, collection } from "firebase/firestore";

interface Recipe {
  id: string;
  name: string;
  description: string;
  cookTime: number;
  cuisine: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  isFavorite?: boolean; // Made optional
  rating: number;
  prepTime?: number; // Added prepTime as optional for recipe-detail compatibility
}

export async function saveRecipe(uid: string, recipe: Recipe) {
  if (!uid) {
    throw new Error("User UID is required to save a recipe.");
  }
  if (!recipe.id) {
    throw new Error("Recipe ID is required to save a recipe.");
  }

  const recipeDocRef = doc(db, "users", uid, "savedRecipes", recipe.id);

  // Ensure array fields are always arrays, even if empty or undefined in the input
  const recipeToSave = {
    ...recipe,
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    tags: recipe.tags || [],
  };

  await setDoc(recipeDocRef, recipeToSave);
  console.log("Recipe saved successfully!");
}

export async function getSavedRecipes(uid: string): Promise<Recipe[]> {
  if (!uid) {
    throw new Error("User UID is required to get saved recipes.");
  }

  const savedRecipesCollectionRef = collection(db, "users", uid, "savedRecipes");
  const querySnapshot = await getDocs(savedRecipesCollectionRef);
  const recipes: Recipe[] = [];
  querySnapshot.forEach((doc) => {
    if (doc.id !== "initial") { // Filter out the initial placeholder document
      recipes.push(doc.data() as Recipe);
    }
  });
  return recipes;
}

export async function removeSavedRecipe(uid: string, recipeId: string) {
  if (!uid) {
    throw new Error("User UID is required to remove a recipe.");
  }
  if (!recipeId) {
    throw new Error("Recipe ID is required to remove a recipe.");
  }

  const recipeDocRef = doc(db, "users", uid, "savedRecipes", recipeId);
  await deleteDoc(recipeDocRef);
  console.log("Recipe removed successfully!");
}
