import { auth } from "./firebase_config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");

loginBtn.onclick = () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login successful!");
      window.location.href = "chat.html";
    })
    .catch(err => {
      alert("Login failed: " + err.message);
    });
};
