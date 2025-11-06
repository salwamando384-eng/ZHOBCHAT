// Firebase initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.firebasestorage.app",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218",
  measurementId: "G-LX9P9LRLV8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Elements
const msgInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatBox = document.getElementById("chatBox");
const logoutBtn = document.getElementById("logoutBtn");
const usersBtn = document.getElementById("usersBtn");
const usersPanel = document.getElementById("usersPanel");

let currentUser = null;

// --- AUTH ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
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

// --- SEND MESSAGE ---
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

// --- LOAD MESSAGES ---
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
        <small style="float:right;">${data.time}</small>
      `;

      // Admin can delete
      if (currentUser.email === "admin@zhobchat.com") {
        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️";
        delBtn.style.marginLeft = "10px";
        delBtn.onclick = () => remove(ref(db, `messages/${child.key}`));
        msgDiv.appendChild(delBtn);
      }

      chatBox.appendChild(msgDiv);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// --- LOAD USERS ---
function loadUsers() {
  const userRef = ref(db, "users");
  onValue(userRef, (snapshot) => {
    usersPanel.innerHTML = "";
    snapshot.forEach((child) => {
      const data = child.val();
      const userDiv = document.createElement("div");
      userDiv.classList.add("user-item");
      userDiv.textContent = data.name || data.email;
      userDiv.onclick = () => showUserMenu(data.name);
      usersPanel.appendChild(userDiv);
    });
  });
}

// --- USER MENU ---
function showUserMenu(username) {
  const menu = document.createElement("div");
  menu.classList.add("user-menu");
  menu.innerHTML = `
    <button onclick="alert('${username} profile')">Profile</button>
    <button onclick="alert('Private chat with ${username}')">Private</button>
    <button onclick="alert('Change theme for ${username}')">Theme</button>
  `;
  document.body.appendChild(menu);
  setTimeout(() => menu.remove(), 4000);
}

// --- TOGGLE USERS PANEL ---
usersBtn.addEventListener("click", () => {
  usersPanel.classList.toggle("show");
});

// --- LOGOUT ---
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => (window.location.href = "index.html"));
});
