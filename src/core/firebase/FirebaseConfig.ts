import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCgWj3zYJNIxCsIUh0q5D9r-ayP6bt4uAE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "till-death-do-us-part-afdd2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "till-death-do-us-part-afdd2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "till-death-do-us-part-afdd2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "916194438518",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:916194438518:web:a34361cadf498558309e57",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4FSFJTC4FT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app); 