// signup.js
import { auth, db } from "./firebase_config.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const signupForm = document.getElementById("signupForm");
const msg = document.getElementById("signupMsg");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const gender = document.getElementById("gender").value;
  const age = document.getElementById("age").value.trim();
  const city = document.getElementById("city").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const displayColor = document.getElementById("displayColor").value;
  const textColor = document.getElementById("textColor").value;
  const photoURL = document.getElementById("photoURL").value || "default_dp.png";

  if (!name || !gender || !age || !city || !email || !password) {
    msg.style.color = "#f85149";
    msg.textContent = "⚠️ Please fill all fields.";
    return;
  }

  msg.style.color = "#000";
  msg.textContent = "⏳ Creating your account...";

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // Only allowed fields
    await updateProfile(user, { displayName: name, photoURL });

    // Store other details in database
    await set(ref(db, "users/" + user.uid), {
      uid: user.uid,
      name,
      gender,
      age,
      city,
      email,
      photoURL,
      displayColor,
      textColor,
      joinedAt: new Date().toLocaleString(),
      status: "online"
    });

    msg.style.color = "#2ea043";
    msg.textContent = "✅ Account created! Redirecting...";
    setTimeout(() => location.href = "chat.html", 1500);

  } catch (err) {
    console.error("Signup error:", err);
    msg.style.color = "#f85149";
    msg.textContent = "❌ " + err.message;
  }
});
