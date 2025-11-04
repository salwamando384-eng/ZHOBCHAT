import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, push, set, onChildAdded, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 🔥 اپنے Firebase Config سے بدلیں
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_APP.firebaseapp.com",
  databaseURL: "https://YOUR_APP-default-rtdb.firebaseio.com",
  projectId: "YOUR_APP",
  storageBucket: "YOUR_APP.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

const authContainer = document.getElementById("auth-container");
const chatContainer = document.getElementById("chat-container");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("messageInput");

let currentUser = null;
let userProfile = {};

document.getElementById("showLogin").onclick = () => {
  document.getElementById("signup-section").classList.add("hidden");
  document.getElementById("login-section").classList.remove("hidden");
};

document.getElementById("showSignup").onclick = () => {
  document.getElementById("signup-section").classList.remove("hidden");
  document.getElementById("login-section").classList.add("hidden");
};

// ✅ Signup
document.getElementById("signupBtn").onclick = async () => {
  const email = email.value;
  const password = password.value;
  const name = document.getElementById("name").value;
  const city = document.getElementById("city").value;
  const gender = document.getElementById("gender").value;
  const age = document.getElementById("age").value;
  const nameColor = document.getElementById("nameColor").value;
  const msgColor = document.getElementById("msgColor").value;
  const dpFile = document.getElementById("dpUpload").files[0];

  if (!email || !password || !name) return alert("Please fill all required fields");

  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCred.user.uid;

  let dpURL = "default_dp.png";
  if (dpFile) dpURL = URL.createObjectURL(dpFile);

  userProfile = { name, city, gender, age, nameColor, msgColor, dpURL };

  await set(ref(db, "users/" + uid), userProfile);
};

// ✅ Login
document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  await signInWithEmailAndPassword(auth, email, password);
};

// ✅ Auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    authContainer.classList.add("hidden");
    chatContainer.classList.remove("hidden");
  } else {
    authContainer.classList.remove("hidden");
    chatContainer.classList.add("hidden");
  }
});

// ✅ Send message
document.getElementById("sendBtn").onclick = async () => {
  const msg = messageInput.value.trim();
  if (!msg) return;

  const msgRef = push(ref(db, "messages"));
  await set(msgRef, {
    uid: currentUser.uid,
    text: msg,
    username: userProfile.name,
    dp: userProfile.dpURL,
    nameColor: userProfile.nameColor,
    msgColor: userProfile.msgColor,
    time: new Date().toLocaleTimeString(),
    timestamp: serverTimestamp()
  });
  messageInput.value = "";
};

// ✅ Display message
onChildAdded(ref(db, "messages"), (snap) => {
  const data = snap.val();
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `
    <img src="${data.dp}" alt="dp">
    <div class="msg-content" style="color:${data.msgColor}">
      <div><span class="username" style="color:${data.nameColor}">${data.username}:</span> ${data.text}</div>
      <div class="msg-time">${data.time}</div>
    </div>
  `;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// ✅ Logout
document.getElementById("logoutBtn").onclick = () => signOut(auth);
