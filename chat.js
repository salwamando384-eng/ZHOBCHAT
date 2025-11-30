// chat.js
import { auth, db } from "./firebase_config.js";
import { ref, push, onChildAdded, get, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// elements
const messagesBox = document.getElementById("messages");
const messageInput = document.getElementById("messageInput") || document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const chatDp = document.getElementById("chatDp");
const logoutBtn = document.getElementById("logoutBtn");
const deleteAllBtn = document.getElementById("deleteAllBtn"); // optional owner-only

let currentUid = null;
let myProfile = { name: "User", dp: "default_dp.png" };

// Owner UID constant (if set in firebase_config)
import { OWNER_UID } from "./firebase_config.js";

// require login and load profile
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUid = user.uid;

  // load my DB profile
  const snap = await get(ref(db, "users/" + currentUid));
  if (snap.exists()) {
    const data = snap.val();
    myProfile.name = data.name || myProfile.name;
    myProfile.dp = data.dp || myProfile.dp;
    if (chatDp) chatDp.src = myProfile.dp;
  }

  // show owner controls if owner
  if (typeof OWNER_UID !== "undefined" && currentUid === OWNER_UID) {
    if (deleteAllBtn) deleteAllBtn.style.display = "inline-block";
  }
});

// send message
sendBtn && sendBtn.addEventListener("click", async () => {
  const text = (messageInput?.value || "").trim();
  if (!text) return;
  sendBtn.disabled = true;
  try {
    await push(ref(db, "messages"), {
      uid: currentUid,
      name: myProfile.name,
      dp: myProfile.dp,
      text: text,
      time: Date.now()
    });
    messageInput.value = "";
  } catch (err) {
    console.error(err);
    alert("Send failed: " + (err.message || ""));
  } finally {
    sendBtn.disabled = false;
  }
});

// load messages realtime
onChildAdded(ref(db, "messages"), (snap) => {
  const msg = snap.val();
  const div = document.createElement("div");
  div.className = "message-row";
  div.innerHTML = `
    <img src="${msg.dp || 'default_dp.png'}" class="msg-dp" />
    <div class="msg-bubble"><strong>${escapeHtml(msg.name || 'User')}</strong><br>${escapeHtml(msg.text)}</div>
  `;
  messagesBox && messagesBox.appendChild(div);
  messagesBox && (messagesBox.scrollTop = messagesBox.scrollHeight);
});

// logout
logoutBtn && logoutBtn.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "login.html";
});

// owner delete all messages
if (deleteAllBtn) {
  deleteAllBtn.addEventListener("click", async () => {
    if (!confirm("Delete ALL messages?")) return;
    try {
      await remove(ref(db, "messages"));
      alert("All messages deleted");
      messagesBox.innerHTML = "";
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  });
}

function escapeHtml(s) {
  if (!s) return "";
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
