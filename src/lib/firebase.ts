
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Checks if the minimal required Firebase configuration is present and valid.
 * Strictly checks for placeholder strings like 'undefined' or 'null'.
 */
export function isFirebaseConfigured() {
  const isInvalid = (val: string | undefined) => 
    !val || val === 'undefined' || val === 'null' || val === '';
    
  return !isInvalid(firebaseConfig.apiKey) && 
         !isInvalid(firebaseConfig.projectId);
}

/**
 * Safely initializes Firebase services.
 * Returns null for services if configuration is missing to prevent runtime crashes.
 */
export function initializeFirebase() {
  if (!isFirebaseConfigured()) {
    return { app: null, firestore: null, auth: null, isMock: true };
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    return { app, firestore, auth, isMock: false };
  } catch (error) {
    console.warn("[FIREBASE] Initialization failed. Falling back to mock mode.", error);
    return { app: null, firestore: null, auth: null, isMock: true };
  }
}
