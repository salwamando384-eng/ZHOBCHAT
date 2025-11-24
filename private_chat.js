// private_chat.js
import { auth, db } from "./firebase_config.js";
import { ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

function param(name) {
  const p = new URLSearchParams(location.search);
  return p.get(name);
}

let me, other, room;

onAuthStateChanged(auth, async user => {
  if (!user) { location.href = "login.html"; return; }
  me = user.uid;
  other = param("uid");
  if (!other) { location.href = "users.html"; return; }
  room = me < other ? `${me}_${other}` : `${other}_${me}`;

  // show other info
  const otherSnap = await get(ref(db, "users/" + other));
  if (otherSnap.exists()) {
    const d = otherSnap.val();
    document.getElementById("privateDp").src = d.dp || "default_dp.png";
    document.getElementById("privateName").textContent = d.name || "User";
  }

  // load messages
  onChildAdded(ref(db, "private_messages/" + room), snap => {
    const m = snap.val();
    if (!m) return;
    const el = document.createElement("div");
    el.className = "message-row " + (m.uid === me ? "my-msg" : "other-msg");
    el.innerHTML = `<img src="${m.dp || 'default_dp.png'}" class="msg-dp"><div class="msg-bubble">${m.text}</div>`;
    document.getElementById("privateMessages").appendChild(el);
    document.getElementById("privateMessages").scrollTop = document.getElementById("privateMessages").scrollHeight;
  });
});

document.getElementById("privateSendBtn").onclick = async () => {
  const t = document.getElementById("privateMessageInput").value.trim();
  if (!t) return;
  const profileSnap = await get(ref(db, "users/" + (await auth.currentUser).uid));
  const dp = profileSnap.exists() && profileSnap.val().dp ? profileSnap.val().dp : "default_dp.png";
  await push(ref(db, "private_messages/" + room), { uid: me, text: t, dp, time: Date.now() });
  document.getElementById("privateMessageInput").value = "";
};
