import { getDatabase, ref, push, onChildAdded, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from "./firebase_config.js";

const db = getDatabase(app);
const auth = getAuth(app);
const userList = document.getElementById("userList");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const themeSelect = document.getElementById("themeSelect");
const notifySound = document.getElementById("notifySound");

let currentUser = null;
let currentChat = "global";

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
  else {
    currentUser = user;
    loadUsers();
    loadMessages();
  }
});

// 🎨 Theme handling
themeSelect.addEventListener("change", () => {
  const theme = themeSelect.value;
  document.body.className = theme;
  localStorage.setItem("theme", theme);
});

window.addEventListener("load", () => {
  const saved = localStorage.getItem("theme");
  if (saved) {
    document.body.className = saved;
    themeSelect.value = saved;
  }
});

// 👥 Load dummy users (robots)
const robots = [
  { name: "Abid", dp: "https://i.pravatar.cc/100?img=11" },
  { name: "Hina", dp: "https://i.pravatar.cc/100?img=12" },
  { name: "Akbar Khan", dp: "https://i.pravatar.cc/100?img=13" },
  { name: "Junaid", dp: "https://i.pravatar.cc/100?img=14" },
  { name: "Shaista", dp: "https://i.pravatar.cc/100?img=15" }
];

function loadUsers() {
  userList.innerHTML = "";
  robots.forEach(u => {
    const li = document.createElement("li");
    li.innerHTML = `<img src="${u.dp}" class="dp"> ${u.name}`;
    li.onclick = () => openPrivateChat(u.name);
    userList.appendChild(li);
  });
}

// 💬 Global messages
function loadMessages() {
  const msgRef = ref(db, "messages/");
  onChildAdded(msgRef, (data) => {
    const msg = data.val();
    const div = document.createElement("div");
    div.className = msg.sender === currentUser.email ? "me" : "them";
    div.innerHTML = `<strong>${msg.senderName}:</strong> ${msg.text}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    if (msg.sender !== currentUser.email) notifySound.play();
  });
}

// ✉️ Send message
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", e => e.key === "Enter" && sendMessage());

function sendMessage() {
  if (!messageInput.value.trim()) return;
  const msg = {
    sender: currentUser.email,
    senderName: currentUser.displayName || "User",
    text: messageInput.value,
    time: Date.now(),
    chat: currentChat
  };
  push(ref(db, "messages/"), msg);
  messageInput.value = "";
}

// 🔒 Private Chat (dummy visual only)
function openPrivateChat(name) {
  document.getElementById("chatWith").textContent = name + " (Private)";
  chatBox.innerHTML = `<div class="notice">Private chat with ${name}</div>`;
}

// 🚪 Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => (window.location.href = "index.html"));
});
