// =====================
// 🔹 Firebase Imports
// =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  set
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// =====================
// 🔹 Firebase Config
// =====================
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

// =====================
// 🔹 Initialize Firebase
// =====================
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// =====================
// 🔹 HTML Elements
// =====================
const signupArea = document.getElementById("signupArea");
const loginArea = document.getElementById("loginArea");
const chatArea = document.getElementById("chatArea");
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");

// =====================
// 🔹 Signup Function
// =====================
window.signup = async function () {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const pass = document.getElementById("signupPass").value.trim();

  if (!name || !email || !pass) {
    alert("⚠️ تمام خانے پر کریں");
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;

    await set(ref(db, "users/" + user.uid), {
      uid: user.uid,
      name,
      email,
      joinedAt: new Date().toLocaleString(),
    });

    alert("✅ Signup مکمل!");
    signupArea.style.display = "none";
    chatArea.style.display = "block";
  } catch (e) {
    alert("❌ Signup Error: " + e.message);
  }
};

// =====================
// 🔹 Login Function
// =====================
window.login = async function () {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value.trim();

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    alert("✅ Login Successful!");
    loginArea.style.display = "none";
    chatArea.style.display = "block";
    loadMessages();
  } catch (e) {
    alert("❌ Login Error: " + e.message);
  }
};

// =====================
// 🔹 Send Message
// =====================
window.sendMessage = async function () {
  const msg = messageInput.value.trim();
  const user = auth.currentUser;

  if (!msg) return;
  if (!user) {
    alert("⚠️ پہلے Login کریں!");
    return;
  }

  const msgRef = push(ref(db, "messages"));
  await set(msgRef, {
    from: user.email,
    text: msg,
    time: new Date().toLocaleTimeString()
  });

  messageInput.value = "";
};

// =====================
// 🔹 Load Messages
// =====================
function loadMessages() {
  const msgRef = ref(db, "messages");
  onChildAdded(msgRef, (snapshot) => {
    const data = snapshot.val();
    const div = document.createElement("div");
    div.className = "msgBox";
    div.innerHTML = `<b>${data.from}:</b> ${data.text} <span>${data.time}</span>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// =====================
// 🔹 Logout Function
// =====================
window.logout = function () {
  signOut(auth).then(() => {
    chatArea.style.display = "none";
    loginArea.style.display = "block";
  });
};

// =====================
// 🔹 UI Switchers
// =====================
window.showLogin = function () {
  signupArea.style.display = "none";
  loginArea.style.display = "block";
};
window.showSignup = function () {
  loginArea.style.display = "none";
  signupArea.style.display = "block";
};

// =====================
// 🔹 Global Error Catch
// =====================
window.addEventListener("error", (e) => alert("⚠️ Error: " + e.message));
