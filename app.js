// === ZHOBCHAT Chat JS ===
// Firebase import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  set,
  onValue,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// === Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.firebasestorage.app",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218",
  measurementId: "G-LX9P9LRLV8"
};

// === Initialize Firebase ===
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// === Signup ===
window.signup = function() {
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const pass = document.getElementById("signupPass").value;

  createUserWithEmailAndPassword(auth, email, pass)
    .then((cred) => {
      updateProfile(cred.user, { displayName: name });
      set(ref(db, "users/" + cred.user.uid), {
        name: name,
        email: email,
        joinedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        status: "online"
      });
      alert("Signup successful!");
      showChat();
    })
    .catch((err) => alert(err.message));
};

// === Login ===
window.login = function() {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPass").value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => {
      alert("Login successful!");
      showChat();
    })
    .catch((err) => alert(err.message));
};

// === Logout ===
window.logout = function() {
  signOut(auth);
  document.getElementById("chatArea").style.display = "none";
  document.getElementById("loginArea").style.display = "block";
};

// === Send Message ===
window.sendMessage = function() {
  const msg = document.getElementById("messageInput").value.trim();
  if (!msg) return;

  const user = auth.currentUser;
  const msgRef = push(ref(db, "messages"));
  set(msgRef, {
    fromUid: user.uid,
    fromName: user.displayName || "Unknown",
    text: msg,
    time: new Date().toLocaleTimeString()
  });

  document.getElementById("messageInput").value = "";
};

// === Show Messages in Realtime ===
onChildAdded(ref(db, "messages"), (data) => {
  const msg = data.val();
  const div = document.createElement("div");
  div.className = "msgBox";
  div.innerHTML = `<b>${msg.fromName}:</b> ${msg.text} <span>${msg.time}</span>`;
  document.getElementById("chatMessages").appendChild(div);
  div.scrollIntoView();
});

// === Auth State Change ===
onAuthStateChanged(auth, (user) => {
  if (user) showChat();
});

// === Show Chat UI ===
function showChat() {
  document.getElementById("loginArea").style.display = "none";
  document.getElementById("signupArea").style.display = "none";
  document.getElementById("chatArea").style.display = "block";
}
