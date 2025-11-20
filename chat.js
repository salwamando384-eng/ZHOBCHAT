// chat.js (group + private + user list + dp cache-bust)
import { auth, db, storage } from "./firebase_config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref as dbRef, push, onChildAdded, get, set, query, orderByChild, limitToLast, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const topDp = document.getElementById("topDp");
const topName = document.getElementById("topName");
const topStatus = document.getElementById("topStatus");
const toProfile = document.getElementById("toProfile");
const logoutBtn = document.getElementById("logout");

const usersList = document.getElementById("usersList");
const groupItem = document.getElementById("groupItem");

const messagesDiv = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const attach = document.getElementById("attach");
const attachBtn = document.getElementById("attachBtn");

let uid, myProfile = {};
let currentChat = { type: "group", id: "group" };

function chatId(a,b){ return [a,b].sort().join("_"); }

onAuthStateChanged(auth, async user=>{
  if(!user){ location.href="index.html"; return; }
  uid = user.uid;

  const snap = await get(dbRef(db, `users/${uid}`));
  if(snap.exists()) myProfile = snap.val();

  topDp.src = myProfile.dp ? myProfile.dp + "?v=" + Date.now() : "default_dp.png";
  topName.textContent = myProfile.name || "ZHOBCHAT";
  topStatus.textContent = myProfile.name ? `Logged in as ${myProfile.name}` : "Welcome";

  await set(dbRef(db, `users/${uid}/online`), true);
  await set(dbRef(db, `users/${uid}/lastSeen`), Date.now());

  loadUsers();
  openGroup();
});

// load users
async function loadUsers(){
  const snap = await get(dbRef(db, "users"));
  usersList.innerHTML = "";
  if(!snap.exists()) return;
  const users = snap.val();
  Object.keys(users).forEach(u=>{
    if(u === uid) return;
    const user = users[u];
    const div = document.createElement("div");
    div.className = "user-item";
    div.dataset.uid = u;
    div.innerHTML = `
      <img src="${user.dp ? user.dp + '?v=' + Date.now() : 'default_dp.png'}" class="user-dp">
      <div>
        <div class="user-name">${user.name || 'Unknown'}</div>
        <div class="user-about">${user.about || user.city || ''}</div>
      </div>
    `;
    div.onclick = ()=> openPrivate(u, user);
    usersList.appendChild(div);
  });
}

// open group
function openGroup(){
  currentChat = { type: "group", id: "group" };
  messagesDiv.innerHTML = "";
  const q = query(dbRef(db, "messages/group"), orderByChild("time"), limitToLast(200));
  onChildAdded(q, snap=>{
    appendMessage(snap.val());
  });
}

// open private
function openPrivate(otherUid, otherUser){
  currentChat = { type: "private", id: chatId(uid, otherUid), other: otherUid };
  messagesDiv.innerHTML = "";
  const q = query(dbRef(db, `messages/private/${currentChat.id}`), orderByChild("time"), limitToLast(200));
  onChildAdded(q, snap=>{
    appendMessage(snap.val());
  });
}

// send
sendBtn.onclick = async ()=>{
  const text = msgInput.value.trim();
  if(!text && attach.files.length ===0) return;
  const msgObj = { uid, name: myProfile.name || "Unknown", dp: myProfile.dp || "default_dp.png", time: Date.now() };
  if(text) msgObj.text = text;
  if(attach.files.length>0){
    const file = attach.files[0];
    const s = sRef(storage, `messages/${Date.now()}_${uid}.jpg`);
    await uploadBytes(s, file);
    msgObj.image = await getDownloadURL(s);
  }
  if(currentChat.type === "group"){
    await push(dbRef(db, "messages/group"), msgObj);
  } else {
    await push(dbRef(db, `messages/private/${currentChat.id}`), msgObj);
  }
  msgInput.value=""; attach.value="";
};

attachBtn.onclick = ()=> attach.click();

function appendMessage(m){
  const div = document.createElement("div");
  div.classList.add("msg-row");
  const when = new Date(m.time);
  const timeStr = when.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
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

function escapeHtml(t){ if(!t) return ""; return t.toString().replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }

toProfile.onclick = ()=> window.location.href = "profile.html";
logoutBtn.onclick = async ()=> {
  await set(dbRef(db, `users/${uid}/online`), false);
  await set(dbRef(db, `users/${uid}/lastSeen`), Date.now());
  await signOut(auth);
  location.href = "index.html";
};
