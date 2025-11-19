// chat.js
import { auth, db, storage } from "./firebase_config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref as dbRef, push, onChildAdded, get, set, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const topDp = document.getElementById("topDp");
const topName = document.getElementById("topName");
const topStatus = document.getElementById("topStatus");
const toProfile = document.getElementById("toProfile");
const logoutBtn = document.getElementById("logoutBtn");

const usersList = document.getElementById("usersList");
const groupItem = document.getElementById("groupItem");

const messagesDiv = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const attach = document.getElementById("attach");
const attachBtn = document.getElementById("attachBtn");

let uid, myProfile = {};
let currentChat = { type: "group", id: "ZHOBCHAT" }; // or {type:'private', id: chatId, uid:otherUid}

function getChatId(a,b){
  return [a,b].sort().join("_");
}

onAuthStateChanged(auth, async (user) => {
  if (!user) { location.href = "index.html"; return; }
  uid = user.uid;

  // load my profile
  const snap = await get(dbRef(db, `users/${uid}`));
  if (snap.exists()) myProfile = snap.val();

  topDp.src = myProfile.dp ? myProfile.dp + "?v=" + Date.now() : "default_dp.png";
  topName.textContent = "ZHOBCHAT";
  topStatus.textContent = myProfile.name ? `Logged in as ${myProfile.name}` : "Welcome";

  // mark online
  await set(dbRef(db, `users/${uid}/online`), true);
  await set(dbRef(db, `users/${uid}/lastSeen`), Date.now());

  // load users list
  const usersSnap = await get(dbRef(db, "users"));
  usersList.innerHTML = "";
  if (usersSnap.exists()){
    const users = usersSnap.val();
    Object.keys(users).forEach(u => {
      if (u === uid) return; // don't show self
      const user = users[u];
      const div = document.createElement("div");
      div.className = "user-item";
      div.dataset.uid = u;
      div.innerHTML = `
        <img src="${user.dp ? user.dp + '?v=' + Date.now() : 'default_dp.png'}" class="user-dp">
        <div>
          <div class="user-name">${escapeHtml(user.name || "Unknown")}</div>
          <div class="user-about">${escapeHtml(user.about || user.city || '')}</div>
        </div>
      `;
      div.onclick = () => openPrivateChat(u, user);
      usersList.appendChild(div);
    });
  }

  // open default group
  openGroupChat();

});

// open group
function openGroupChat(){
  currentChat = { type: "group", id: "ZHOBCHAT" };
  messagesDiv.innerHTML = "";
  const q = query(dbRef(db, "messages/group"), orderByChild("time"), limitToLast(200));
  // listen
  onChildAdded(q, (snap) => {
    appendMessage(snap.val(), false);
  });
}

// open private
function openPrivateChat(otherUid, otherUser){
  currentChat = { type: "private", id: getChatId(uid, otherUid), uid: otherUid };
  messagesDiv.innerHTML = "";
  topStatus.textContent = otherUser.name || "Private";
  const q = query(dbRef(db, `messages/private/${currentChat.id}`), orderByChild("time"), limitToLast(200));
  onChildAdded(q, (snap) => {
    appendMessage(snap.val(), true);
  });
}

// send message
sendBtn.onclick = async () => {
  if (!myProfile.name) { alert("Please fill your profile first."); return; }
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

  if (currentChat.type === "group") {
    await push(dbRef(db, "messages/group"), msgObj);
  } else {
    await push(dbRef(db, `messages/private/${currentChat.id}`), msgObj);
  }

  msgInput.value = "";
  attach.value = "";
};

// attach button
attachBtn.onclick = () => attach.click();

// append message (both group & private)
function appendMessage(m, isPrivate){
  const div = document.createElement("div");
  div.classList.add("msg-row");

  const when = new Date(m.time);
  const timeStr = when.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });

  div.innerHTML = `
    <img class="msg-dp" src="${m.dp ? m.dp + '?v=' + Date.now() : 'default_dp.png'}">
    <div class="bubble">
      <div class="meta"><b>${escapeHtml(m.name || "Unknown")}</b> <span class="muted">${timeStr}</span></div>
      ${m.text ? `<div class="text">${escapeHtml(m.text)}</div>` : ""}
      ${m.image ? `<div class="imgwrap"><img src="${m.image + '?v=' + Date.now()}" class="msg-img"></div>` : ""}
    </div>
  `;

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// profile & logout handlers
toProfile.onclick = () => window.location.href = "profile.html";
logoutBtn.onclick = async () => {
  await set(dbRef(db, `users/${uid}/online`), false);
  await set(dbRef(db, `users/${uid}/lastSeen`), Date.now());
  await signOut(auth);
  location.href = "index.html";
};

function escapeHtml(text) {
  if (!text) return "";
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
