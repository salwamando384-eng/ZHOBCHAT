import { getDatabase, ref, push, onValue, remove, update } from "firebase/database";
import { getAuth, signOut } from "firebase/auth";
import { app } from "./firebase_config.js";

const db = getDatabase(app);
const auth = getAuth(app);

const messageBox = document.getElementById("messageBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");

const adminPanel = document.getElementById("adminPanel");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const blockUserBtn = document.getElementById("blockUserBtn");
const muteUserBtn = document.getElementById("muteUserBtn");

let currentUser = auth.currentUser;
let mutedUsers = {};
let blockedUsers = {};
let adminEmail = "admin@gmail.com"; // ← اپنا ایڈمن جی میل یہاں لکھیں

// --- Hide admin panel for normal users ---
if (currentUser && currentUser.email === adminEmail) {
  adminPanel.classList.remove("hidden");
}

// --- Send message ---
sendBtn.addEventListener("click", () => {
  if (messageInput.value.trim() === "") return;
  push(ref(db, "messages"), {
    user: currentUser.email,
    text: messageInput.value,
    time: Date.now(),
  });
  messageInput.value = "";
});

// --- Display messages ---
onValue(ref(db, "messages"), (snapshot) => {
  messageBox.innerHTML = "";
  snapshot.forEach((child) => {
    const msg = child.val();
    if (blockedUsers[msg.user]) return; // hide blocked users

    const div = document.createElement("div");
    div.className = "msg";
    div.textContent = `${msg.user}: ${msg.text}`;
    messageBox.appendChild(div);

    // Allow admin to delete individual message
    if (currentUser && currentUser.email === adminEmail) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
      delBtn.onclick = () => remove(ref(db, "messages/" + child.key));
      div.appendChild(delBtn);
    }
  });
});

// --- Delete all messages (admin only) ---
deleteAllBtn.onclick = () => {
  if (confirm("Delete all messages?")) {
    remove(ref(db, "messages"));
  }
};

// --- Block user ---
blockUserBtn.onclick = () => {
  const email = prompt("Enter user email to block:");
  if (email) blockedUsers[email] = true;
  alert(email + " blocked.");
};

// --- Mute user ---
muteUserBtn.onclick = () => {
  const email = prompt("Enter user email to mute:");
  if (email) mutedUsers[email] = true;
  alert(email + " muted.");
};

// --- Logout ---
logoutBtn.onclick = () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};
