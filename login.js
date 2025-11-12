import { auth, db } from "./firebase_config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const loginForm = document.getElementById("loginForm");
const msg = document.getElementById("loginMsg");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("li_email").value.trim();
  const password = document.getElementById("li_password").value.trim();

  if (!email || !password) {
    msg.textContent = "⚠️ تمام خانے پر کریں۔";
    msg.style.color = "red";
    return;
  }

  msg.textContent = "⏳ Login ہو رہا ہے...";
  msg.style.color = "black";

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Set user status to online
    await update(ref(db, "users/" + user.uid), { status: "online" });

    msg.textContent = "✅ Login ہوگیا! Chat پر لے جایا جا رہا ہے...";
    msg.style.color = "#2ea043";

    setTimeout(() => window.location.href = "chat.html", 1000);

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ " + err.message;
    msg.style.color = "red";
  }
});
