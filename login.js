// login.js
import { auth, db } from "./firebase_config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMsg.style.display = "block";

  const email = document.getElementById("li_email").value.trim();
  const password = document.getElementById("li_password").value.trim();

  if (!email || !password) {
    loginMsg.textContent = "⚠️ تمام خانے پر کریں۔";
    loginMsg.style.color = "red";
    return;
  }

  try {
    loginMsg.textContent = "⏳ لاگ ان ہو رہا ہے...";
    loginMsg.style.color = "black";

    const uc = await signInWithEmailAndPassword(auth, email, password);
    const user = uc.user;

    // mark online
    await update(ref(db, `users/${user.uid}`), { status: "online", lastSeen: null });

    loginMsg.textContent = "✅ لاگ ان ہوگیا! Chat پر جا رہے ہیں...";
    loginMsg.style.color = "green";
    setTimeout(()=>window.location.href="chat.html",900);

  } catch (err) {
    console.error(err);
    loginMsg.textContent = "❌ " + err.message;
    loginMsg.style.color = "red";
  }
});
