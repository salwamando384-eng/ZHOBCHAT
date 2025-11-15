import { auth, db } from "./firebase_config.js";

import {
  ref,
  push,
  set,
  onChildAdded,
  onValue
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// ===============================
//   WAIT FOR USER LOGIN STATUS
// ===============================
onAuthStateChanged(auth, user => {
  if (!user) {
    location.href = "login.html";
  } else {
    startChat(user.uid);
  }
});

// ===============================
//         MAIN CHAT FUNCTION
// ===============================
function startChat(uid) {
  const userRef = ref(db, "users/" + uid);

  // Load User DP in Header
  onValue(userRef, snap => {
    let data = snap.val();
    if (data && data.dp) {
      document.getElementById("chatDp").src = data.dp;
    }
  });

  const msgRef = ref(db, "messages");

  // SEND MESSAGE
  document.getElementById("sendBtn").onclick = () => {
    let msg = document.getElementById("messageInput").value.trim();

    if (msg === "") return;

    push(msgRef, {
      uid: uid,
      text: msg,
      time: Date.now()
    });

    document.getElementById("messageInput").value = "";
  };

  // LOAD ALL MESSAGES LIVE
  onChildAdded(msgRef, snap => {
    let msg = snap.val();
    let msgDiv = document.createElement("div");
    msgDiv.classList.add("message");

    // Get sender details
    onValue(ref(db, "users/" + msg.uid), u => {
      let info = u.val();

      msgDiv.innerHTML = `
        <img src="${info.dp}" class="msg-dp">
        <div class="msg-text">${msg.text}</div>
      `;

      document.getElementById("messages").appendChild(msgDiv);
    });
  });

  // LOGOUT BUTTON
  document.getElementById("logoutBtn").onclick = () => {
    signOut(auth);
  };

  // PROFILE BUTTON
  document.getElementById("profileBtn").onclick = () => {
    location.href = "profile.html";
  };
}
