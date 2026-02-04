import * as firebaseApp from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZk_atIFuVqIfTqikqPUCxwjzP8RrHJHk",
  authDomain: "gbale-meeting.firebaseapp.com",
  projectId: "gbale-meeting",
  storageBucket: "gbale-meeting.firebasestorage.app",
  messagingSenderId: "609688108032",
  appId: "1:609688108032:web:ec431feb0426119b57ace5"
};

let app;
let db: Firestore | null = null;

try {
    // Initialize Firebase
    // Use dynamic access to initializeApp to handle potential type definition mismatches
    const initializeApp = (firebaseApp as any).initializeApp || (firebaseApp as any).default?.initializeApp;
    
    if (initializeApp) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("Firebase initialized successfully with project:", firebaseConfig.projectId);
    } else {
        throw new Error("initializeApp method not found in firebase/app module");
    }
} catch (error) {
    console.error("Firebase Initialization Error:", error);
    console.warn("Falling back to LocalStorage mode due to initialization failure.");
}

export { db };