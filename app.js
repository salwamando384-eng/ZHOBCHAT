// 🔥 Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import { firebaseConfig } from "./firebase_config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🎯 Get Elements
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesDiv = document.getElementById("messages");
const emojiBtn = document.getElementById("emojiBtn");
const usersOnlineList = document.getElementById("usersOnline");

// 👤 Current user (temporary)
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {
  name: "Guest" + Math.floor(Math.random() * 1000),
  dp: "https://i.pravatar.cc/40?u=" + Math.random()
};

// ✅ Save current user
localStorage.setItem("currentUser", JSON.stringify(currentUser));

// 💬 Send Message
sendBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (text === "") return;

  const msgRef = ref(db, "messages");
  push(msgRef, {
    name: currentUser.name,
    dp: currentUser.dp,
    text: text,
    time: new Date().toLocaleTimeString(),
  });

  messageInput.value = "";

  // 🤖 Trigger random robot reply
  setTimeout(sendRobotReply, 2000);
});

// 🧹 Delete message (for owner only)
function deleteMessage(id) {
  remove(ref(db, "messages/" + id));
}

// 📥 Listen for messages
onValue(ref(db, "messages"), (snapshot) => {
  messagesDiv.innerHTML = "";
  snapshot.forEach((child) => {
    const msg = child.val();
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `
      <img src="${msg.dp}" class="avatar">
      <div>
        <strong>${msg.name}</strong>: ${msg.text}
        <small>${msg.time}</small>
      </div>
      ${currentUser.name === "Owner" ? `<button onclick="deleteMessage('${child.key}')">🗑️</button>` : ""}
    `;
    messagesDiv.appendChild(div);
  });
});

// 🤖 Robots setup
const robots = [
  { name: "Robo Ali", dp: "https://i.pravatar.cc/40?img=1" },
  { name: "Robo Sara", dp: "https://i.pravatar.cc/40?img=2" },
  { name: "Robo Khan", dp: "https://i.pravatar.cc/40?img=3" },
  { name: "Robo Ayesha", dp: "https://i.pravatar.cc/40?img=4" },
  { name: "Robo Noor", dp: "https://i.pravatar.cc/40?img=5" }
];
const replies = [
  "ہیلو! 😊 کیسے ہو؟",
  "میں ایک روبوٹ ہوں 🤖",
  "آج کا دن کیسا جا رہا ہے؟",
  "زبردست بات ہے 😄",
  "ہاہا، یہ دلچسپ ہے 😂"
];
function sendRobotReply() {
  const robot = robots[Math.floor(Math.random() * robots.length)];
  const msgRef = ref(db, "messages");
  push(msgRef, {
    name: robot.name,
    dp: robot.dp,
    text: replies[Math.floor(Math.random() * replies.length)],
    time: new Date().toLocaleTimeString(),
  });
}

// 😄 Emoji Button → Show Users List
emojiBtn.addEventListener("click", () => {
  if (usersOnlineList.style.display === "block") {
    usersOnlineList.style.display = "none";
  } else {
    usersOnlineList.style.display = "block";
    usersOnlineList.innerHTML = "<li>👤 " + currentUser.name + " (You)</li>";
    robots.forEach((bot) => {
      usersOnlineList.innerHTML += `<li>🤖 ${bot.name}</li>`;
    });
  }
});

// 🚪 Logout Button
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
});
