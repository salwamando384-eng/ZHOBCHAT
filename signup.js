import { auth, db } from "./firebase_config.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const signupForm = document.getElementById("signupForm");
const msg = document.getElementById("signupMsg");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("su_name").value.trim();
  const age = document.getElementById("su_age").value.trim();
  const gender = document.getElementById("su_gender").value;
  const city = document.getElementById("su_city").value.trim();
  const email = document.getElementById("su_email").value.trim();
  const password = document.getElementById("su_password").value.trim();

  if (!name || !age || !gender || !city || !email || !password) {
    msg.style.color = "red";
    msg.textContent = "⚠️ تمام خانے پر کریں۔";
    return;
  }

  msg.style.color = "black";
  msg.textContent = "⏳ آپ کا اکاؤنٹ بن رہا ہے...";

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    await updateProfile(user, { displayName: name, photoURL: "default_dp.png" });

    await set(ref(db, "users/" + user.uid), {
      uid: user.uid,
      name,
      age,
      gender,
      city,
      email,
      photoURL: "default_dp.png",
      color: "#000000",
      status: "online",
      joinedAt: new Date().toLocaleString()
    });

    msg.style.color = "#2ea043";
    msg.textContent = "✅ اکاؤنٹ بن گیا! Chat پر لے جایا جا رہا ہے...";

    setTimeout(() => window.location.href = "chat.html", 1000);
  } catch (err) {
    console.error(err);
    msg.style.color = "red";
    msg.textContent = "❌ " + err.message;
  }
});
