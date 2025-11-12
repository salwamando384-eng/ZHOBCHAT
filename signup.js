// signup.js
import { auth, db } from "./firebase_config.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const signupForm = document.getElementById("signupForm");
const msg = document.getElementById("signupMsg");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.style.display = "block";

  const name = document.getElementById("su_name").value.trim();
  const age = document.getElementById("su_age").value.trim();
  const gender = document.getElementById("su_gender").value;
  const city = document.getElementById("su_city").value.trim();
  const email = document.getElementById("su_email").value.trim();
  const password = document.getElementById("su_password").value.trim();

  if (!name || !age || !gender || !city || !email || !password) {
    msg.textContent = "⚠️ تمام خانے پر کریں۔";
    msg.style.color = "red";
    return;
  }

  try {
    msg.textContent = "⏳ اکاؤنٹ بن رہا ہے...";
    msg.style.color = "black";

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // Update auth profile (displayName + photoURL) and write user record
    await updateProfile(user, { displayName: name, photoURL: "default_dp.png" });

    await set(ref(db, `users/${user.uid}`), {
      uid: user.uid,
      name,
      age,
      gender,
      city,
      email,
      dp: "default_dp.png",
      color: "#000000",
      textColor: "#000000",
      status: "online",
      joinedAt: new Date().toISOString(),
      isAdmin: false
    });

    msg.textContent = "✅ اکاؤنٹ بن گیا — Chat پر لے جایا جا رہا ہے...";
    msg.style.color = "green";

    // give Firebase a moment to settle, then redirect
    setTimeout(() => { window.location.href = "chat.html"; }, 1300);

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ " + err.message;
    msg.style.color = "red";
  }
});
