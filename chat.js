import { auth, db } from "./firebase_config.js";
import { ref, push, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const messagesBox = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const chatDp = document.getElementById("chatDp");
const profileBtn = document.getElementById("profileBtn");

// Go to Profile
profileBtn.onclick = () => {
  window.location.href = "profile.html";
};

// Load user DP
onAuthStateChanged(auth, (user) => {
  if (!user) return;
  const userRef = ref(db, "users/" + user.uid);
  onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (data && data.dp) chatDp.src = data.dp + "?t=" + Date.now();
  });
});

// Load messages
const msgRef = ref(db, "messages");
onValue(msgRef, (snapshot) => {
  messagesBox.innerHTML = "";
  snapshot.forEach((child) => {
    const msg = child.val();
    const div = document.createElement("div");
    div.className = "msg";
    div.textContent = msg.text;
    messagesBox.appendChild(div);
  });
  messagesBox.scrollTop = messagesBox.scrollHeight;
});

// Send message
sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (!text) return;
  push(msgRef, { text, time: Date.now() });
  messageInput.value = "";
};

// Logout
logoutBtn.onclick = () => {
  signOut(auth).then(() => location.href = "login.html");
};
