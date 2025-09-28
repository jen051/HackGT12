import { doc, updateDoc } from "firebase/firestore";
import { db } from "./config";

export async function updateUserProfile(uid: string, profileData: any) {
  if (!uid) {
    console.error("User UID is required to update profile.");
    throw new Error("User not authenticated.");
  }

  const userProfileDocRef = doc(db, "users", uid, "userProfile", "profileData");

  const updatePayload: any = {
    allergies: profileData.allergies || [],
    cuisine: profileData.cuisinePreferences || [],
    dietaryRestrictions: profileData.dietaryRestrictions || [],
    nutritionalPref: profileData.nutritionGoals || [],
  };

  // Convert budget to number if it exists and is a valid number
  if (profileData.weeklyBudget) {
    const budget = parseFloat(profileData.weeklyBudget);
    if (!isNaN(budget)) {
      updatePayload.budget = budget;
    }
  }

  // Convert maxTime to number if it exists and is a valid number
  if (profileData.maxTime) {
    const maxTime = parseInt(profileData.maxTime);
    if (!isNaN(maxTime)) {
      updatePayload.maxTime = maxTime;
    }
  }

  // Convert ingredientsYouAlreadyHave (inventory) to a comma-separated string
  if (profileData.ingredientsYouAlreadyHave && Array.isArray(profileData.ingredientsYouAlreadyHave)) {
    updatePayload.inventory = profileData.ingredientsYouAlreadyHave.join(", ");
  }

  try {
    await updateDoc(userProfileDocRef, updatePayload);
    console.log("User profile updated successfully!");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function saveGroceryList(uid: string, groceryItems: Array<{ name: string; quantity: number }>) {
  if (!uid) {
    console.error("User UID is required to save grocery list.");
    throw new Error("User not authenticated.");
  }

  const groceryListDocRef = doc(db, "users", uid, "groceryList", "listData");

  try {
    await updateDoc(groceryListDocRef, {
      items: groceryItems,
    });
    console.log("Grocery list updated successfully!");
  } catch (error) {
    console.error("Error updating grocery list:", error);
    throw error;
  }
}
