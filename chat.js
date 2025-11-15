import { auth, db } from "./firebase_config.js";

import {
  ref,
  push,
  onChildAdded,
  onValue
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const msgInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const chatDp = document.getElementById("chatDp");

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Load DP
  onValue(ref(db, "users/" + user.uid), (snap) => {
    const data = snap.val();
    chatDp.src = data.dp;
  });

  // Load messages
  const msgRef = ref(db, "messages");

  onChildAdded(msgRef, (snap) => {
    const m = snap.val();

    onValue(ref(db, "users/" + m.uid), (uSnap) => {
      let dp = uSnap.val().dp;

      messages.innerHTML += `
        <div class="msg">
          <img src="${dp}" class="msg-dp">
          <span>${m.text}</span>
        </div>
      `;
    });
  });

  // Send message
  sendBtn.onclick = () => {
    if (msgInput.value === "") return;

    push(ref(db, "messages"), {
      uid: user.uid,
      text: msgInput.value
    });

    msgInput.value = "";
  };
});

// Logout
logoutBtn.onclick = () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};
