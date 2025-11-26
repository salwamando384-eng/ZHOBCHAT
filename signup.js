// signup.js
import { auth, db } from "./firebase_config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const signupBtn = document.getElementById("signupBtn");
const msgEl = document.getElementById("msg");

signupBtn.onclick = async () => {
  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value.trim();
  const gender = document.getElementById("gender").value;
  const city = document.getElementById("city").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const dpFile = document.getElementById("dpFile").files[0];

  if (!email || !password) {
    msgEl.innerText = "Email and password required.";
    return;
  }

  signupBtn.innerText = "Signing up...";
  msgEl.innerText = "";

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    // Default dp value (can be default image filename or data URL)
    let dpValue = "default_dp.png";

    // If file chosen → convert to base64 data URL and store in DB
    if (dpFile) {
      const reader = new FileReader();
      const base64 = await new Promise((res, rej) => {
        reader.onload = () => res(reader.result);
        reader.onerror = err => rej(err);
        reader.readAsDataURL(dpFile);
      });
      dpValue = base64;
    }

    // Save initial user profile to Realtime Database
    await set(ref(db, "users/" + uid), {
      name: name || "New User",
      age: age || "",
      gender: gender || "",
      city: city || "",
      email: email,
      dp: dpValue
    });

    msgEl.innerText = "Signup successful!";
    signupBtn.innerText = "Success";

    setTimeout(() => { window.location.href = "login.html"; }, 1200);
  } catch (err) {
    console.error(err);
    msgEl.innerText = err.message || "Signup error";
    signupBtn.innerText = "Sign Up";
  }
};
