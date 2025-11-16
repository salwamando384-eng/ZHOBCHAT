import { auth, db } from "./firebase_config.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  ref,
  set
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

document.getElementById("signupBtn").onclick = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(user => {
      const uid = user.user.uid;

      set(ref(db, "users/" + uid), {
        name: "New User",
        dp: "default_dp.png"
      });

      alert("Signup successful!");
      location.href = "profile.html";
    })
    .catch(err => alert(err.message));
};
