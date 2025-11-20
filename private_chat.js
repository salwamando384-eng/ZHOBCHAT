// private_chat.js
import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref as dbRef, onChildAdded, push, query, orderByChild } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const messagesDiv = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const pcDp = document.getElementById("pcDp");
const pcName = document.getElementById("pcName");

let uid, otherUid, chatId;

// get otherUid from query param ?uid=OTHER_UID
const params = new URLSearchParams(location.search);
otherUid = params.get("uid");

function makeChatId(a,b){ return [a,b].sort().join("_"); }

onAuthStateChanged(auth, async user=>{
  if(!user){ location.href="index.html"; return; }
  uid = user.uid;
  if(!otherUid){ pcName.textContent = "No user"; return; }
  chatId = makeChatId(uid, otherUid);

  // load other user info
  const snap = await (await fetch(`/users.json`)).json().catch(()=>null);
  // fallback: attempt to listen in DB (simpler: load dp/name from DB)
  const otherSnap = await (await import("https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js")).get(dbRef(db, `users/${otherUid}`)).catch(()=>null);
  if(otherSnap && otherSnap.exists()){
    const u = otherSnap.val();
    pcName.textContent = u.name || 'User';
    pcDp.src = u.dp || 'default_dp.png';
  }

  const q = query(dbRef(db, `messages/private/${chatId}`), orderByChild("time"));
  onChildAdded(q, snap=>{
    const m = snap.val();
    appendMessage(m);
  });
});

sendBtn.onclick = async ()=>{
  const text = msgInput.value.trim();
  if(!text) return;
  await push(dbRef(db, `messages/private/${chatId}`), { uid, name: "You", text, time: Date.now() });
  msgInput.value="";
};

function appendMessage(m){
  const div = document.createElement("div");
  div.className = "msg-row";
  div.innerHTML = `<img class="msg-dp" src="${m.dp || 'default_dp.png'}"><div class="bubble"><div class="meta"><b>${m.name||'User'}</b> <span class="muted">${new Date(m.time).toLocaleTimeString()}</span></div>${m.text?`<div class="text">${m.text}</div>`:""}</div>`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
