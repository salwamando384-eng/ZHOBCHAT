// signup.js
import { auth, db } from "./firebase_config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

document.getElementById("signupBtn").onclick = async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) return alert("Enter email & password");

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;
    await set(ref(db, "users/" + uid), {
      name: email.split("@")[0],
      dp: "default_dp.png"
    });
    window.location.href = "profile.html";
  } catch (err) {
    alert("Signup failed: " + err.message);
  }
};
