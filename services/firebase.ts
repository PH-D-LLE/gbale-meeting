// @ts-ignore
import { initializeApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZk_atIFuVqIfTqikqPUCxwjzP8RrHJHk",
  authDomain: "gbale-meeting.firebaseapp.com",
  databaseURL: "https://gbale-meeting-default-rtdb.asia-southeast1.firebasedatabase.app/", // User provided URL
  projectId: "gbale-meeting",
  storageBucket: "gbale-meeting.firebasestorage.app",
  messagingSenderId: "609688108032",
  appId: "1:609688108032:web:ec431feb0426119b57ace5"
};

// Explicitly type app as any to avoid strict mode build errors
// since we are using @ts-ignore on import
let app: any;
let db: Database | null = null;

try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    // Initialize Realtime Database instead of Firestore
    db = getDatabase(app);
    console.log("Firebase RTDB initialized successfully.");
} catch (error) {
    console.error("Firebase Initialization Error:", error);
    console.warn("Falling back to LocalStorage mode due to initialization failure.");
}

export { db };