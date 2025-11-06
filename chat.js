// ===============================
// 🔹 ZHOB CHAT - chat.js (Full Working Version)
// ===============================

// Firebase imports
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, remove, update } from "firebase/database";
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
const usersToggle = document.getElementById("usersToggle");
const usersList = document.getElementById("usersList");

let currentUser = null;

// ===============================
// 🔹 AUTH STATE
// ===============================
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    userLabel.textContent = user.email.split("@")[0];
    chatContainer.classList.remove("hidden");
    addUserToList(currentUser.email.split("@")[0]);
  } else {
    window.location.href = "index.html";
  }
});

// ===============================
// 🔹 LOGOUT FUNCTION
// ===============================
logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      remove(ref(db, "users/" + currentUser.uid));
      window.location.href = "index.html";
    })
    .catch((error) => alert("Logout error: " + error.message));
});

// ===============================
// 🔹 SEND MESSAGE
// ===============================
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

// ===============================
// 🔹 DISPLAY MESSAGES (REAL-TIME)
// ===============================
onValue(ref(db, "messages"), (snapshot) => {
  chatBox.innerHTML = "";
  snapshot.forEach((child) => {
    const msg = child.val();
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");

    // Delete option for admin
    let deleteBtn = "";
    if (currentUser && currentUser.email === "admin@gmail.com") {
      deleteBtn = `<button class="deleteBtn" data-id="${child.key}">🗑️</button>`;
    }

    msgDiv.innerHTML = `
      <div class="msg-header">
        <strong style="color:#0078ff">${msg.user}</strong>
        <span style="font-size:0.8em;color:gray;">${msg.time}</span>
        ${deleteBtn}
      </div>
      <div class="msg-text">${msg.text}</div>
    `;
    chatBox.appendChild(msgDiv);
  });

  // Delete message action
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      remove(ref(db, "messages/" + id));
    });
  });

  chatBox.scrollTop = chatBox.scrollHeight;
});

// ===============================
// 🔹 USER LIST (Online)
// ===============================
function addUserToList(username) {
  const userRef = ref(db, "users/" + currentUser.uid);
  update(userRef, { name: username, online: true });

  // Remove user when disconnects
  userRef.onDisconnect().remove();
}

// Show users list
onValue(ref(db, "users"), (snapshot) => {
  usersList.innerHTML = "";
  snapshot.forEach((child) => {
    const user = child.val();
    const li = document.createElement("li");
    li.textContent = user.name;
    li.className = user.online ? "online" : "offline";
    usersList.appendChild(li);
  });
});

// Toggle users sidebar
usersToggle.addEventListener("click", () => {
  usersList.classList.toggle("hidden");
});

// ===============================
// 🔹 ADMIN FEATURES (mute/block)
// ===============================
function muteUser(username) {
  alert(username + " has been muted (demo)");
}

function blockUser(username) {
  alert(username + " has been blocked (demo)");
}
