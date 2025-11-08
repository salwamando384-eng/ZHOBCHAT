// ✅ Signup.js - ZhobChat

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ✅ DOM Elements
const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value.trim();
  const gender = document.getElementById("gender").value.trim();
  const city = document.getElementById("city").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const dpFile = document.getElementById("dp").files[0];

  if (!email || !password || !name) {
    alert("براہ کرم تمام فیلڈز بھریں");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // 🔹 Default DP
      const reader = new FileReader();
      reader.onload = function () {
        const dpURL = dpFile ? reader.result : "default_dp.png";

        set(ref(db, "users/" + user.uid), {
          name,
          age,
          gender,
          city,
          email,
          dp: dpURL,
          blockedUsers: []
        }).then(() => {
          alert("Signup کامیاب 🎉");
          window.location = "chat.html";
        });
      };

      if (dpFile) reader.readAsDataURL(dpFile);
      else reader.onload();
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});
