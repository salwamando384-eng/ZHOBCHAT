import { auth, db } from "./firebase_config.js";
import { ref as dbRef, push, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const messagesBox = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, (user) => {
  if (!user) return window.location.href = "login.html";
  const currentUserId = user.uid;

  // Load messages real-time
  const msgRef = dbRef(db, "messages");
  onValue(msgRef, (snapshot) => {
    messagesBox.innerHTML = "";

    snapshot.forEach((child) => {
      const msg = child.val();

      const div = document.createElement("div");
      div.className = "msg";

      if (msg.userId) {
        const userRef = dbRef(db, "users/" + msg.userId);
        onValue(userRef, (userSnap) => {
          const userData = userSnap.val();
          const dpURL = (userData?.dp || "default_dp.png") + "?t=" + new Date().getTime();
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

    push(dbRef(db, "messages"), {
      text,
      time: Date.now(),
      userId: currentUserId
    });

    messageInput.value = "";
  };

  // Logout
  logoutBtn.onclick = () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  };
});
