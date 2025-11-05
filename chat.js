// ===============================
// 🔹 ZHOB CHAT - chat.js (Full Version)
// ===============================

// Firebase imports
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { firebaseConfig } from "./firebase_config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// UI elements
const chatContainer = document.getElementById("chat-container");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userLabel = document.getElementById("userLabel");

let currentUser = null;

// 🔹 Auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    userLabel.textContent = user.email.split("@")[0];
    chatContainer.classList.remove("hidden");
  } else {
    window.location.href = "index.html";
  }
});

// 🔹 Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => alert("Logout error: " + error.message));
});

// 🔹 Send message
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (text === "") return;

  const messageData = {
    user: currentUser ? currentUser.email.split("@")[0] : "Guest",
    text: text,
    time: new Date().toLocaleTimeString(),
  };

  push(ref(db, "messages"), messageData)
    .then(() => {
      messageInput.value = "";
      chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch((err) => alert("Error: " + err.message));
}

// 🔹 Display messages in real-time
onValue(ref(db, "messages"), (snapshot) => {
  chatBox.innerHTML = "";
  snapshot.forEach((child) => {
    const msg = child.val();
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");
    msgDiv.innerHTML = `
      <strong style="color: #0078ff">${msg.user}</strong> 
      <span style="font-size: 0.8em; color: gray;">(${msg.time})</span>
      <p style="margin: 2px 0;">${msg.text}</p>
    `;
    chatBox.appendChild(msgDiv);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
});
