// ===============================
// 🔹 ZHOBCHAT - Signup Page Script
// ===============================

// Firebase import
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 🔹 Signup Button Click
document.getElementById("signupBtn").addEventListener("click", async () => {
  const name = document.getElementById("su_name").value.trim();
  const gender = document.getElementById("su_gender").value;
  const city = document.getElementById("su_city").value.trim();
  const email = document.getElementById("su_email").value.trim();
  const password = document.getElementById("su_password").value.trim();
  const msg = document.getElementById("signupMsg");

  if (!name || !email || !password || !city || !gender) {
    msg.textContent = "❌ Please fill all required fields.";
    return;
  }

  msg.textContent = "⏳ Creating your account...";

  try {
    // Create account
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // Update user profile (optional)
    await updateProfile(user, {
      displayName: name,
      photoURL: "default_dp.png" // default DP
    });

    // Save to Database
    await set(ref(db, "users/" + user.uid), {
      uid: user.uid,
      name,
      gender,
      city,
      email,
      photoURL: "default_dp.png",
      joinedAt: new Date().toLocaleString()
    });

    msg.textContent = "✅ Account created successfully! Redirecting...";
    setTimeout(() => {
      window.location.href = "chat.html";
    }, 1500);

  } catch (err) {
    console.error("Signup error:", err);
    msg.textContent = "❌ " + err.message;
  }
});
