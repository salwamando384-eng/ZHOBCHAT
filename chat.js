// chat.js (updated for firebase_config.js v11)
import { auth, db } from "./firebase_config.js";
import {
  ref,
  push,
  onValue,
  remove,
  set,
  update
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Elements
const msgInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatBox = document.getElementById("chatBox");
const logoutBtn = document.getElementById("logoutBtn");
const usersBtn = document.getElementById("usersBtn");
const usersPanel = document.getElementById("usersPanel");

let currentUser = null;

// Auth
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    // Save user info
    const userRef = ref(db, "users/" + user.uid);
    set(userRef, {
      name: user.displayName || user.email,
      email: user.email,
      online: true,
      lastSeen: new Date().toLocaleString()
    });

    loadMessages();
    loadUsers();
  } else {
    window.location.href = "index.html";
  }
});

// Send message
function sendMessage() {
  const text = msgInput.value.trim();
  if (text === "") return;

  const messageRef = ref(db, "messages");
  push(messageRef, {
    user: currentUser.displayName || currentUser.email,
    uid: currentUser.uid,
    text: text,
    time: new Date().toLocaleTimeString()
  });
  msgInput.value = "";
}

sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Load messages
function loadMessages() {
  const messageRef = ref(db, "messages");
  onValue(messageRef, (snapshot) => {
    chatBox.innerHTML = "";
    snapshot.forEach((child) => {
      const data = child.val();
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message");
      msgDiv.innerHTML = `
        <b>${data.user}:</b> ${data.text}
        <small>${data.time}</small>
      `;
      if (currentUser.email === "admin@zhobchat.com") {
        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️";
        delBtn.onclick = () => remove(ref(db, `messages/${child.key}`));
        msgDiv.appendChild(delBtn);
      }
      chatBox.appendChild(msgDiv);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Load users
function loadUsers() {
  const userRef = ref(db, "users");
  onValue(userRef, (snapshot) => {
    usersPanel.innerHTML = "";
    snapshot.forEach((child) => {
      const data = child.val();
      const userDiv = document.createElement("div");
      userDiv.classList.add("user-item");
      userDiv.textContent = data.name || data.email;
      userDiv.addEventListener("click", () => showUserMenu(data.name));
      usersPanel.appendChild(userDiv);
    });
  });
}

// User menu
function showUserMenu(username) {
  const menu = document.createElement("div");
  menu.classList.add("user-menu");
  menu.innerHTML = `
    <button onclick="viewProfile('${username}')">Profile</button>
    <button onclick="startPrivateChat('${username}')">Private</button>
    <button onclick="changeTheme('${username}')">Theme</button>
    <button onclick="adminAction('${username}')">Action</button>
  `;
  document.body.appendChild(menu);
  setTimeout(() => menu.remove(), 4000);
}

window.viewProfile = (u) => alert(`${u}'s profile`);
window.startPrivateChat = (u) => alert(`Private chat with ${u}`);
window.changeTheme = (u) => alert(`${u}'s theme`);
window.adminAction = (u) => alert(`Admin actions for ${u}`);

// Toggle users panel
usersBtn.addEventListener("click", () => {
  usersPanel.classList.toggle("show");
});

// Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => (window.location.href = "index.html"));
});
