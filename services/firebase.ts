import * as firebaseApp from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZk_atIFuVqIfTqikqPUCxwjzP8RrHJHk",
  authDomain: "gbale-meeting.firebaseapp.com",
  databaseURL: "https://gbale-meeting-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "gbale-meeting",
  storageBucket: "gbale-meeting.firebasestorage.app",
  messagingSenderId: "609688108032",
  appId: "1:609688108032:web:ec431feb0426119b57ace5"
};

let db: Database | null = null;

try {
    // Initialize Firebase (Modular SDK)
    // Use namespace import to avoid named export resolution issues
    const app = firebaseApp.initializeApp(firebaseConfig);
    // Initialize Realtime Database
    db = getDatabase(app);
    console.log("Firebase RTDB initialized successfully.");
} catch (error) {
    console.error("Firebase Initialization Error:", error);
    console.warn("Falling back to LocalStorage mode due to initialization failure.");
}

export { db };