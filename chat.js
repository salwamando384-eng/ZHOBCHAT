// chat.js (final version)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, onValue, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getStorage, ref as sRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// === Firebase Config ===
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
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

const el = id => document.getElementById(id);
const emailKey = email => email.split('.').join('_');

const chatBox = el('chat-box');
const userList = el('userList');
const sendBtn = el('sendBtn');
const logoutBtn = el('logoutBtn');
const messageInput = el('messageInput');
const chatWith = el('chatWith');

let currentUser = null;

// Auth check
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;

  const key = emailKey(user.email);
  await update(ref(db, "users/" + key), { online: true });

  listenMessages();
  listenUsers();
});

// Send message
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(); });

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !currentUser) return;

  const userKey = emailKey(currentUser.email);
  onValue(ref(db, "users/" + userKey), (snap) => {
    const userData = snap.val();
    if (!userData) return;

    const msg = {
      name: userData.name,
      email: userData.email,
      text,
      dpURL: userData.dpURL || "default_dp.png",
      nameColor: userData.nameColor || "#ff4d4d",
      msgColor: userData.msgColor || "#ffffff",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    push(ref(db, "messages"), msg);
    messageInput.value = "";
  }, { onlyOnce: true });
}

// Listen messages
function listenMessages() {
  chatBox.innerHTML = "";
  onChildAdded(ref(db, "messages"), snapshot => {
    const msg = snapshot.val();
    appendMessage(msg);
  });
}

function appendMessage(msg) {
  const row = document.createElement("div");
  row.className = "msg-row";

  const dp = document.createElement("img");
  dp.className = "msg-dp";
  dp.src = msg.dpURL || "default_dp.png";

  const content = document.createElement("div");
  content.className = "msg-content";

  const top = document.createElement("div");
  top.className = "msg-top";
  const name = document.createElement("span");
  name.className = "msg-name";
  name.textContent = msg.name || "Unknown";
  name.style.color = msg.nameColor;

  const time = document.createElement("span");
  time.className = "msg-time";
  time.textContent = msg.time || "";

  top.appendChild(name);
  top.appendChild(time);

  const text = document.createElement("div");
  text.className = "msg-text";
  text.textContent = msg.text;
  text.style.color = msg.msgColor;

  content.appendChild(top);
  content.appendChild(text);

  row.appendChild(dp);
  row.appendChild(content);

  chatBox.appendChild(row);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Listen users
function listenUsers() {
  onValue(ref(db, "users"), snapshot => {
    userList.innerHTML = "";
    snapshot.forEach(child => {
      const u = child.val();
      const li = document.createElement("li");
      li.className = "user-item";
      li.innerHTML = `
        <img src="${u.dpURL || 'default_dp.png'}" class="user-dp">
        <span class="user-name">${u.name}</span>
      `;
      li.addEventListener("click", () => {
        chatWith.textContent = u.name;
      });
      userList.appendChild(li);
    });
  });
}

// Logout
logoutBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  const key = emailKey(currentUser.email);
  await update(ref(db, "users/" + key), { online: false });
  await signOut(auth);
  window.location.href = "index.html";
});
