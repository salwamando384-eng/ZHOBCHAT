// login.js
import { auth } from "./firebase_config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const btn = document.getElementById("loginBtn");
const msg = document.getElementById("loginMsg");

btn.onclick = async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) { msg.textContent = "Enter email & password"; return; }

  btn.disabled = true;
  btn.textContent = "Logging in...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    location.href = "chat.html";
  } catch (err) {
    msg.style.color = "red";
    msg.textContent = "Login error: " + err.message;
    btn.disabled = false;
    btn.textContent = "Login";
  }
};
