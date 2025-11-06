// Firebase initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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

// Auth
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadMessages();
    loadUsers();
  } else {
    window.location.href = "index.html";
  }
});

// Send Message
sendBtn.addEventListener("click", () => {
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
});

// Load Messages
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
      // Admin delete option
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

// Load Users
function loadUsers() {
  const userRef = ref(db, "users");
  onValue(userRef, (snapshot) => {
    usersPanel.innerHTML = "";
    snapshot.forEach((child) => {
      const data = child.val();
      const userDiv = document.createElement("div");
      userDiv.classList.add("user-item");
      userDiv.textContent = data.name;

      // click for menu
      userDiv.addEventListener("click", () => showUserMenu(data.name));
      usersPanel.appendChild(userDiv);
    });
  });
}

// Show Menu on user click
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

window.viewProfile = (u) => alert(`${u} profile`);
window.startPrivateChat = (u) => alert(`Private chat with ${u}`);
window.changeTheme = (u) => alert(`${u} theme change`);
window.adminAction = (u) => alert(`Admin actions for ${u}`);

// Toggle Users panel
usersBtn.addEventListener("click", () => {
  usersPanel.classList.toggle("show");
});

// Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => (window.location.href = "index.html"));
});
