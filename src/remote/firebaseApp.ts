import { initializeApp } from "firebase/app";

const env = (name: string) => process.env[name] || "";

const firebaseConfig = {
  apiKey: env("REACT_APP_FIREBASE_API_KEY"),
  authDomain: env("REACT_APP_FIREBASE_AUTH_DOMAIN"),
  databaseURL: env("REACT_APP_FIREBASE_DATABASE_URL"),
  projectId: env("REACT_APP_FIREBASE_PROJECT_ID"),
  storageBucket: env("REACT_APP_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: env("REACT_APP_FIREBASE_MESSAGING_SENDER_ID"),
  appId: env("REACT_APP_FIREBASE_APP_ID"),
  measurementId: env("REACT_APP_FIREBASE_MEASUREMENT_ID"),
};

if (!firebaseConfig.apiKey && process.env.NODE_ENV !== "test") {
  console.warn(
    "Missing REACT_APP_FIREBASE_API_KEY. Firebase requests may fail until it is configured."
  );
}

export const app = initializeApp(firebaseConfig);
