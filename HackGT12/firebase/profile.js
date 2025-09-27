import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./config";

// Create or update profile
export async function createUserProfile(uid, profileData) {
  await setDoc(doc(db, "users", uid), profileData, { merge: true });
}

// Get profile
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}
