// Firebase Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// ------------------------------
// 🔥 Your Firebase Configuration
// ------------------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ------------------------------
// 🔥 Initialize Firebase
// ------------------------------
const app = initializeApp(firebaseConfig);

// Auth, Database, Storage Export
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { auth, db, storage };
