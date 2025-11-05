import { getDatabase, ref, push, onValue, remove } from "firebase/database";
import { getAuth, signOut } from "firebase/auth";
import { app } from "./firebase_config.js";

const db = getDatabase(app);
const auth = getAuth(app);

const messageBox = document.getElementById("messageBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const menuToggle = document.getElementById("menuToggle");
const userList = document.getElementById("userList");

const adminPanel = document.getElementById("adminPanel");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const blockUserBtn = document.getElementById("blockUserBtn");
const muteUserBtn = document.getElementById("muteUserBtn");

let currentUser = auth.currentUser;
let blockedUsers = {};
let adminEmail = "admin@gmail.com"; // ← اپنا ایڈمن جی میل

// Toggle user list
menuToggle.onclick = () => {
  userList.classList.toggle("show");
};

// Show admin panel only for admin
if (currentUser && currentUser.email === adminEmail) {
  adminPanel.classList.remove("hidden");
}

// Send message
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
    if (blockedUsers[msg.user]) return;

    const div = document.createElement("div");
    div.className = "msg";
    div.textContent = `${msg.user}: ${msg.text}`;
    messageBox.appendChild(div);

    if (currentUser && currentUser.email === adminEmail) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
      delBtn.onclick = () => remove(ref(db, "messages/" + child.key));
      div.appendChild(delBtn);
    }
  });
});

// Admin controls
deleteAllBtn.onclick = () => {
  if (confirm("Delete all messages?")) remove(ref(db, "messages"));
};

blockUserBtn.onclick = () => {
  const email = prompt("Enter user email to block:");
  if (email) blockedUsers[email] = true;
  alert(email + " blocked.");
};

muteUserBtn.onclick = () => {
  const email = prompt("Enter user email to mute:");
  if (email) alert(email + " muted (no sound).");
};

// Logout
logoutBtn.onclick = () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};
