import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./config";

// Save favorite recipe
export async function saveFavoriteRecipe(uid, recipe) {
  await addDoc(collection(db, "users", uid, "favorites"), recipe);
}

// Fetch all favorite recipes
export async function getFavorites(uid) {
  const snap = await getDocs(collection(db, "users", uid, "favorites"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
