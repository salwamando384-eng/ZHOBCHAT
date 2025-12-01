// signup.js
import { auth, db } from "./firebase_config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const signupBtn = document.getElementById("signupBtn");
const msgEl = document.getElementById("signupMsg");

signupBtn.onclick = async () => {
  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value.trim();
  const gender = document.getElementById("gender").value;
  const city = document.getElementById("city").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const dpFile = document.getElementById("dpFile").files[0];

  if (!email || !password) {
    msgEl.textContent = "Email and password required.";
    return;
  }

  signupBtn.disabled = true;
  signupBtn.textContent = "Signing up...";

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // default dp
    let dp = "default_dp.png";

    // if dp file chosen -> read as dataURL (base64)
    if (dpFile) {
      dp = await readFileAsDataURL(dpFile);
    }

    // save user data in Realtime DB
    await set(ref(db, "users/" + uid), {
      name: name || "User",
      age: age || "",
      gender: gender || "",
      city: city || "",
      email: email,
      dp: dp
    });

    msgEl.style.color = "green";
    msgEl.textContent = "Signup successful — redirecting...";
    setTimeout(() => location.href = "chat.html", 1200);
  } catch (err) {
    msgEl.style.color = "red";
    msgEl.textContent = "Signup error: " + err.message;
    signupBtn.disabled = false;
    signupBtn.textContent = "Sign Up";
  }
};

function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}
