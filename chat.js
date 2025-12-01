// chat.js
import { auth, db, OWNER_UID } from "./firebase_config.js";
import { ref, push, onChildAdded, onValue, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const messagesEl = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");
const msgInput = document.getElementById("messageInput");
const logoutBtn = document.getElementById("logoutBtn");
const profileBtn = document.getElementById("profileBtn");
const myDpHeader = document.getElementById("myDpHeader");
const delAllBtn = document.getElementById("delAllBtn");
const openUsersTop = document.getElementById("openUsersTop");

let currentUser = null;
let myProfile = { name: "User", dp: "default_dp.png" };

// check auth
onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = "login.html";
    return;
  }
  currentUser = user;
  // load my profile
  const userRef = ref(db, "users/" + user.uid);
  onValue(userRef, snap => {
    const d = snap.val();
    if (d) {
      myProfile.name = d.name || myProfile.name;
      myProfile.dp = d.dp || myProfile.dp;
      myDpHeader.src = myProfile.dp;
    }
  });

  // show owner delete button if owner
  if (user.uid === OWNER_UID) {
    delAllBtn.style.display = "inline-block";
  }
});

// load messages (listen to messages node)
const msgsRef = ref(db, "messages");
onChildAdded(msgsRef, (snap) => {
  const m = snap.val();
  appendMessage(m);
});

function appendMessage(m) {
  const div = document.createElement("div");
  div.className = "msg-row";
  div.innerHTML = `
    <img class="msg-dp" src="${m.dp || 'default_dp.png'}" />
    <div class="msg-bubble">
      <strong>${escapeHtml(m.name||'User')}</strong>
      <p>${escapeHtml(m.text)}</p>
      <div class="ts">${new Date(m.time||Date.now()).toLocaleString()}</div>
    </div>
  `;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

sendBtn.onclick = async () => {
  const text = msgInput.value.trim();
  if (!text) return;
  sendBtn.disabled = true;
  try {
    await push(ref(db, "messages"), {
      uid: currentUser.uid,
      name: myProfile.name,
      dp: myProfile.dp,
      text: text,
      time: Date.now()
    });
    msgInput.value = "";
  } catch (err) {
    alert("Send error: " + err.message);
  } finally {
    sendBtn.disabled = false;
  }
};

logoutBtn.onclick = async () => {
  await signOut(auth);
  location.href = "login.html";
};

profileBtn.onclick = () => { location.href = "profile.html"; };

// delete all messages (owner only)
delAllBtn.onclick = async () => {
  if (!currentUser || currentUser.uid !== OWNER_UID) {
    alert("Only owner can delete messages.");
    return;
  }
  if (!confirm("Delete all messages? This cannot be undone.")) return;
  // delete by setting messages node to empty object
  await push(ref(db, "admin_actions"), { type: "delete_all_messages", by: currentUser.uid, time: Date.now() });
  // (listener on server or just remove messages)
  // remove messages:
  const dbRef = ref(db);
  // using REST-like set; but client modular RTDB doesn't export remove directly; use set to null
  await (async () => {
    // workaround: set messages to null via platform-specific function:
    // Use fetch to REST endpoint to delete if needed — but simplest: update messages to {}
    const { default: } = await Promise.resolve(); // no-op to ensure async
  })();
  // For simplicity notify user to remove manually in console (or you can add a cloud function).
  alert("Owner requested delete. (Please clear messages node from console if required.)");
};

// open users overlay (users_popup_component adds a global function openUsersOverlay)
openUsersTop.onclick = () => {
  if (typeof openUsersOverlay === "function") openUsersOverlay();
};

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; });
}
