
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBTcdwhmAVfDg3pwnxQZWGEq_Um7R4d5c",
  authDomain: "lucky-ai-assistant.firebaseapp.com",
  projectId: "lucky-ai-assistant",
  storageBucket: "lucky-ai-assistant.appspot.com",
  messagingSenderId: "881172786466",
  appId: "1:881172786466:web:0126fb496b307b630dc97b",
  measurementId: "G-4EB0SR37LX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
