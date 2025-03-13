import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBpF0IwNSk6W_9N3n3Kq_Mmf0ufYw3KnB0",
  authDomain: "scan-app-5d29a.firebaseapp.com",
  projectId: "scan-app-5d29a",
  storageBucket: "scan-app-5d29a.firebasestorage.app",
  messagingSenderId: "577766990257",
  appId: "1:577766990257:web:ab001688b2a5fd3c52dd90",
  measurementId: "G-TEVD1EZ6VD",
};

// Initialize Firebase app only if no instance exists
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firestore and Auth instances
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
//firebase deploy --only hosting:scan-app-atharve