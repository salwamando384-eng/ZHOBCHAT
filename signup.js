import { auth, db } from "./firebase_config.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const signupForm = document.getElementById("signupForm");
const msg = document.getElementById("msg");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    msg.textContent = "⚠️ تمام خانے پر کریں۔";
    msg.style.color = "red";
    return;
  }

  msg.textContent = "⏳ اکاؤنٹ بنایا جا رہا ہے...";
  msg.style.color = "black";

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    await set(ref(db, "users/" + user.uid), {
      uid: user.uid,
      name,
      email,
      photoURL: "default_dp.png",
      status: "online",
      joinedAt: new Date().toLocaleString()
    });

    msg.textContent = "✅ اکاؤنٹ بن گیا! Chat پر لے جایا جا رہا ہے...";
    msg.style.color = "#2ea043";

    setTimeout(() => window.location.href = "chat.html", 1500);

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ " + err.message;
    msg.style.color = "red";
  }
});
