import { auth, db } from "./firebase_config.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  ref,
  set
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

document.getElementById("signupBtn").onclick = () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Enter email & password");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((user) => {
      const uid = user.user.uid;

      // Save basic user data
      set(ref(db, "users/" + uid), {
        name: "New User",
        dp: "default_dp.png"
      });

      alert("Signup Successful!");
      window.location.href = "profile.html";
    })
    .catch((err) => {
      alert(err.message);
    });
};
