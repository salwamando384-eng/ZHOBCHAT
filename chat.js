// === chat.js ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.firebasestorage.app",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const msgBox = document.getElementById("msgBox");
const sendBtn = document.getElementById("sendBtn");
const chatArea = document.getElementById("chatArea");

let currentUser = null;

// ✅ جب user لاگ ان ہو
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = {
      uid: user.uid,
      name: user.displayName || user.email
    };
  } else {
    window.location.href = "login.html";
  }
});

// ✅ میسج بھیجنا
sendBtn.addEventListener("click", () => {
  const text = msgBox.value.trim();
  if (text === "" || !currentUser) return;

  push(ref(db, "messages"), {
    fromUid: currentUser.uid,
    fromName: currentUser.name,
    text: text,
    time: new Date().toLocaleTimeString()
  });

  msgBox.value = "";
});

// ✅ میسجز دکھانا
onChildAdded(ref(db, "messages"), (snapshot) => {
  const msg = snapshot.val();
  const div = document.createElement("div");

  div.classList.add("msg");
  div.innerHTML = `<b>${msg.fromName}</b>: ${msg.text} <small>(${msg.time})</small>`;

  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
});
