// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByBUCnsUPu5f9N9mcPmwZb8fTxPP34jRU",
  authDomain: "health-quest-69684.firebaseapp.com",
  projectId: "health-quest-69684",
  storageBucket: "health-quest-69684.appspot.com",
  messagingSenderId: "224519172412",
  appId: "1:224519172412:web:3fb327009476d0e13a2e39",
  measurementId: "G-6J2GKXYCZ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;