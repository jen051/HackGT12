import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./config";
import { doc, setDoc, collection } from "firebase/firestore";

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
    await setDoc(doc(groceryListCollectionRef, "listData"), {}); // Can be empty or have initial fields
  }

  return user;
}

// Login existing user
export async function signIn(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}