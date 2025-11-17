// chat.js
import { auth, db } from "./firebase_config.js";
import { ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

auth.onAuthStateChanged(async user => {
  if (!user) { location.href = "login.html"; return; }
  const uid = user.uid;

  // load header dp
  const userRef = ref(db, "users/" + uid);
  const snap = await get(userRef);
  if (snap.exists() && snap.val().dp) document.getElementById("chatDp").src = snap.val().dp;

  loadMessages(uid);
});

const sendBtn = document.getElementById("sendBtn");
const msgInput = document.getElementById("messageInput");
const messagesBox = document.getElementById("messages");

sendBtn.onclick = async () => {
  const text = msgInput.value.trim();
  if (!text) return;
  const user = auth.currentUser;
  await push(ref(db, "messages"), { uid: user.uid, text, time: Date.now() });
  msgInput.value = "";
};

function loadMessages(currentUid) {
  const msgRef = ref(db, "messages");
  onChildAdded(msgRef, async snap => {
    const m = snap.val();
    if (!m) return;

    const userRef = ref(db, "users/" + m.uid);
    const u = await get(userRef);
    const dp = u.exists() && u.val().dp ? u.val().dp : "default_dp.png";
    const name = u.exists() && u.val().name ? u.val().name : "User";

    const row = document.createElement("div");
    row.className = "message-row " + (m.uid === currentUid ? "my-msg" : "other-msg");
    row.innerHTML = `<img src="${dp}" class="msg-dp"><div class="msg-bubble"><strong>${name}</strong><br>${m.text}</div>`;
    messagesBox.appendChild(row);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}

document.getElementById("profileBtn").onclick = () => { location.href = "profile.html"; };
document.getElementById("logoutBtn").onclick = async () => { await auth.signOut(); location.href = "login.html"; };
