import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, onChildAdded, push, set, onDisconnect } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const username = localStorage.getItem("username");
const dp = localStorage.getItem("dp") || "default_dp.png";

const usersRef = ref(db, "users/");
const messagesRef = ref(db, "messages/");
const usersList = document.getElementById("usersList");
const messagesDiv = document.getElementById("messages");

const userRef = ref(db, `users/${username}`);
set(userRef, { name: username, dp: dp, status: "online" });
onDisconnect(userRef).set({ name: username, dp: dp, status: "offline" });

onChildAdded(usersRef, (snapshot) => {
  const user = snapshot.val();
  const div = document.createElement("div");
  div.className = "user-item";
  div.innerHTML = `
    <img src="${user.dp}" class="user-dp"/>
    <span>${user.name}</span>
    <span class="${user.status === "online" ? "online" : "offline"}">${user.status}</span>
  `;
  usersList.appendChild(div);
});

document.getElementById("sendBtn").onclick = () => {
  const msgInput = document.getElementById("msgInput");
  const text = msgInput.value.trim();
  if (!text) return;
  const msgData = { name: username, dp: dp, text: text, time: new Date().toLocaleTimeString() };
  push(messagesRef, msgData);
  msgInput.value = "";
};

onChildAdded(messagesRef, (snapshot) => {
  const msg = snapshot.val();
  const msgDiv = document.createElement("div");
  msgDiv.className = msg.name === username ? "my-msg" : "their-msg";
  msgDiv.innerHTML = `
    <img src="${msg.dp}" class="msg-dp"/>
    <div><b>${msg.name}:</b> ${msg.text}<br><small>${msg.time}</small></div>
  `;
  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// ----------------- ERROR LOGGING -----------------
window.onerror = function (msg, url, line, col, error) {
  const errBox = document.createElement("div");
  errBox.style.background = "#300";
  errBox.style.color = "#fff";
  errBox.style.padding = "10px";
  errBox.style.fontSize = "14px";
  errBox.style.position = "fixed";
  errBox.style.bottom = "0";
  errBox.style.left = "0";
  errBox.style.width = "100%";
  errBox.style.zIndex = "9999";
  errBox.innerHTML = `
    <b>⚠️ JavaScript Error:</b><br>
    ${msg}<br>
    <small>${url}:${line}:${col}</small>
  `;
  document.body.appendChild(errBox);
  return false;
};
