// private_chat.js
import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, push, onChildAdded, get, query, orderByChild } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const privateMessagesArea = document.getElementById("privateMessagesArea");
const privateSendForm = document.getElementById("privateSendForm");
const privateMessageInput = document.getElementById("privateMessageInput");
const backBtn = document.getElementById("backBtn");

const chatWith = localStorage.getItem("chatWith");
let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  currentUser = user;

  if (!chatWith) {
    privateMessagesArea.innerHTML = "<p class='muted'>کوئی یوزر منتخب نہیں۔</p>";
    return;
  }

  // load existing private messages between the two users (both directions)
  privateMessagesArea.innerHTML = "";
  const msgsRef = ref(db, "privateMessages");
  // We'll listen to all and filter client-side for simplicity (could be optimized)
  onChildAdded(msgsRef, (snap) => {
    const m = snap.val();
    if ((m.fromUid === currentUser.uid && m.toUid === chatWith) || (m.fromUid === chatWith && m.toUid === currentUser.uid)) {
      const div = document.createElement("div");
      div.className = "messageItem";
      div.innerHTML = `<strong>${escapeHtml(m.fromName||m.fromEmail)}</strong>: ${escapeHtml(m.text)} <span class="mTime">${escapeHtml(m.time)}</span>`;
      privateMessagesArea.appendChild(div);
      privateMessagesArea.scrollTop = privateMessagesArea.scrollHeight;
    }
  });
});

privateSendForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const txt = privateMessageInput.value.trim();
  if (!txt || !currentUser) return;
  await push(ref(db, "privateMessages"), {
    fromUid: currentUser.uid,
    fromName: currentUser.displayName || currentUser.email,
    fromEmail: currentUser.email,
    toUid: chatWith,
    text: txt,
    time: new Date().toLocaleTimeString()
  });
  privateMessageInput.value = "";
});

backBtn.addEventListener("click", ()=> { window.location.href = "chat.html"; });

function escapeHtml(s=""){ return (s+"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
