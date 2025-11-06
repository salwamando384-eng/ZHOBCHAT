// chat.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL:
    "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.firebasestorage.app",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const usersPanel = document.getElementById("usersPanel");

let currentUser = null;
let userColors = {}; // یوزر کے کلرز محفوظ کرنے کے لیے

// ✅ Random Color Generator
function getRandomColor() {
  const colors = ["#FF5733", "#33FF57", "#3380FF", "#FF33A6", "#FFD433", "#33FFF9"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ✅ User Login Check
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    saveUser(user);
    loadUsers();
    loadMessages();
  } else {
    window.location.href = "index.html";
  }
});

// ✅ Save User Info
function saveUser(user) {
  const userRef = ref(db, "users/" + user.uid);
  get(userRef).then((snapshot) => {
    if (!snapshot.exists()) {
      set(userRef, {
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        dp: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        gender: "نامعلوم",
        city: "نامعلوم",
        online: true,
        color: getRandomColor(),
      });
    } else {
      set(userRef, { ...snapshot.val(), online: true });
    }
  });
}

// ✅ Send Message
function sendMessage() {
  const text = msgInput.value.trim();
  if (text === "") return;

  const msgRef = ref(db, "messages");
  push(msgRef, {
    uid: currentUser.uid,
    user: currentUser.displayName || currentUser.email,
    text: text,
    time: new Date().toLocaleTimeString(),
  });
  msgInput.value = "";
}

sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// ✅ Load Messages
function loadMessages() {
  const msgRef = ref(db, "messages");
  onValue(msgRef, (snapshot) => {
    chatBox.innerHTML = "";
    snapshot.forEach((child) => {
      const data = child.val();
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message");

      // 🔹 یوزر کا رنگ حاصل کریں
      const color = userColors[data.uid] || "#007bff";
      msgDiv.innerHTML = `
        <b style="color:${color}">${data.user}:</b>
        <span style="color:${shadeColor(color, 40)}">${data.text}</span>
        <br><small>${data.time}</small>
      `;
      chatBox.appendChild(msgDiv);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// ✅ Helper: رنگ ہلکا یا گہرا کرنے والا فنکشن
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);
  R = parseInt((R * (100 + percent)) / 100);
  G = parseInt((G * (100 + percent)) / 100);
  B = parseInt((B * (100 + percent)) / 100);
  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;
  const RR = R.toString(16).padStart(2, "0");
  const GG = G.toString(16).padStart(2, "0");
  const BB = B.toString(16).padStart(2, "0");
  return `#${RR}${GG}${BB}`;
}

// ✅ Load Users
function loadUsers() {
  const userRef = ref(db, "users");
  onValue(userRef, (snapshot) => {
    usersPanel.innerHTML = "";
    snapshot.forEach((child) => {
      const u = child.val();
      userColors[child.key] = u.color || getRandomColor();

      const userDiv = document.createElement("div");
      userDiv.classList.add("user-item");
      userDiv.style.cursor = "pointer";
      userDiv.innerHTML = `
        <img src="${u.dp}" style="width:35px;height:35px;border-radius:50%;vertical-align:middle;margin-right:8px;">
        <span style="color:${u.color}">${u.name}</span>
      `;

      // 🔹 کلک پر پروفائل شو
      userDiv.addEventListener("click", () => showProfile(u));

      usersPanel.appendChild(userDiv);
    });
  });
}

// ✅ پروفائل پاپ اپ
const profilePopup = document.createElement("div");
profilePopup.style.display = "none";
profilePopup.style.position = "fixed";
profilePopup.style.top = "50%";
profilePopup.style.left = "50%";
profilePopup.style.transform = "translate(-50%, -50%)";
profilePopup.style.background = "#fff";
profilePopup.style.padding = "20px";
profilePopup.style.borderRadius = "15px";
profilePopup.style.boxShadow = "0 5px 20px rgba(0,0,0,0.3)";
profilePopup.style.textAlign = "center";
profilePopup.style.zIndex = "999";
document.body.appendChild(profilePopup);

// ✅ شو پروفائل
function showProfile(u) {
  profilePopup.innerHTML = `
    <button id="closeProfile" style="position:absolute;top:10px;right:15px;border:none;background:none;font-size:22px;cursor:pointer">×</button>
    <img src="${u.dp}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin-bottom:10px;">
    <h3>${u.name}</h3>
    <p><b>جنس:</b> ${u.gender}</p>
    <p><b>شہر:</b> ${u.city}</p>
    <button id="friendBtn" style="background:#007bff;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;margin:5px;">👫 Friend Request</button>
    <button id="msgBtn" style="background:#28a745;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;margin:5px;">💬 Private Message</button>
  `;
  profilePopup.style.display = "block";

  document.getElementById("closeProfile").addEventListener("click", () => {
    profilePopup.style.display = "none";
  });

  document.getElementById("friendBtn").addEventListener("click", () => {
    alert("Friend Request sent to " + u.name);
  });

  document.getElementById("msgBtn").addEventListener("click", () => {
    alert("Private chat with " + u.name + " coming soon...");
  });
}

// ✅ Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});
