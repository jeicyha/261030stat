import { getApp, getApps, initializeApp } from "firebase/app";

/** Firebase 앱을 한 번만 만들어 로그인·Firestore가 함께 씁니다. */
export function getFirebaseApp() {
  if (getApps().length) return getApp();
  return initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  });
}
