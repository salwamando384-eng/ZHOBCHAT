// app.js (100% WORKING LOGIN + SIGNUP)

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.firebasestorage.app",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218",
  measurementId: "G-LX9P9LRLV8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const msg = document.getElementById("msg");

// ✅ Login Function
loginBtn.addEventListener("click", () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      msg.style.color = "green";
      msg.textContent = "Login successful!";
      window.location.href = "chat.html";
    })
    .catch((error) => {
      msg.textContent = error.message;
    });
});

// ✅ Signup Function
signupBtn.addEventListener("click", () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      msg.style.color = "green";
      msg.textContent = "Signup successful!";
      window.location.href = "chat.html";
    })
    .catch((error) => {
      msg.textContent = error.message;
    });
});
