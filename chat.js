// chat.js
import { auth, db } from "./firebase_config.js";
import { ref, push, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const messagesBox = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatDp = document.getElementById("chatDp");

// Logout button if needed
const logoutBtn = document.getElementById("logoutBtn");

// Current user ID
let currentUserId = null;

onAuthStateChanged(auth, (user) => {
  if (!user) return window.location.href = "login.html";
  currentUserId = user.uid;

  const userRef = ref(db, "users/" + user.uid);

  // Display user's DP in header
  onValue(userRef, snapshot => {
    const data = snapshot.val();
    if (data && data.dp) {
      chatDp.src = data.dp + "?t=" + new Date().getTime();
    }
  });
});

// Messages reference
const msgRef = ref(db, "messages");

onValue(msgRef, (snapshot) => {
  messagesBox.innerHTML = "";
  snapshot.forEach(child => {
    const msg = child.val();

    const div = document.createElement("div");
    div.className = msg.userId === currentUserId ? "msg-sent" : "msg-received";

    // Fetch sender's DP
    const userRef = ref(db, "users/" + msg.userId);
    onValue(userRef, snap => {
      const userData = snap.val();
      const dpURL = (userData?.dp || "default_dp.png") + "?t=" + new Date().getTime();
      div.innerHTML = `<img src="${dpURL}" class="msg-dp"><span>${msg.text}</span>`;
    });

    messagesBox.appendChild(div);
  });
  messagesBox.scrollTop = messagesBox.scrollHeight;
});

// Send message
sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (!text) return;

  push(msgRef, { text, userId: currentUserId, time: Date.now() });
  messageInput.value = "";
};

// Optional: Logout button
if (logoutBtn) {
  logoutBtn.onclick = () => signOut(auth).then(() => window.location.href = "login.html");
}
