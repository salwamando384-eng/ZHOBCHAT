// private_chat.js
import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { push, ref, onChildAdded } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const otherUid = localStorage.getItem("chatUser");
const pMessages = document.getElementById("pMessages");
const pInput = document.getElementById("pMessageInput");
const pSend = document.getElementById("pSendBtn");
const chatWith = document.getElementById("chatWith");

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  const me = user.uid;
  chatWith.innerText = "Chat with " + (otherUid || "User");

  // load messages between me and otherUid
  const room = [me, otherUid].sort().join("_"); // consistent room id
  onChildAdded(ref(db, "private_messages/" + room), (snap) => {
    const m = snap.val();
    const div = document.createElement("div");
    div.className = "msg-row";
    div.innerHTML = `<div class="msg-bubble"><b>${m.from===me?'You':m.fromName||'User'}</b><p>${m.text}</p></div>`;
    pMessages.appendChild(div);
    pMessages.scrollTop = pMessages.scrollHeight;
  });

  pSend.onclick = async () => {
    const t = pInput.value.trim();
    if (!t) return;
    await push(ref(db, "private_messages/" + room), {
      from: me,
      text: t,
      time: Date.now()
    });
    pInput.value = "";
  };
});
