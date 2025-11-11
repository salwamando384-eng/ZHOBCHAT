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

// 🔹 Signup Form
const signupForm = document.getElementById("signupForm");
const msg = document.getElementById("signupMsg");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("su_name").value.trim();
  const gender = document.getElementById("su_gender").value;
  const city = document.getElementById("su_city").value.trim();
  const email = document.getElementById("su_email").value.trim();
  const password = document.getElementById("su_password").value.trim();

  if (!name || !email || !password || !city || !gender) {
    msg.style.color = "#f85149";
    msg.textContent = "⚠️ تمام خانے پر کریں۔";
    return;
  }

  msg.style.color = "#000";
  msg.textContent = "⏳ آپ کا اکاؤنٹ بن رہا ہے...";

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    await updateProfile(user, {
      displayName: name,
      photoURL: "default_dp.png"
    });

    await set(ref(db, "users/" + user.uid), {
      uid: user.uid,
      name,
      gender,
      city,
      email,
      photoURL: "default_dp.png",
      joinedAt: new Date().toLocaleString()
    });

    msg.style.color = "#2ea043";
    msg.textContent = "✅ اکاؤنٹ بن گیا! Redirect ہو رہا ہے...";
    setTimeout(() => window.location.href = "chat.html", 1500);

  } catch (err) {
    console.error("Signup error:", err);
    msg.style.color = "#f85149";
    msg.textContent = "❌ " + err.message;
  }
});
