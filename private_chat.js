// private_chat.js
import { auth, db } from "./firebase_config.js";
import { ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const privateMessagesEl = document.getElementById("privateMessages");
const privateInput = document.getElementById("privateInput");
const privateSend = document.getElementById("privateSend");

let currentUid = null;
let otherUid = localStorage.getItem("chatUser"); // set when clicking user

if (!otherUid) {
  alert("No chat user selected.");
  location.href = "chat.html";
}

onAuthStateChanged(auth, async user => {
  if (!user) { location.href = "login.html"; return; }
  currentUid = user.uid;
  startPrivateChat();
});

function chatId(a,b){
  return [a,b].sort().join("_");
}

async function startPrivateChat(){
  const id = chatId(currentUid, otherUid);
  const chatRef = ref(db, `private_chats/${id}`);

  // load existing
  onChildAdded(chatRef, snap => {
    const m = snap.val();
    const div = document.createElement("div");
    div.className = m.from === currentUid ? "msg-row my-msg" : "msg-row";
    div.innerHTML = `<div class="msg-bubble">${m.text}</div>`;
    privateMessagesEl.appendChild(div);
    privateMessagesEl.scrollTop = privateMessagesEl.scrollHeight;
  });

  privateSend.onclick = async () => {
    const text = privateInput.value.trim();
    if (!text) return;
    await push(chatRef, { from: currentUid, to: otherUid, text, time: Date.now() });
    privateInput.value = "";
  };
}
