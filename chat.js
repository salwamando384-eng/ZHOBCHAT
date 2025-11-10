// === ZHOBCHAT Chat JS ===
// Firebase import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  set,
  onValue,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// === Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyB-WYRWq3pQ1r_hLzMZ_4FItTd0jRclB1Q",
  authDomain: "zhobchat-2a01e.firebaseapp.com",
  databaseURL: "https://zhobchat-2a01e-default-rtdb.firebaseio.com",
  projectId: "zhobchat-2a01e",
  storageBucket: "zhobchat-2a01e.appspot.com",
  messagingSenderId: "1003454915453",
  appId: "1:1003454915453:web:73a7e4d5c2b3b6bfb2b30e"
};

// === Initialize Firebase ===
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// === Elements ===
const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const usersBtn = document.getElementById("usersBtn");
const usersListBox = document.getElementById("userList");
const usersUl = document.getElementById("users");
const typingStatus = document.getElementById("typingStatus");

let currentUser = null;
let typingTimer;

// === Check User Auth ===
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUser = user;
    addUserStatus(user);
    loadMessages();
    loadActiveUsers();
  }
});

// === Add User Online ===
function addUserStatus(user) {
  const userRef = ref(db, "activeUsers/" + user.uid);
  set(userRef, {
    email: user.email,
    online: true
  });

  window.addEventListener("beforeunload", () => {
    remove(userRef);
  });
}

// === Load Active Users ===
function loadActiveUsers() {
  const activeRef = ref(db, "activeUsers/");
  onValue(activeRef, (snapshot) => {
    usersUl.innerHTML = "";
    snapshot.forEach((child) => {
      const li = document.createElement("li");
      li.textContent = child.val().email;
      usersUl.appendChild(li);
    });
  });
}

// === Load Messages ===
function loadMessages() {
  const chatRef = ref(db, "messages/");
  onChildAdded(chatRef, (data) => {
    const msg = data.val();
    displayMessage(msg);
  });
}

// === Display Message ===
function displayMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("msg");
  if (msg.email === currentUser.email) div.classList.add("self");
  div.innerHTML = `
    <strong>${msg.email.split("@")[0]}</strong><br>
    ${msg.text}
    <span class="timestamp">${msg.time}</span>
  `;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// === Send Message ===
sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
  setTypingStatus(true);
});

function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  const chatRef = ref(db, "messages/");
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  push(chatRef, {
    text,
    email: currentUser.email,
    time
  });

  msgInput.value = "";
  setTypingStatus(false);
}

// === Typing Indicator ===
function setTypingStatus(isTyping) {
  const typingRef = ref(db, "typing/" + currentUser.uid);
  if (isTyping) {
    set(typingRef, { email: currentUser.email, typing: true });
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      remove(typingRef);
    }, 2000);
  } else {
    remove(typingRef);
  }
}

const typingRef = ref(db, "typing/");
onValue(typingRef, (snapshot) => {
  let someoneTyping = false;
  snapshot.forEach((child) => {
    if (child.val().email !== currentUser.email) {
      someoneTyping = true;
    }
  });
  typingStatus.textContent = someoneTyping ? "کوئی لکھ رہا ہے..." : "";
});

// === Toggle User List ===
usersBtn.addEventListener("click", () => {
  usersListBox.style.display =
    usersListBox.style.display === "block" ? "none" : "block";
});

// === Logout ===
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});
