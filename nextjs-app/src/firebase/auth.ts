import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "./config";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";

// Helper function to save user UID to localStorage
function saveUserToLocalStorage(user: any) {
  try {
    const userData = {
      uid: user.uid
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('User UID saved to localStorage:', userData);
  } catch (error) {
    console.error('Error saving user UID to localStorage:', error);
  }
}

// Helper function to clear user data from localStorage
function clearUserFromLocalStorage() {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('profileData');
    console.log('User data cleared from localStorage');
  } catch (error) {
    console.error('Error clearing user from localStorage:', error);
  }
}

// Sign up new user
export async function signUp(email: string, password: string, name: string = "") {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  if (user) {
    // Create a new user document in Firestore
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      name: name,
      email: user.email,
    });

    // Create empty userProfile subcollection
    const userProfileCollectionRef = collection(userDocRef, "userProfile");
    // Add an empty document to the userProfile collection to create it
    await setDoc(doc(userProfileCollectionRef, "profileData"), {
      inventory: "",
      allergies: [],
      budget: 0,
      maxTime: 0,
      cuisine: [],
      dietaryRestrictions: [],
      nutritionalPref: [],
    });

    // Create empty groceryList subcollection
    const groceryListCollectionRef = collection(userDocRef, "groceryList");
    // Add an empty document to the groceryList collection to create it
    await setDoc(doc(groceryListCollectionRef, "listData"), {
      createdAt: serverTimestamp(),
      items: []
    }); // Can be empty or have initial fields

    // Save user data to localStorage
    saveUserToLocalStorage(user);
  }

  return user;
}

// Login existing user
export async function signIn(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Save user data to localStorage
  if (user) {
    saveUserToLocalStorage(user);
  }
  
  return user;
}

// Sign out user
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    clearUserFromLocalStorage();
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Get current user from localStorage
export function getCurrentUser() {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error getting current user from localStorage:', error);
    return null;
  }
}

// Check if user is signed in (based on localStorage)
export function isUserSignedIn() {
  const user = getCurrentUser();
  return user !== null && user.uid !== undefined;
}