// private_chat.js
import { auth, db } from "./firebase_config.js";
import { ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

function getParam(name) {
  const params = new URLSearchParams(location.search);
  return params.get(name);
}

auth.onAuthStateChanged(async user => {
  if (!user) { location.href = "login.html"; return; }
  const me = user.uid;
  const other = getParam("uid");
  if (!other) { alert("No user specified"); location.href = "users.html"; return; }

  // deterministic room id
  const room = me < other ? `${me}_${other}` : `${other}_${me}`;

  // load other user profile
  const otherRef = ref(db, "users/" + other);
  const oSnap = await get(otherRef);
  if (oSnap.exists()) {
    const d = oSnap.val();
    document.getElementById("privateDp").src = d.dp ? d.dp : "default_dp.png";
    document.getElementById("privateName").textContent = d.name ? d.name : "User";
  }

  // load messages
  const roomRef = ref(db, "private_messages/" + room);
  onChildAdded(roomRef, async snap => {
    const m = snap.val();
    if (!m) return;
    const row = document.createElement("div");
    row.className = "message-row " + (m.uid === me ? "my-msg" : "other-msg");
    // show dp of sender (optional: use owner's dp)
    const uRef = ref(db, "users/" + m.uid);
    const uSnap = await get(uRef);
    const dp = uSnap.exists() && uSnap.val().dp ? uSnap.val().dp : "default_dp.png";
    row.innerHTML = `<img src="${dp}" class="msg-dp"><div class="msg-bubble">${m.text}</div>`;
    document.getElementById("privateMessages").appendChild(row);
    document.getElementById("privateMessages").scrollTop = document.getElementById("privateMessages").scrollHeight;
  });

  // send message
  document.getElementById("privateSendBtn").onclick = async () => {
    const t = document.getElementById("privateMessageInput").value.trim();
    if (!t) return;
    await push(ref(db, "private_messages/" + room), { uid: me, text: t, time: Date.now() });
    document.getElementById("privateMessageInput").value = "";
  };
});
