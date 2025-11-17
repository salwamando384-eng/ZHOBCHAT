import { auth, db } from "./firebase_config.js";
import { ref as dbRef, push, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// DOM Elements
const messagesBox = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const chatDp = document.getElementById("chatDp");

// Auth state
onAuthStateChanged(auth, (user) => {
  if (!user) return window.location.href = "login.html";

  const userRef = dbRef(db, "users/" + user.uid);

  // Real-time listener for user DP
  onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (data && data.dp) chatDp.src = data.dp;
  });
});

// Messages reference
const msgRef = dbRef(db, "messages");

// Load messages real-time
onValue(msgRef, (snapshot) => {
  messagesBox.innerHTML = "";

  snapshot.forEach((child) => {
    const msg = child.val();

    const div = document.createElement("div");
    div.className = "msg";

    // Display DP if exists
    if (msg.userId) {
      const userRef = dbRef(db, "users/" + msg.userId);
      onValue(userRef, (userSnap) => {
        const userData = userSnap.val();
        let dpURL = userData?.dp || "default_dp.png";

        div.innerHTML = `<img src="${dpURL}" class="msg-dp"><span>${msg.text}</span>`;
      });
    } else {
      div.textContent = msg.text;
    }

    messagesBox.appendChild(div);
  });

  messagesBox.scrollTop = messagesBox.scrollHeight;
});

// Send message
sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (!text) return;

  const user = auth.currentUser;
  push(msgRef, {
    text: text,
    time: Date.now(),
    userId: user.uid
  });

  messageInput.value = "";
};

// Logout
logoutBtn.onclick = () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};
