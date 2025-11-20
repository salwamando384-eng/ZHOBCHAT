// index.js (signup/login)
import { auth, db, storage } from "./firebase_config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const toLogin = document.getElementById("toLogin");
const toSignup = document.getElementById("toSignup");

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

const suName = document.getElementById("suName");
const suGender = document.getElementById("suGender");
const suAge = document.getElementById("suAge");
const suCity = document.getElementById("suCity");
const suAbout = document.getElementById("suAbout");
const suEmail = document.getElementById("suEmail");
const suPass = document.getElementById("suPass");
const suDp = document.getElementById("suDp");
const suMsg = document.getElementById("suMsg");

const liEmail = document.getElementById("liEmail");
const liPass = document.getElementById("liPass");
const liMsg = document.getElementById("liMsg");

toLogin.onclick = (e) => { e.preventDefault(); signupForm.classList.add("hidden"); loginForm.classList.remove("hidden"); }
toSignup.onclick = (e) => { e.preventDefault(); loginForm.classList.add("hidden"); signupForm.classList.remove("hidden"); }

signupBtn.onclick = async () => {
  suMsg.textContent = "";
  const name = suName.value.trim();
  const gender = suGender.value;
  const age = suAge.value;
  const city = suCity.value.trim();
  const about = suAbout.value.trim();
  const email = suEmail.value.trim();
  const pass = suPass.value;

  if (!name || !email || pass.length < 6) { suMsg.textContent = "Please fill name, email and password (6+)."; return; }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;

    // upload dp if provided
    let dpURL = "default_dp.png";
    if (suDp.files.length > 0) {
      const file = suDp.files[0];
      const sref = sRef(storage, `dp/${uid}.jpg`);
      await uploadBytes(sref, file);
      dpURL = await getDownloadURL(sref);
    }

    // save profile
    await set(ref(db, `users/${uid}`), {
      name, gender, age: age || "", city, about, email, dp: dpURL, online: true, lastSeen: Date.now(), isAdmin: false
    });

    // redirect
    window.location.href = "chat.html";
  } catch (err) {
    suMsg.textContent = "Error: " + err.message;
  }
};

loginBtn.onclick = async () => {
  liMsg.textContent = "";
  const email = liEmail.value.trim();
  const pass = liPass.value;
  if (!email || !pass) { liMsg.textContent = "Enter email and password."; return; }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);

    // mark online
    const uid = userCred.user.uid;
    await set(ref(db, `users/${uid}/online`), true);
    await set(ref(db, `users/${uid}/lastSeen`), Date.now());

    window.location.href = "chat.html";
  } catch (err) {
    liMsg.textContent = "Error: " + err.message;
  }
};

onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "chat.html";
});
