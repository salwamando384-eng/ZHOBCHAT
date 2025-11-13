// === login.js ===
// Import Firebase modules
import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { app } from "./firebase_config.js";

// Initialize Firebase Auth
const auth = getAuth(app);

// Keep user logged in (for GitHub Pages)
setPersistence(auth, browserLocalPersistence);

// Login Button Click
document.getElementById("loginBtn").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("براہ کرم ای میل اور پاس ورڈ درج کریں۔");
    return;
  }

  try {
    // Sign In User
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful! Redirecting...");
    window.location.replace("chat.html");
  } catch (error) {
    console.error("Login Error:", error.message);
    alert("Login Error: " + error.message);
  }
});

// Auto redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is already logged in
    window.location.replace("chat.html");
  }
});
