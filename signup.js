// signup.js
import { auth, db } from "./firebase_config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const signupBtn = document.getElementById("signupBtn");
const msgEl = document.getElementById("msg"); // if present

signupBtn && signupBtn.addEventListener("click", async () => {
  signupBtn.disabled = true;
  const originalText = signupBtn.innerText;
  signupBtn.innerText = "Signing up...";

  try {
    const name = (document.getElementById("name")?.value || "").trim();
    const age = (document.getElementById("age")?.value || "").trim();
    const gender = (document.getElementById("gender")?.value || "").trim();
    const city = (document.getElementById("city")?.value || "").trim();
    const email = (document.getElementById("email")?.value || "").trim();
    const password = (document.getElementById("password")?.value || "").trim();
    const dpFile = document.getElementById("dpFile")?.files?.[0];

    if (!email || !password) throw new Error("Email and password required");

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    // Default dp
    let dp = "default_dp.png";

    // If file selected, read as base64 and save into DB
    if (dpFile) {
      dp = await fileToDataURL(dpFile);
    }

    await set(ref(db, "users/" + uid), {
      name: name || "User",
      age: age || "",
      gender: gender || "",
      city: city || "",
      email: email,
      dp: dp
    });

    if (msgEl) msgEl.innerText = "Signup successful!";
    signupBtn.innerText = "Signed up";
    setTimeout(() => window.location.href = "chat.html", 900);
  } catch (err) {
    console.error(err);
    if (msgEl) msgEl.innerText = err.message || "Signup error";
    alert(err.message || "Signup error");
  } finally {
    signupBtn.disabled = false;
    signupBtn.innerText = originalText;
  }
});

function fileToDataURL(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onerror = () => rej(new Error("File read error"));
    reader.onload = () => res(reader.result);
    reader.readAsDataURL(file);
  });
}
