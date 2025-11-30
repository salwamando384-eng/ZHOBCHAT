// private_chat.js
import { auth, db } from "./firebase_config.js";
import { ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const messagesBox = document.getElementById("messages");
const inp = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let meUid = null;
let otherUid = localStorage.getItem("chatUser") || null;
let myProfile = { name: "You", dp: "default_dp.png" };

onAuthStateChanged(auth, async (u) => {
  if (!u) return window.location.href = "login.html";
  meUid = u.uid;
  const snap = await get(ref(db, "users/" + meUid));
  if (snap.exists()) {
    const d = snap.val();
    myProfile.name = d.name || myProfile.name;
    myProfile.dp = d.dp || myProfile.dp;
  }
  loadPrivateMessages();
});

function chatPath(a, b) {
  // deterministic path for 1:1 chat: "privateChats/uid1_uid2" sorted
  const arr = [a, b].sort();
  return `privateChats/${arr[0]}_${arr[1]}`;
}

function loadPrivateMessages() {
  if (!meUid || !otherUid) return;
  const p = chatPath(meUid, otherUid);
  onChildAdded(ref(db, p), (snap) => {
    const m = snap.val();
    const el = document.createElement("div");
    el.className = (m.from === meUid) ? "my-msg" : "other-msg";
    el.innerHTML = `<img src="${m.dp}" class="msg-dp" /><div class="msg-bubble"><b>${m.name}</b><br>${m.text}</div>`;
    messagesBox.appendChild(el);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}

sendBtn && sendBtn.addEventListener("click", async () => {
  const text = (inp.value || "").trim();
  if (!text) return;
  const p = chatPath(meUid, otherUid);
  await push(ref(db, p), { from: meUid, name: myProfile.name, dp: myProfile.dp, text, time: Date.now() });
  inp.value = "";
});
