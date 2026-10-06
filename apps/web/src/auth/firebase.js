// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB4XaJsofb2LDyeqO9YMiyP8aqpw-muJ5Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "powerlift-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "powerlift-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "powerlift-ai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "726156893633",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:726156893633:web:0e826847c71785d365a340",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);