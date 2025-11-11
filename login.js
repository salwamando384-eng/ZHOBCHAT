// ===============================
// 🔹 ZHOBCHAT - Login Page Script
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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

// 🔹 Login Handler
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("loginMsg");

  if (!email || !password) {
    msg.textContent = "⚠️ ای میل اور پاس ورڈ درج کریں۔";
    return;
  }

  msg.textContent = "⏳ لاگ ان ہو رہا ہے...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    msg.style.color = "#2ea043";
    msg.textContent = "✅ کامیابی سے لاگ ان ہو گیا! Redirect ہو رہا ہے...";
    setTimeout(() => window.location.href = "chat.html", 1500);
  } catch (err) {
    console.error("Login error:", err);
    msg.style.color = "#f85149";
    msg.textContent = "❌ " + err.message;
  }
});

// 🔹 Auto Redirect if Already Logged In
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "chat.html";
  }
});
