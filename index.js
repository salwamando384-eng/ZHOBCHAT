// index.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// ✅ تمہارا Firebase Config
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// 🟦 Tabs switching
const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

tabLogin.onclick = () => {
  tabLogin.classList.add("active");
  tabSignup.classList.remove("active");
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
};

tabSignup.onclick = () => {
  tabSignup.classList.add("active");
  tabLogin.classList.remove("active");
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
};

// 🟢 LOGIN
document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("li_email").value.trim();
  const password = document.getElementById("li_password").value.trim();
  const msg = document.getElementById("loginMsg");

  msg.textContent = "Logging in...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    msg.textContent = "✅ Login successful";
    setTimeout(() => (window.location.href = "chat.html"), 1000);
  } catch (err) {
    msg.textContent = "❌ " + err.message;
  }
};

// 🟣 SIGNUP
document.getElementById("signupBtn").onclick = async () => {
  const name = document.getElementById("su_name").value.trim();
  const gender = document.getElementById("su_gender").value;
  const age = document.getElementById("su_age").value;
  const city = document.getElementById("su_city").value.trim();
  const email = document.getElementById("su_email").value.trim();
  const password = document.getElementById("su_password").value.trim();
  const dpFile = document.getElementById("su_dp").files[0];
  const nameColor = document.getElementById("su_nameColor").value;
  const msgColor = document.getElementById("su_msgColor").value;
  const msg = document.getElementById("signupMsg");

  if (!name || !email || !password) {
    msg.textContent = "❌ Fill all required fields";
    return;
  }

  msg.textContent = "Creating account...";

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // 🖼 Upload profile picture if provided
    let dpUrl = "";
    if (dpFile) {
      const dpRef = sRef(storage, "profiles/" + user.uid + ".jpg");
      await uploadBytes(dpRef, dpFile);
      dpUrl = await getDownloadURL(dpRef);
    }

    // Update Firebase Auth profile
    await updateProfile(user, {
      displayName: name,
      photoURL: dpUrl
    });

    // Save user info in Realtime Database
    await set(ref(db, "users/" + user.uid), {
      uid: user.uid,
      name,
      gender,
      age,
      city,
      email,
      dp: dpUrl,
      nameColor,
      msgColor,
      createdAt: new Date().toISOString()
    });

    msg.textContent = "🎉 Signup successful!";
    setTimeout(() => (window.location.href = "chat.html"), 1500);
  } catch (err) {
    msg.textContent = "❌ " + err.message;
  }
};
