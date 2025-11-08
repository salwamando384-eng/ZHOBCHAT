import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onChildAdded
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🔥 تمہارا Firebase config
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// UI elements
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const messagesDiv = document.getElementById("messages");
const logoutBtn = document.getElementById("logoutBtn");

let currentUser = null;

// 🔹 Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadMessages();
  } else {
    window.location.href = "index.html";
  }
});

// 🔸 Send message
sendBtn.onclick = async () => {
  const text = msgInput.value.trim();
  if (!text) return;

  const msgRef = push(ref(db, "messages"));
  await set(msgRef, {
    text,
    user: currentUser.displayName || "Anonymous",
    uid: currentUser.uid,
    time: new Date().toLocaleTimeString()
  });

  msgInput.value = "";
};

// 🔸 Load messages live
function loadMessages() {
  const msgsRef = ref(db, "messages");
  onChildAdded(msgsRef, (snapshot) => {
    const msg = snapshot.val();
    const div = document.createElement("div");
    div.classList.add("msg");
    div.innerHTML = `<b>${msg.user}</b>: ${msg.text} <small>${msg.time}</small>`;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// 🔹 Logout
logoutBtn.onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};
