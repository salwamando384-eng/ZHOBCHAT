import { getDatabase, ref, push, onValue, remove, set } from "firebase/database";
import { getAuth, signOut } from "firebase/auth";
import { app } from "./firebase_config.js";

const db = getDatabase(app);
const auth = getAuth(app);

const messageBox = document.getElementById("messageBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userToggle = document.getElementById("userToggle");
const userList = document.getElementById("userList");
const onlineUsers = document.getElementById("onlineUsers");
const offlineUsers = document.getElementById("offlineUsers");

const profileBtn = document.getElementById("profileBtn");
const privateBtn = document.getElementById("privateBtn");
const themeBtn = document.getElementById("themeBtn");

const adminPanel = document.getElementById("adminPanel");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const blockUserBtn = document.getElementById("blockUserBtn");
const muteUserBtn = document.getElementById("muteUserBtn");

let currentUser = null;
let adminEmail = "admin@gmail.com";

// Toggle Users list
userToggle.onclick = () => userList.classList.toggle("show");

// Firebase Auth state
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    set(ref(db, "presence/" + user.uid), { email: user.email, online: true });
  }
});

// Messages
sendBtn.addEventListener("click", () => {
  if (messageInput.value.trim() === "") return;
  push(ref(db, "messages"), {
    user: currentUser?.email || "Guest",
    text: messageInput.value,
    time: Date.now(),
  });
  messageInput.value = "";
});

// Show messages
onValue(ref(db, "messages"), (snapshot) => {
  messageBox.innerHTML = "";
  snapshot.forEach((child) => {
    const msg = child.val();
    const div = document.createElement("div");
    div.textContent = `${msg.user}: ${msg.text}`;
    messageBox.appendChild(div);
  });
});

// Presence system (Online/Offline)
onValue(ref(db, "presence"), (snapshot) => {
  onlineUsers.innerHTML = "";
  offlineUsers.innerHTML = "";
  snapshot.forEach((child) => {
    const user = child.val();
    const el = document.createElement("p");
    el.textContent = user.email;
    user.online ? onlineUsers.appendChild(el) : offlineUsers.appendChild(el);
  });
});

// Theme changer
themeBtn.onclick = () => {
  document.body.classList.toggle("dark");
};

// Profile info
profileBtn.onclick = () => {
  alert("👤 Your Profile:\n" + (currentUser?.email || "Guest User"));
};

// Private Chat
privateBtn.onclick = () => {
  const email = prompt("Enter email for private chat:");
  if (email) alert("💬 Private chat started with " + email);
};

// Admin
deleteAllBtn.onclick = () => {
  if (confirm("Delete all messages?")) remove(ref(db, "messages"));
};

// Logout
logoutBtn.onclick = () => {
  signOut(auth).then(() => (window.location.href = "index.html"));
};
