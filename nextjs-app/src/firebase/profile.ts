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

  // Add meal frequency and cooking skill if they exist
//   if (profileData.mealFrequency) {
//     updatePayload.mealFrequency = profileData.mealFrequency;
//   }

//   if (profileData.cookingSkill) {
//     updatePayload.cookingSkill = profileData.cookingSkill;
//   }

  try {
    await updateDoc(userProfileDocRef, updatePayload);
    console.log("User profile updated successfully!");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}
