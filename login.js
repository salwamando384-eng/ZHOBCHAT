// login.js
import { auth } from "./firebase_config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
const loginMsg = document.getElementById("loginMsg");

loginBtn && loginBtn.addEventListener("click", async () => {
  loginBtn.disabled = true;
  const orig = loginBtn.innerText;
  loginBtn.innerText = "Logging in...";

  try {
    const email = (document.getElementById("email")?.value || "").trim();
    const password = (document.getElementById("password")?.value || "").trim();
    if (!email || !password) throw new Error("Email & password required");

    await signInWithEmailAndPassword(auth, email, password);
    if (loginMsg) loginMsg.innerText = "Login successful";
    window.location.href = "chat.html";
  } catch (err) {
    console.error(err);
    if (loginMsg) loginMsg.innerText = err.message;
    alert(err.message || "Login failed");
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerText = orig;
  }
});
