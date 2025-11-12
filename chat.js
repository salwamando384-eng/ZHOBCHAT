import { auth, db } from "./firebase_config.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, onChildAdded, push, update, get, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const messagesContainer = document.getElementById("messagesContainer");
const messageForm = document.getElementById("messageForm");
const msgInput = document.getElementById("msgInput");
const usersContainer = document.getElementById("usersContainer");
const logoutBtn = document.getElementById("logoutBtn");

let currentUser = null;

// Auth listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    listenMessages();
    loadUsers();
  } else {
    window.location.href = "login.html";
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  await update(ref(db, "users/" + currentUser.uid), { status: "offline" });
  await signOut(auth);
});

// Send message
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!msgInput.value.trim()) return;

  const newMsg = {
    fromUid: currentUser.uid,
    fromName: currentUser.displayName || currentUser.email,
    text: msgInput.value.trim(),
    color: "#000000",
    time: new Date().toLocaleTimeString()
  };

  await push(ref(db, "messages/"), newMsg);
  msgInput.value = "";
});

// Listen messages
function listenMessages() {
  const msgRef = ref(db, "messages/");
  onChildAdded(msgRef, (snap) => {
    const msg = snap.val();
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = `<strong style="color:${msg.color}">${msg.fromName}:</strong> ${msg.text} <span class="time">${msg.time}</span>`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}

// Load users
function loadUsers() {
  const usersRef = ref(db, "users/");
  onChildAdded(usersRef, (snap) => {
    const user = snap.val();
    const div = document.createElement("div");
    div.className = "user";
    div.innerHTML = `<span class="name" style="color:${user.color}">${user.name}</span> - <small>${user.status}</small>`;
    div.addEventListener("click", () => openPrivateChat(user));
    usersContainer.appendChild(div);
  });
}

// Private chat alert (placeholder)
function openPrivateChat(user) {
  alert(`Private chat with ${user.name} will open here`);
}
