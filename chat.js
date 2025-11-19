// chat.js
import { auth, db, storage } from "./firebase_config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref as dbRef, push, onChildAdded, get, query, orderByChild, limitToLast, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const topDp = document.getElementById("topDp");
const topName = document.getElementById("topName");
const topStatus = document.getElementById("topStatus");
const toProfile = document.getElementById("toProfile");
const logoutBtn = document.getElementById("logout");

const messagesDiv = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const attach = document.getElementById("attach");
const attachBtn = document.getElementById("attachBtn");

let uid, myProfile = {};

onAuthStateChanged(auth, async (user) => {
  if (!user) { location.href = "index.html"; return; }
  uid = user.uid;

  // load my profile
  const snap = await get(dbRef(db, `users/${uid}`));
  if (snap.exists()) myProfile = snap.val();

  topDp.src = myProfile.dp ? myProfile.dp + "?v=" + Date.now() : "default_dp.png";
  topName.textContent = "ZHOBCHAT";
  topStatus.textContent = myProfile.name ? `Logged in as ${myProfile.name}` : "Welcome";

  // set online
  await set(dbRef(db, `users/${uid}/online`), true);
  await set(dbRef(db, `users/${uid}/lastSeen`), Date.now());

  // load last 100 messages
  const q = query(dbRef(db, "messages"), orderByChild("time"), limitToLast(100));
  onChildAdded(q, (snap) => {
    const m = snap.val();
    appendMessage(m);
  });

});

// Send message (text or image)
sendBtn.onclick = async () => {
  const text = msgInput.value.trim();
  if (!text && attach.files.length === 0) return;

  const msgObj = {
    uid,
    name: myProfile.name || "Unknown",
    dp: myProfile.dp || "default_dp.png",
    time: Date.now()
  };

  if (attach.files.length > 0) {
    const file = attach.files[0];
    const s = sRef(storage, `messages/${Date.now()}_${uid}.jpg`);
    await uploadBytes(s, file);
    const url = await getDownloadURL(s);
    msgObj.image = url;
  }

  if (text) msgObj.text = text;

  await push(dbRef(db, "messages"), msgObj);
  msgInput.value = "";
  attach.value = "";
};

// Attach button
attachBtn.onclick = () => attach.click();

// Append message to UI
function appendMessage(m) {
  const div = document.createElement("div");
  div.classList.add("msg");

  const when = new Date(m.time);
  const timeStr = when.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });

  div.innerHTML = `
    <img class="msg-dp" src="${m.dp ? m.dp + '?v=' + Date.now() : 'default_dp.png'}">
    <div class="bubble">
      <div class="meta"><b>${escapeHtml(m.name)}</b> <span class="muted">${timeStr}</span></div>
      ${m.text ? `<div class="text">${escapeHtml(m.text)}</div>` : ""}
      ${m.image ? `<div class="imgwrap"><img src="${m.image + '?v=' + Date.now()}" class="msg-img"></div>` : ""}
    </div>
  `;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

toProfile.onclick = () => window.location.href = "profile.html";

logoutBtn.onclick = async () => {
  await set(dbRef(db, `users/${uid}/online`), false);
  await set(dbRef(db, `users/${uid}/lastSeen`), Date.now());
  await signOut(auth);
  location.href = "index.html";
}

function escapeHtml(text) {
  if (!text) return "";
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
