import { auth, db } from "./firebase_config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const gender = document.getElementById("gender").value;
  const city = document.getElementById("city").value.trim();
  const dp = document.getElementById("dp").value.trim() || "https://i.postimg.cc/tTmSkg3V/default-dp.png";

  if (!name || !email || !password || !gender || !city) {
    alert("تمام فیلڈز بھرنا لازمی ہے!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Save user info in Firebase Realtime Database
    await set(ref(db, "users/" + uid), {
      name,
      email,
      gender,
      city,
      dp,
      uid,
      joinedAt: new Date().toISOString()
    });

    alert("Signup مکمل! اب آپ لاگ اِن کر سکتے ہیں۔");
    window.location.href = "login.html";
  } catch (error) {
    alert("Error: " + error.message);
  }
});
