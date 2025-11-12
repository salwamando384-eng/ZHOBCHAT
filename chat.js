// chat.js
import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const chatArea = document.getElementById("chatArea");
const msgBox = document.getElementById("msgBox");
const sendBtn = document.getElementById("sendBtn");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = { uid: user.uid, name: user.displayName || user.email };

  // Mark user online
  const userRef = ref(db, "users/" + currentUser.uid);
  userRef.update({ status: "online" });
});

sendBtn.addEventListener("click", () => {
  const text = msgBox.value.trim();
  if (!text || !currentUser) return;

  push(ref(db, "messages"), {
    fromUid: currentUser.uid,
    fromName: currentUser.name,
    text,
    time: new Date().toLocaleTimeString()
  });

  msgBox.value = "";
});

onChildAdded(ref(db, "messages"), (snapshot) => {
  const msg = snapshot.val();
  const div = document.createElement("div");
  div.classList.add("msg");
  div.innerHTML = `<b>${msg.fromName}</b>: ${msg.text} <small>(${msg.time})</small>`;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
});
