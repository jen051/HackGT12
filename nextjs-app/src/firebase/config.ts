// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACtAbVX5BNK7S8h7Wz8N2GiIjWdFs59RI",
  authDomain: "pantrypal-c3f1b.firebaseapp.com",
  projectId: "pantrypal-c3f1b",
  storageBucket: "pantrypal-c3f1b.firebasestorage.app",
  messagingSenderId: "570852080937",
  appId: "1:570852080937:web:18670c37464c1ec6c74b38"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };