import { auth, db } from "./firebase_config.js";
import { ref as dbRef, push, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// DOM Elements
const privateMessagesBox = document.getElementById("privateMessages");
const privateMessageInput = document.getElementById("privateMessageInput");
const privateSendBtn = document.getElementById("privateSendBtn");

// Assuming you have selectedChatUserId to chat with
let selectedChatUserId = ""; // set this dynamically based on chat selection

onAuthStateChanged(auth, (user) => {
  if (!user) return window.location.href = "login.html";
  const currentUserId = user.uid;

  // Load private messages real-time
  const privateMsgRef = dbRef(db, "private_messages/" + currentUserId + "/" + selectedChatUserId);

  onValue(privateMsgRef, (snapshot) => {
    privateMessagesBox.innerHTML = "";

    snapshot.forEach((child) => {
      const msg = child.val();

      const div = document.createElement("div");
      div.className = msg.senderId === currentUserId ? "msg-sent" : "msg-received";

      // Get sender DP
      const senderRef = dbRef(db, "users/" + msg.senderId);
      onValue(senderRef, (senderSnap) => {
        const senderData = senderSnap.val();
        let dpURL = senderData?.dp || "default_dp.png";

        div.innerHTML = `<img src="${dpURL}" class="msg-dp"><span>${msg.text}</span>`;
      });

      privateMessagesBox.appendChild(div);
    });

    privateMessagesBox.scrollTop = privateMessagesBox.scrollHeight;
  });

  // Send private message
  privateSendBtn.onclick = () => {
    const text = privateMessageInput.value.trim();
    if (!text) return;

    push(dbRef(db, "private_messages/" + currentUserId + "/" + selectedChatUserId), {
      text: text,
      time: Date.now(),
      senderId: currentUserId
    });

    // Mirror message in recipient's node
    push(dbRef(db, "private_messages/" + selectedChatUserId + "/" + currentUserId), {
      text: text,
      time: Date.now(),
      senderId: currentUserId
    });

    privateMessageInput.value = "";
  };
});
