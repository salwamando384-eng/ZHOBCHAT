// login.js
import { auth } from "./firebase_config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
const status = document.getElementById("loginStatus");

loginBtn.onclick = async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) { status.innerText = "Provide email and password"; return; }

  loginBtn.innerText = "Logging in...";
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "chat.html";
  } catch (err) {
    console.error(err);
    status.innerText = err.message || "Login failed";
    loginBtn.innerText = "Login";
  }
};
