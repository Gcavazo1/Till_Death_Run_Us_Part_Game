import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Ensure your .env file (and Vercel environment variables) are set up with these keys
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4FSFJTC4FT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Optional: Add a check for missing environment variables during development
if (import.meta.env.DEV) {
  for (const [key, value] of Object.entries(firebaseConfig)) {
    if (value === undefined) {
      // Construct the expected environment variable name for the warning
      let expectedVarName = `VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
      // Special case for apiKey as it doesn't follow the pattern directly in the original regex replace
      if (key === 'apiKey') {
        expectedVarName = 'VITE_FIREBASE_API_KEY';
      }
      console.warn(`Firebase config: Missing environment variable ${expectedVarName}. Please ensure all VITE_FIREBASE_... variables are set in your .env file.`);
    }
  }
} 