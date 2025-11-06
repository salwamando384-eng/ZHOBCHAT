// Chat.js (full working)
// Requires: firebase_config.js exporting { app, auth, db, storage }
// index.html must include elements with IDs used below.

import { auth, db } from "./firebase_config.js";
import {
  ref,
  push,
  onValue,
  set,
  remove,
  update,
  get,
  child
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

///// CONFIG //////////////////////////////////////////////////
const ADMIN_EMAIL = "admin@zhobchat.com"; // change to your admin email
const NOTIFY_SOUND_ID = "notify-sound";

///// DOM /////////////////////////////////////////////////////
const themeSelect = document.getElementById("theme-select");
const usersBtn = document.getElementById("users-btn");
const logoutBtn = document.getElementById("logout-btn");

const messageBox = document.getElementById("message-box");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

const usersPanel = document.getElementById("users-panel");

// private chat elements (from index.html)
const privateContainer = document.getElementById("private-chat");
const privateTitle = document.getElementById("private-title");
const privateBox = document.getElementById("private-box");
const privateInput = document.getElementById("private-input");
const privateSend = document.getElementById("private-send");
const closePrivate = document.getElementById("close-private");

const notifySound = document.getElementById(NOTIFY_SOUND_ID);

let currentUser = null;
let currentUserMeta = null; // read from DB (name, muted, blocked, etc)
let privateTarget = null; // { uid, name }

///// THEME INIT /////////////////////////////////////////////
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("zhob_theme", theme);
}
const savedTheme = localStorage.getItem("zhob_theme") || "light";
if (themeSelect) themeSelect.value = savedTheme;
applyTheme(savedTheme);
if (themeSelect) {
  themeSelect.addEventListener("change", (e) => applyTheme(e.target.value));
}

///// AUTH PRESENCE //////////////////////////////////////////
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // not logged in
    window.location.href = "index.html";
    return;
  }
  currentUser = user;

  // ensure user record exists & mark online
  const uRef = ref(db, `users/${user.uid}`);
  await set(uRef, {
    name: user.displayName || user.email.split("@")[0],
    email: user.email,
    online: true,
    muted: false,
    blocked: false,
    lastSeen: new Date().toISOString()
  });
  // read meta
  const snap = await get(uRef);
  currentUserMeta = snap.val() || {};

  // start listeners
  startMessageListener();
  startUsersListener();
  startPrivateListener();

  // auto-scroll to bottom after initial load (listeners handle)
});

///// LOGOUT ////////////////////////////////////////////////
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    if (!currentUser) return;
    // set offline
    await update(ref(db, `users/${currentUser.uid}`), { online: false, lastSeen: new Date().toISOString() });
    await signOut(auth);
    window.location.href = "index.html";
  });
}

///// USERS PANEL TOGGLE ////////////////////////////////////
if (usersBtn) usersBtn.addEventListener("click", () => {
  usersPanel.classList.toggle("show");
});

///// SENDING MESSAGES //////////////////////////////////////
async function canSendGlobal() {
  if (!currentUser) return false;
  // fetch latest metadata
  const snap = await get(ref(db, `users/${currentUser.uid}`));
  const meta = snap.val() || {};
  currentUserMeta = meta;
  if (meta.blocked) {
    alert("You are blocked and cannot send messages.");
    return false;
  }
  if (meta.muted) {
    alert("You are muted and cannot send messages.");
    return false;
  }
  return true;
}

if (messageForm) {
  messageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!(await canSendGlobal())) return;
    const text = (messageInput.value || "").trim();
    if (!text) return;
    const msg = {
      user: currentUser.displayName || currentUser.email.split("@")[0],
      uid: currentUser.uid,
      text,
      time: new Date().toLocaleTimeString(),
      ts: Date.now()
    };
    try {
      await push(ref(db, "messages"), msg);
      messageInput.value = "";
    } catch (err) {
      console.error("Send message error:", err);
      alert("Error sending message: " + err.message);
    }
  });
}

///// GLOBAL MESSAGE LISTENER //////////////////////////////
let messagesListenerStarted = false;
function startMessageListener() {
  if (messagesListenerStarted) return;
  messagesListenerStarted = true;
  onValue(ref(db, "messages"), (snapshot) => {
    messageBox.innerHTML = "";
    snapshot.forEach((child) => {
      const data = child.val();
      const key = child.key;
      const isMine = currentUser && data.uid === currentUser.uid;
      const msgEl = document.createElement("div");
      msgEl.className = isMine ? "my-msg" : "other-msg";
      msgEl.style.marginBottom = "6px";
      // message layout: left avatar (optional) | name : text | time on right | admin delete
      const nameSpan = `<strong style="color:var(--accent)">${escapeHtml(data.user)}</strong>`;
      const timeSpan = `<small style="color:gray;margin-left:8px">${escapeHtml(data.time)}</small>`;
      const textSpan = `<div style="margin-top:4px;white-space:pre-wrap">${escapeHtml(data.text)}</div>`;

      msgEl.innerHTML = `${nameSpan} ${timeSpan} ${textSpan}`;

      // admin delete button
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️";
        delBtn.style.marginLeft = "8px";
        delBtn.addEventListener("click", async () => {
          if (confirm("Delete this message?")) {
            await remove(ref(db, `messages/${key}`));
          }
        });
        msgEl.appendChild(delBtn);
      }

      messageBox.appendChild(msgEl);
    });
    // scroll to bottom
    messageBox.scrollTop = messageBox.scrollHeight;
  });
}

///// USERS LIST ////////////////////////////////////////////
function startUsersListener() {
  onValue(ref(db, "users"), (snapshot) => {
    usersPanel.innerHTML = ""; // header optional
    // separate online first
    const onlineHeader = document.createElement("div");
    onlineHeader.style.fontWeight = "700";
    onlineHeader.style.marginBottom = "6px";
    onlineHeader.textContent = "Online";
    usersPanel.appendChild(onlineHeader);

    snapshot.forEach((child) => {
      const u = child.val();
      if (u.online) {
        usersPanel.appendChild(makeUserItem(child.key, u));
      }
    });

    const offlineHeader = document.createElement("div");
    offlineHeader.style.fontWeight = "700";
    offlineHeader.style.margin = "8px 0 6px";
    offlineHeader.textContent = "Offline";
    usersPanel.appendChild(offlineHeader);

    snapshot.forEach((child) => {
      const u = child.val();
      if (!u.online) {
        usersPanel.appendChild(makeUserItem(child.key, u));
      }
    });
  });
}

function makeUserItem(uid, userObj) {
  const div = document.createElement("div");
  div.className = "user-item";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "space-between";
  div.style.padding = "6px 4px";

  const left = document.createElement("div");
  left.style.display = "flex";
  left.style.alignItems = "center";
  left.style.gap = "8px";

  const avatar = document.createElement("img");
  avatar.src = userObj.photoURL || "default_dp.png";
  avatar.alt = userObj.name || userObj.email || "";
  avatar.className = "avatar";
  avatar.style.width = "36px";
  avatar.style.height = "36px";
  avatar.style.borderRadius = "50%";
  left.appendChild(avatar);

  const name = document.createElement("div");
  name.textContent = userObj.name || userObj.email || "Unknown";
  name.style.fontWeight = "600";
  left.appendChild(name);

  div.appendChild(left);

  // right: status + menu
  const right = document.createElement("div");
  right.style.display = "flex";
  right.style.alignItems = "center";
  right.style.gap = "6px";

  const status = document.createElement("span");
  status.textContent = userObj.blocked ? "Blocked" : userObj.muted ? "Muted" : (userObj.online ? "●" : "○");
  status.style.color = userObj.blocked ? "red" : userObj.muted ? "orange" : userObj.online ? "green" : "gray";
  right.appendChild(status);

  const menuBtn = document.createElement("button");
  menuBtn.textContent = "⋮";
  menuBtn.style.border = "none";
  menuBtn.style.background = "transparent";
  menuBtn.style.cursor = "pointer";
  menuBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    openUserMenu(uid, userObj);
  });
  right.appendChild(menuBtn);

  div.appendChild(right);

  return div;
}

///// USER MENU (Profile / Private / Theme / Action) ////////
function openUserMenu(uid, userObj) {
  // remove old menus
  document.querySelectorAll(".user-menu").forEach(n => n.remove());

  const menu = document.createElement("div");
  menu.className = "user-menu";
  menu.style.position = "fixed";
  menu.style.right = "20px";
  menu.style.top = "100px";
  menu.style.background = "#fff";
  menu.style.border = "1px solid #ddd";
  menu.style.padding = "8px";
  menu.style.borderRadius = "8px";
  menu.style.zIndex = "999";

  const profileBtn = document.createElement("button");
  profileBtn.textContent = "Profile";
  profileBtn.onclick = () => viewProfile(uid, userObj);
  menu.appendChild(profileBtn);

  const privateBtn = document.createElement("button");
  privateBtn.textContent = "Private";
  privateBtn.onclick = () => openPrivateChat(uid, userObj);
  menu.appendChild(privateBtn);

  const themeBtn = document.createElement("button");
  themeBtn.textContent = "Theme";
  themeBtn.onclick = () => {
    const t = prompt("Enter theme (light/dark/blue/green):", localStorage.getItem("zhob_theme") || "light");
    if (t) applyTheme(t);
    menu.remove();
  };
  menu.appendChild(themeBtn);

  const actionBtn = document.createElement("button");
  actionBtn.textContent = "Action";
  actionBtn.onclick = () => openAdminActions(uid, userObj);
  menu.appendChild(actionBtn);

  document.body.appendChild(menu);
  // remove after some time if you want or keep until next open
}

function viewProfile(uid, userObj) {
  alert(`Profile\n\nName: ${userObj.name}\nEmail: ${userObj.email}\nOnline: ${userObj.online ? "Yes" : "No"}`);
}

///// PRIVATE CHAT //////////////////////////////////////////
function openPrivateChat(uid, userObj) {
  privateTarget = { uid, name: userObj.name || userObj.email };
  if (!privateContainer) return alert("Private chat UI missing.");
  privateContainer.classList.remove("hidden");
  privateTitle.textContent = `Private: ${privateTarget.name}`;
  loadPrivateMessages(currentUser.uid, privateTarget.uid);
}

closePrivate?.addEventListener("click", () => {
  privateContainer.classList.add("hidden");
  privateBox.innerHTML = "";
  privateTarget = null;
});

privateSend?.addEventListener("click", async () => {
  if (!privateTarget) return;
  const text = (privateInput.value || "").trim();
  if (!text) return;
  // store under private/{userA}_{userB}/messages with consistent key order
  const a = currentUser.uid;
  const b = privateTarget.uid;
  const room = a < b ? `${a}_${b}` : `${b}_${a}`;
  const msg = {
    from: currentUser.uid,
    to: privateTarget.uid,
    text,
    time: new Date().toLocaleTimeString(),
    ts: Date.now()
  };
  await push(ref(db, `private/${room}/messages`), msg);
  privateInput.value = "";
});

function startPrivateListener() {
  // listen for any private messages where current user is recipient
  const pRef = ref(db, "private");
  onValue(pRef, (snap) => {
    snap.forEach(roomSnap => {
      const roomKey = roomSnap.key;
      // messages node will be under private/{room}/messages
      const messagesSnap = roomSnap.child("messages");
      messagesSnap.forEach(m => {
        const msg = m.val();
        // if current user is recipient and msg.ts is recent, notify
        if (msg.to === currentUser.uid) {
          // play sound
          try { notifySound?.play(); } catch(e) {}
        }
      });
    });
  });
}

async function loadPrivateMessages(aUid, bUid) {
  privateBox.innerHTML = "";
  const room = aUid < bUid ? `${aUid}_${bUid}` : `${bUid}_${aUid}`;
  const msgsSnap = await get(ref(db, `private/${room}/messages`));
  if (!msgsSnap.exists()) return;
  msgsSnap.forEach(child => {
    const m = child.val();
    const div = document.createElement("div");
    div.style.margin = "6px 0";
    div.textContent = `${m.from === currentUser.uid ? "You" : privateTarget.name}: ${m.text} (${m.time})`;
    privateBox.appendChild(div);
  });
}

///// ADMIN ACTIONS: mute / block / unblock //////////////////
async function openAdminActions(uid, userObj) {
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    return alert("Only admin can perform actions.");
  }
  const action = prompt("Action for user (mute / unmute / block / unblock / deleteMessages):").toLowerCase();
  const userRef = ref(db, `users/${uid}`);
  if (action === "mute") {
    await update(userRef, { muted: true });
    alert("User muted.");
  } else if (action === "unmute") {
    await update(userRef, { muted: false });
    alert("User unmuted.");
  } else if (action === "block") {
    await update(userRef, { blocked: true });
    alert("User blocked.");
  } else if (action === "unblock") {
    await update(userRef, { blocked: false });
    alert("User unblocked.");
  } else if (action === "deletemessages") {
    if (confirm("Delete all messages by this user?")) {
      const msgs = await get(ref(db, "messages"));
      msgs.forEach(child => {
        const m = child.val();
        if (m.uid === uid) remove(ref(db, `messages/${child.key}`));
      });
      alert("User messages deleted.");
    }
  } else {
    alert("Unknown action.");
  }
}

///// UTIL: escape HTML to avoid injection //////////////////
function escapeHtml(text) {
  if (text === undefined || text === null) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
