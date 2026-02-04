// @ts-ignore
import { initializeApp } from 'firebase/app';
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
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully with project:", firebaseConfig.projectId);
} catch (error) {
    console.error("Firebase Initialization Error:", error);
    console.warn("Falling back to LocalStorage mode due to initialization failure.");
}

export { db };