import firebase from 'firebase/app';
import 'firebase/database';

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

let db: firebase.database.Database | null = null;

try {
    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    } else {
        firebase.app(); // if already initialized, use that one
    }
    
    // Initialize Realtime Database
    db = firebase.database();
    console.log("Firebase RTDB initialized successfully.");
} catch (error) {
    console.error("Firebase Initialization Error:", error);
    console.warn("Falling back to LocalStorage mode due to initialization failure.");
}

export { db };