// ----------------------------
// Firebase Config (Base64 Version)
// ----------------------------

// Import Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

// Import Firebase Auth
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Import Firebase Realtime Database
import { 
    getDatabase, 
    ref, 
    set, 
    update, 
    get, 
    onValue 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// -----------------------------------
// ⚠️ Put your actual Firebase config
// -----------------------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth & Database
export const auth = getAuth(app);
export const db = getDatabase(app);

// Export functions
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  ref,
  set,
  update,
  get,
  onValue
};

// Owner UID (Admin Controls)
export const OWNER_UID = "PUT_YOUR_OWNER_UID_HERE";
