// firebase_config.js
// Modular Web SDK (v11) imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
// Note: We're NOT using getStorage (you said Base64 method to avoid billing).

// Your Firebase config (keep as-is)
const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218",
  measurementId: "G-LX9P9LRLV8"
};

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Owner UID (آپ نے دیا): اسے یہاں export کریں تاکہ باقی فائلیں use کر سکیں
export const OWNER_UID = "RQkXyPpTbgW8J9oJH3vqBPhdv782";

// Exports
export { auth, db };
