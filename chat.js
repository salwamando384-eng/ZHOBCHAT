// Chat.js
import { auth, db } from "./firebase_config.js";
import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  ref,
  push,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const logoutBtn = document.getElementById("logoutBtn");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");
const usersBtn = document.getElementById("usersBtn");
const usersList = document.getElementById("usersList");

// ✅ Login check
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// ✅ Send message
sendBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message === "") return;

  const user = auth.currentUser;
  if (!user) return;

  const messageRef = ref(db, "messages");
  const newMsg = push(messageRef);
  set(newMsg, {
    text: message,
    user: user.email,
    time: new Date().toLocaleTimeString()
  });

  messageInput.value = "";
});

// ✅ Show messages
const messageRef = ref(db, "messages");
onValue(messageRef, (snapshot) => {
  messagesDiv.innerHTML = "";
  snapshot.forEach((child) => {
    const data = child.val();
    const msg = document.createElement("div");
    msg.classList.add("message");
    msg.innerHTML = `<b>${data.user}</b>: ${data.text} <span class="time">${data.time}</span>`;
    messagesDiv.appendChild(msg);
  });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// ✅ Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});

// ✅ Users list toggle
usersBtn.addEventListener("click", () => {
  if (usersList.style.display === "none" || usersList.style.display === "") {
    usersList.style.display = "block";
  } else {
    usersList.style.display = "none";
  }
});
