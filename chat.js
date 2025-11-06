import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
  getDatabase, ref, push, onValue, set 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.firebasestorage.app",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const usersBtn = document.getElementById("usersBtn");
const usersPanel = document.getElementById("usersPanel");

let currentUser = null;

// 🔹 Login Check
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

// 🔹 Save User Info
function saveUser(user) {
  const userRef = ref(db, "users/" + user.uid);
  set(userRef, {
    name: user.email.split("@")[0],
    email: user.email,
    online: true,
    lastSeen: new Date().toLocaleString()
  });
}

// 🔹 Send Message
function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  const msgRef = ref(db, "messages");
  push(msgRef, {
    uid: currentUser.uid,
    user: currentUser.email.split("@")[0],
    text,
    time: new Date().toLocaleTimeString()
  });
  msgInput.value = "";
  playSound();
}

// 🔹 Sound on Send
function playSound() {
  const sound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_dca1dcf00e.mp3");
  sound.play();
}

sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// 🔹 Load Messages
function loadMessages() {
  const msgRef = ref(db, "messages");
  onValue(msgRef, (snapshot) => {
    chatBox.innerHTML = "";
    snapshot.forEach((child) => {
      const m = child.val();
      const div = document.createElement("div");
      div.classList.add("message");
      div.innerHTML = `<b>${m.user}:</b> ${m.text}<br><small>${m.time}</small>`;
      chatBox.appendChild(div);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// 🔹 Load Users
function loadUsers() {
  const userRef = ref(db, "users");
  onValue(userRef, (snapshot) => {
    usersPanel.innerHTML = "";
    snapshot.forEach((child) => {
      const u = child.val();
      const div = document.createElement("div");
      div.classList.add("user-item");
      div.textContent = `${u.name} (${u.online ? "🟢" : "⚫"})`;
      usersPanel.appendChild(div);
    });
  });
}

// 🔹 Toggle Users Panel
usersBtn.addEventListener("click", () => {
  usersPanel.classList.toggle("show");
});

// 🔹 Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "index.html");
});

// 🎨 Theme Color Change
const themeButtons = document.querySelectorAll(".theme-btn");
themeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.body.style.background = btn.dataset.color;
  });
});
