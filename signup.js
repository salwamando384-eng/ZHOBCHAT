// === signup.js ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.firebasestorage.app",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const signupForm = document.getElementById("signupForm");
const msg = document.getElementById("msg");

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    msg.textContent = "⚠️ براہ کرم تمام فیلڈز بھریں۔";
    msg.style.color = "red";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await set(ref(db, "users/" + user.uid), {
        name: name,
        email: email,
        joinedAt: new Date().toLocaleString(),
      });

      msg.textContent = "✅ اکاؤنٹ بن گیا! Redirect ہو رہا ہے...";
      msg.style.color = "#2ea043";

      setTimeout(() => {
        window.location.href = "chat.html";
      }, 2000);
    })
    .catch((error) => {
      msg.textContent = "❌ " + error.message;
      msg.style.color = "red";
    });
});
