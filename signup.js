import { auth, db, storage } from "./firebase_config.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  ref,
  set
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";


// ===============================
//        SIGNUP BUTTON
// ===============================
document.getElementById("signupBtn").onclick = async () => {

  const name = document.getElementById("nameInput").value.trim();
  const email = document.getElementById("emailInput").value.trim();
  const pass = document.getElementById("passwordInput").value.trim();

  if (name === "" || email === "" || pass === "") {
    alert("Please fill all fields!");
    return;
  }

  try {
    // Make Account
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = userCred.user.uid;

    // Default DP
    const defaultDP = "default-dp.png";

    // Save user data in DB
    await set(ref(db, "users/" + uid), {
      name: name,
      email: email,
      dp: defaultDP,
      age: "",
      gender: "",
      city: "",
      about: ""
    });

    alert("Signup Successful!");
    location.href = "chat.html";

  } catch (err) {
    alert(err.message);
  }
};
