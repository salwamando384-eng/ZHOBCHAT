// chat.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
  getDatabase, ref, push, onValue, set 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🔹 Firebase Config
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

// 🔹 HTML Elements
const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const usersBtn = document.getElementById("usersBtn");
const usersPanel = document.getElementById("usersPanel");

let currentUser = null;

// ✅ User Login Check
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    saveUser(user);
    loadMessages();
    loadUsers();
  } else {
    window.location.href = "index.html";
  }
});

// 🔹 Save user info in DB
function saveUser(user) {
  const userRef = ref(db, "users/" + user.uid);
  set(userRef, {
    name: user.displayName || user.email,
    email: user.email,
    lastSeen: new Date().toLocaleString(),
    online: true
  });
}

// 🔹 Send message
function sendMessage() {
  const text = msgInput.value.trim();
  if (text === "") return;

  const msgRef = ref(db, "messages");
  push(msgRef, {
    uid: currentUser.uid,
    user: currentUser.displayName || currentUser.email,
    text: text,
    time: new Date().toLocaleTimeString()
  });
  msgInput.value = "";
}

sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// 🔹 Load messages
function loadMessages() {
  const msgRef = ref(db, "messages");
  onValue(msgRef, (snapshot) => {
    chatBox.innerHTML = "";
    snapshot.forEach((child) => {
      const data = child.val();
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message");
      msgDiv.innerHTML = `
        <b>${data.user}:</b> ${data.text}
        <br><small>${data.time}</small>
      `;
      chatBox.appendChild(msgDiv);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// 🔹 Load users list
function loadUsers() {
  const userRef = ref(db, "users");
  onValue(userRef, (snapshot) => {
    usersPanel.innerHTML = "";
    snapshot.forEach((child) => {
      const u = child.val();
      const userDiv = document.createElement("div");
      userDiv.classList.add("user-item");
      userDiv.textContent = u.name || u.email;
      usersPanel.appendChild(userDiv);
    });
  });
}

// 🔹 Toggle user list
usersBtn.addEventListener("click", () => {
  usersPanel.classList.toggle("show");
});

// 🔹 Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});
