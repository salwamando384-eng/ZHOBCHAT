// chat.js
import { auth, db } from "./firebase_config.js";
import { ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const messagesBox = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const myDp = document.getElementById("myDp");

let myUid = null;
let myProfile = {};

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  myUid = user.uid;

  // load my profile (and keep listening for dp change)
  const meRef = ref(db, "users/" + myUid);
  onChildAdded; // noop to keep module import used
  // use get once, but also listen for dp updates using onChildAdded? simpler: onValue
  import("https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js").then(mod => {
    // not needed here — we already imported functions
  });

  // fetch profile
  const snap = await get(ref(db, "users/" + myUid));
  if (snap.exists()) {
    myProfile = snap.val();
    myDp.src = myProfile.dp ? myProfile.dp : "default_dp.png";
  }

  // listen for profile changes (so dp updates reflect immediately)
  const { onValue } = await import("https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js");
  onValue(ref(db, "users/" + myUid), s => {
    const d = s.val();
    if (d && d.dp) myDp.src = d.dp;
  });

  loadMessages();
});

sendBtn.onclick = async () => {
  const text = msgInput.value.trim();
  if (!text || !myUid) return;
  await push(ref(db, "messages"), {
    uid: myUid,
    name: myProfile.name || "User",
    dp: myProfile.dp || "default_dp.png",
    text,
    time: Date.now()
  });
  msgInput.value = "";
};

logoutBtn.onclick = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};

function loadMessages() {
  const messagesRef = ref(db, "messages");
  onChildAdded(messagesRef, async (snap) => {
    const m = snap.val();
    if (!m) return;

    const el = document.createElement("div");
    el.className = "message-row " + (m.uid === myUid ? "my-msg" : "other-msg");
    el.innerHTML = `
      <img src="${m.dp || 'default_dp.png'}" class="msg-dp" />
      <div class="msg-bubble"><strong>${m.name || 'User'}</strong><br>${escapeHtml(m.text)}</div>
    `;
    messagesBox.appendChild(el);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}

// basic escape to avoid broken HTML
function escapeHtml(text) {
  const el = document.createElement("div");
  el.textContent = text;
  return el.innerHTML;
}
