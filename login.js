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
    msg.style.color = "red";
    msg.textContent = "⚠️ تمام خانے پر کریں۔";
    return;
  }

  msg.style.color = "black";
  msg.textContent = "⏳ لاگ ان ہو رہا ہے...";

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // Update status online
    await update(ref(db, "users/" + user.uid), { status: "online" });

    msg.style.color = "#2ea043";
    msg.textContent = "✅ لاگ ان ہو گیا! Chat پر لے جایا جا رہا ہے...";
    setTimeout(() => window.location.href = "chat.html", 1000);

  } catch (err) {
    console.error(err);
    msg.style.color = "red";
    msg.textContent = "❌ " + err.message;
  }
});
