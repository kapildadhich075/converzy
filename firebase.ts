import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "converzy.firebaseapp.com",
  projectId: "converzy",
  storageBucket: "converzy.appspot.com",
  messagingSenderId: "146301956866",
  appId: "1:146301956866:web:161036a1c6bb9dd896881b",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
