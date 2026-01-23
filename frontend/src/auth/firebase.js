// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4XaJsofb2LDyeqO9YMiyP8aqpw-muJ5Q",
  authDomain: "powerlift-ai.firebaseapp.com",
  projectId: "powerlift-ai",
  
  appId: "1:726156893633:web:0e826847c71785d365a340",
 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);