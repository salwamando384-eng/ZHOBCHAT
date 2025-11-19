// auth.js
import { auth, db, storage } from "./firebase_config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const toLogin = document.getElementById("toLogin");
const toSignup = document.getElementById("toSignup");

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

const suName = document.getElementById("suName");
const suEmail = document.getElementById("suEmail");
const suPass = document.getElementById("suPass");
const suDp = document.getElementById("suDp");
const suMsg = document.getElementById("suMsg");

const liEmail = document.getElementById("liEmail");
const liPass = document.getElementById("liPass");
const liMsg = document.getElementById("liMsg");

toLogin.onclick = () => { signupForm.classList.add("hidden"); loginForm.classList.remove("hidden"); }
toSignup.onclick = () => { loginForm.classList.add("hidden"); signupForm.classList.remove("hidden"); }

signupBtn.onclick = async () => {
  suMsg.textContent = "";
  const name = suName.value.trim();
  const email = suEmail.value.trim();
  const pass = suPass.value;

  if (!name || !email || pass.length < 6) { suMsg.textContent = "براہِ کرم درست معلومات دیں"; return; }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;

    // default dp
    let dpURL = "default_dp.png";

    if (suDp.files.length > 0) {
      const file = suDp.files[0];
      const storageRef = sRef(storage, `dp/${uid}.jpg`);
      await uploadBytes(storageRef, file);
      dpURL = await getDownloadURL(storageRef);
    }

    // save user profile in DB
    await set(ref(db, `users/${uid}`), {
      name,
      email,
      dp: dpURL,
      online: true,
      lastSeen: Date.now()
    });

    // redirect to chat
    window.location.href = "chat.html";
  } catch (err) {
    suMsg.textContent = "Error: " + err.message;
  }
};

loginBtn.onclick = async () => {
  liMsg.textContent = "";
  const email = liEmail.value.trim();
  const pass = liPass.value;
  if (!email || !pass) { liMsg.textContent = "Enter email & password"; return; }

  try {
    await signInWithEmailAndPassword(auth, email, pass);

    // set online flag
    const uid = auth.currentUser.uid;
    await set(ref(db, `users/${uid}/online`), true);
    await set(ref(db, `users/${uid}/lastSeen`), Date.now());

    window.location.href = "chat.html";
  } catch (err) {
    liMsg.textContent = "Error: " + err.message;
  }
};

// If already logged in, go to chat
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "chat.html";
  }
});
