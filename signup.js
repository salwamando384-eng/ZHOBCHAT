// signup.js
import { auth, db } from "./firebase_config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const signupBtn = document.getElementById("signupBtn");
const status = document.getElementById("signupStatus");

signupBtn.onclick = async () => {
  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value.trim();
  const gender = document.getElementById("gender").value;
  const city = document.getElementById("city").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const dpFile = document.getElementById("dpFile").files[0];

  if (!email || !password) { status.innerText = "Email and password required"; return; }

  signupBtn.innerText = "Signing up...";
  status.innerText = "";

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    // default dp: small placeholder
    let dpData = "default_dp.png";

    if (dpFile) {
      // read as base64 data URL
      dpData = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = () => rej("File read error");
        r.readAsDataURL(dpFile);
      });
    }

    await set(ref(db, "users/" + uid), {
      name: name || "User",
      age: age || "",
      gender: gender || "",
      city: city || "",
      email: email,
      dp: dpData,
      role: "user" // role: user (owner can be set manually in DB)
    });

    status.innerText = "Signup successful! Redirecting...";
    signupBtn.innerText = "Done";

    setTimeout(() => { window.location.href = "login.html"; }, 1000);
  } catch (err) {
    console.error(err);
    status.innerText = err.message || "Signup error";
    signupBtn.innerText = "Sign Up";
  }
};
