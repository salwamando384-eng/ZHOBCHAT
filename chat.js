// chat.js
import { auth, db } from "./firebase_config.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  ref, onChildAdded, push, update, onValue, get, remove
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const messagesArea = document.getElementById("messagesArea");
const sendForm = document.getElementById("sendForm");
const messageInput = document.getElementById("messageInput");
const colorInput = document.getElementById("colorInput");
const usersList = document.getElementById("usersList");
const usersToggle = document.getElementById("usersToggle");
const logoutBtn = document.getElementById("logoutBtn");
const myProfileBrief = document.getElementById("myProfileBrief");
const adminClearAll = document.getElementById("adminClearAll");
const sidebar = document.getElementById("sidebar");

let currentUser = null;
let isAdmin = false;

// helper to create message DOM
function renderMessage(key, msgObj) {
  const d = document.createElement("div");
  d.className = "messageItem";
  d.dataset.key = key;

  const name = msgObj.fromName || msgObj.fromEmail || "Unknown";
  const time = msgObj.time || "";
  const color = msgObj.color || "#000";

  const left = document.createElement("div");
  left.className = "mLeft";
  left.innerHTML = `<strong style="color:${color}">${escapeHtml(name)}</strong>: ${escapeHtml(msgObj.text)} <span class="mTime">${escapeHtml(time)}</span>`;

  d.appendChild(left);

  // admin delete button if current user is admin
  if (isAdmin) {
    const del = document.createElement("button");
    del.className = "msgDel";
    del.textContent = "Delete";
    del.onclick = async () => {
      if (!confirm("یہ پیغام حذف کریں؟")) return;
      await remove(ref(db, `messages/${key}`));
    };
    d.appendChild(del);
  }

  messagesArea.appendChild(d);
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

// basic escape
function escapeHtml(s="") {
  return (s+"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

// listen auth
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;

  // load my profile brief
  const uRef = ref(db, `users/${user.uid}`);
  onValue(uRef, (snap) => {
    const u = snap.val();
    if (!u) return;
    isAdmin = !!u.isAdmin;
    myProfileBrief.innerHTML = `<img src="${u.dp||'default_dp.png'}" class="dpSmall" /><div><b>${escapeHtml(u.name)}</b><br/><small>${escapeHtml(u.city||"")}</small></div>`;
    adminClearAll.style.display = isAdmin ? "inline-block" : "none";
  });

  // mark online
  await update(ref(db, `users/${user.uid}`), { status: "online", lastSeen: null });

  // load existing messages first (if any)
  messagesArea.innerHTML = "پیغامات لوڈ ہو رہے ہیں...";
  const msgsSnap = await get(ref(db, "messages"));
  messagesArea.innerHTML = "";
  if (!msgsSnap.exists()) {
    messagesArea.innerHTML = "<p class='muted'>کوئی پیغام نہیں ہے — پہلا پیغام آپ بھیجیں۔</p>";
  } else {
    // show existing in order
    msgsSnap.forEach((child) => {
      renderMessage(child.key, child.val());
    });
  }

  // realtime new messages
  onChildAdded(ref(db, "messages"), (snap) => {
    // if messagesArea currently shows the "no messages" line, clear it
    const noEl = messagesArea.querySelector(".muted");
    if (noEl) messagesArea.innerHTML = "";
    // avoid duplicate rendering if already present
    if (!messagesArea.querySelector(`[data-key="${snap.key}"]`)) {
      renderMessage(snap.key, snap.val());
    }
  });

  // load users list
  loadUsersList();
});

// send message
sendForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text || !currentUser) return;

  const msgObj = {
    fromUid: currentUser.uid,
    fromName: currentUser.displayName || currentUser.email,
    fromEmail: currentUser.email,
    text,
    color: colorInput.value || "#000000",
    time: new Date().toLocaleTimeString()
  };
  await push(ref(db, "messages"), msgObj);
  messageInput.value = "";
});

// users list loader
function loadUsersList() {
  const uRef = ref(db, "users");
  onValue(uRef, (snap) => {
    usersList.innerHTML = "";
    snap.forEach((child) => {
      const u = child.val();
      const uid = child.key;
      // skip self
      if (uid === (currentUser && currentUser.uid)) return;

      const div = document.createElement("div");
      div.className = "userRow";
      div.innerHTML = `<img src="${u.dp||'default_dp.png'}" class="dpSmall" />
        <div class="uInfo"><b style="color:${u.color||'#000'}">${escapeHtml(u.name||"")}</b>
        <small>${escapeHtml(u.age||"")}, ${escapeHtml(u.gender||"")}</small>
        <div class="uCity">${escapeHtml(u.city||"")}</div></div>`;

      const actions = document.createElement("div");
      actions.className = "uActions";
      const profileBtn = document.createElement("button");
      profileBtn.textContent = "Profile";
      profileBtn.onclick = () => {
        localStorage.setItem("profileView", uid);
        window.location.href = "profile.html";
      };
      const privateBtn = document.createElement("button");
      privateBtn.textContent = "Private";
      privateBtn.onclick = () => {
        localStorage.setItem("chatWith", uid);
        window.location.href = "private_chat.html";
      };
      const friendBtn = document.createElement("button");
      friendBtn.textContent = "Friend Req";
      friendBtn.onclick = async () => {
        // push friend request
        await push(ref(db, `friendRequests/${uid}`), {
          fromUid: currentUser.uid,
          fromName: currentUser.displayName || currentUser.email,
          time: new Date().toISOString()
        });
        alert("Friend request sent.");
      };

      actions.appendChild(profileBtn);
      actions.appendChild(privateBtn);
      actions.appendChild(friendBtn);
      div.appendChild(actions);
      usersList.appendChild(div);
    });
  });
}

// logout
logoutBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  await update(ref(db, `users/${currentUser.uid}`), { status: "offline", lastSeen: new Date().toISOString() });
  await signOut(auth);
});

// toggle sidebar
usersToggle.addEventListener("click", ()=> sidebar.classList.toggle("open"));

// admin clear all
adminClearAll.addEventListener("click", async () => {
  if (!isAdmin) { alert("آپ admin نہیں ہیں"); return; }
  if (!confirm("تمام پیغامات ہٹا دیں؟")) return;
  await remove(ref(db, "messages"));
  messagesArea.innerHTML = "<p class='muted'>کوئی پیغام نہیں ہے</p>";
});
