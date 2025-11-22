// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// إعدادات مشروعك في Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBYuHWfYIfbzaZrVIlUtRmUMbeI3it3i7g",
  authDomain: "english-learning-game-989e9.firebaseapp.com",
  projectId: "english-learning-game-989e9",
  storageBucket: "english-learning-game-989e9.firebasestorage.app",
  messagingSenderId: "404587848000",
  appId: "1:404587848000:web:61cf3f8b8b9eb5bc551aa5"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تصدير الخدمات لاستخدامها في باقي التطبيق
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;