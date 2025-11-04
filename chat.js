// chat.js (module) — ZHOBCHAT V2 (clean)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getDatabase, ref, push, onChildAdded, onChildRemoved, onValue, remove, set, update
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getStorage, ref as sRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// ---------- Firebase config ----------
const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.firebasestorage.app",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218",
  measurementId: "G-LX9P9LRLV8"
};

const ADMIN_EMAIL = "salwamando384@gmail.com";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// helpers
const $ = id => document.getElementById(id);
const emailKey = (e) => (e || '').split('.').join('_');

const messagesEl = $('messages');
const usersListEl = $('usersList');
const sendBtn = $('sendBtn');
const messageInput = $('messageInput');
const logoutBtn = $('logoutBtn');
const clearAllBtn = $('clearAllBtn');
const currentNameEl = $('currentName');
const currentDP = $('currentDP');
const centerLabel = $('centerLabel');
const typingIndicator = $('typingIndicator');

const profilePanel = $('profilePanel');
const profileDP = $('profileDP');
const profileName = $('profileName');
const profileInfo = $('profileInfo');
const closeProfile = $('closeProfile');
const friendReqBtn = $('friendReqBtn');
const blockBtn = $('blockBtn');
const muteBtn = $('muteBtn');

let currentUser = null;
let currentUserData = {};
let blockedSet = new Set();
let mutedSet = new Set();
let friendsSet = new Set();
let profileTargetKey = null;
let typingTimer = null;

// Auth guard
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  currentUser = user;
  await loadCurrentUserData();

  currentNameEl.textContent = currentUserData.name || currentUser.email;
  currentDP.src = currentUserData.dpURL || 'default_dp.png';
  centerLabel.textContent = 'User';

  if (currentUser.email === ADMIN_EMAIL) clearAllBtn.classList.remove('hidden');
  await update(ref(db, 'users/' + emailKey(currentUser.email)), { online: true });

  listenUsers();
  listenMessages();
  listenTyping();
});

// load current user node
function loadCurrentUserData() {
  const key = emailKey(currentUser.email);
  const userRef = ref(db, 'users/' + key);
  onValue(userRef, (snap) => {
    currentUserData = snap.val() || {};
    blockedSet = new Set(Object.keys(currentUserData.blocked || {}));
    mutedSet = new Set(Object.keys(currentUserData.muted || {}));
    friendsSet = new Set(Object.keys(currentUserData.friends || {}));
  }, { onlyOnce: false });
}

// send message
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
  markTyping();
  if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !currentUser) return;
  const key = emailKey(currentUser.email);
  const snap = await new Promise((res) => onValue(ref(db, 'users/' + key), s => res(s.val()), { onlyOnce: true }));
  const u = snap || currentUserData;
  const msg = {
    uid: currentUser.uid,
    email: currentUser.email,
    name: u.name || currentUser.email,
    dpURL: u.dpURL || 'default_dp.png',
    nameColor: u.nameColor || '#ff4d4d',
    msgColor: u.msgColor || '#ffffff',
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now()
  };
  await push(ref(db, 'messages'), msg);
  messageInput.value = '';
  stopTyping();
}

// listen messages (append, and remove on delete)
function listenMessages() {
  messagesEl.innerHTML = '';
  onChildAdded(ref(db, 'messages'), (snap) => {
    const msg = snap.val();
    const id = snap.key;
    if (blockedSet.has(emailKey(msg.email))) return; // skip blocked senders
    appendMessage(msg, id);
  });
  onChildRemoved(ref(db, 'messages'), (snap) => {
    const id = snap.key;
    const el = document.querySelector(`[data-msgid="${id}"]`);
    if (el) el.remove();
  });
}

function appendMessage(msg, id) {
  const senderKey = emailKey(msg.email || '');
  const isMuted = mutedSet.has(senderKey);

  const row = document.createElement('div');
  row.className = 'msg-row';
  row.setAttribute('data-msgid', id);

  const img = document.createElement('img');
  img.className = 'msg-dp';
  img.src = msg.dpURL || 'default_dp.png';
  img.alt = 'dp';

  const content = document.createElement('div');
  content.className = 'msg-content';

  const top = document.createElement('div');
  top.className = 'msg-top';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'msg-name';
  nameSpan.textContent = (msg.name ? msg.name + ':' : msg.email);
  if (msg.nameColor) nameSpan.style.color = msg.nameColor;

  const timeSpan = document.createElement('span');
  timeSpan.className = 'msg-time';
  timeSpan.textContent = msg.time || '';

  top.appendChild(nameSpan);
  top.appendChild(timeSpan);

  const textDiv = document.createElement('div');
  textDiv.className = 'msg-text';
  textDiv.textContent = msg.text;
  if (msg.msgColor) textDiv.style.color = msg.msgColor;

  content.appendChild(top);
  content.appendChild(textDiv);

  // actions: delete (self) or admin delete
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'msg-actions';
  if (currentUser && (msg.uid === currentUser.uid || currentUser.email === ADMIN_EMAIL)) {
    const del = document.createElement('button');
    del.className = 'msg-action';
    del.textContent = (msg.uid === currentUser.uid) ? 'Delete' : 'Delete (Admin)';
    del.addEventListener('click', async () => {
      if (!confirm('Delete this message?')) return;
      await remove(ref(db, 'messages/' + id));
    });
    actionsDiv.appendChild(del);
  }

  content.appendChild(actionsDiv);

  if (isMuted) content.style.opacity = '0.45';

  row.appendChild(img);
  row.appendChild(content);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// users list
function listenUsers() {
  usersListEl.innerHTML = '';
  onValue(ref(db, 'users'), (snap) => {
    usersListEl.innerHTML = '';
    let online = 0;
    snap.forEach(child => {
      const u = child.val();
      const key = child.key;
      const li = document.createElement('li');
      li.className = 'user-item';
      li.innerHTML = `<img src="${u.dpURL || 'default_dp.png'}"><div><div class="user-name">${u.name || key}</div><div class="user-status">${u.online ? 'Online' : 'Offline'}</div></div>`;
      li.addEventListener('click', () => openProfile(key, u));
      usersListEl.appendChild(li);
      if (u.online) online++;
    });
    $('onlineCount').textContent = `(${online})`;
  });
}

// profile panel
function openProfile(key, u) {
  profileTargetKey = key;
  profileDP.src = u.dpURL || 'default_dp.png';
  profileName.textContent = u.name || key;
  profileInfo.textContent = `${u.age || ''} · ${u.gender || ''} · ${u.city || ''}`;
  profilePanel.classList.remove('hidden');

  // set friend/button states (simple)
  const isFriend = (currentUserData.friends || {})[key];
  if (isFriend) { friendReqBtn.textContent = 'Friends'; friendReqBtn.disabled = true; } else { friendReqBtn.textContent = 'Add Friend'; friendReqBtn.disabled = false; }
  blockBtn.textContent = (currentUserData.blocked || {})[key] ? 'Unblock' : 'Block';
  muteBtn.textContent = (currentUserData.muted || {})[key] ? 'Unmute' : 'Mute';
}

friendReqBtn.addEventListener('click', async () => {
  if (!profileTargetKey) return;
  const sender = emailKey(currentUser.email);
  await set(ref(db, `requests/${profileTargetKey}/${sender}`), { from: currentUser.email, name: currentUserData.name || currentUser.email, time: Date.now() });
  alert('Friend request sent');
  friendReqBtn.textContent = 'Requested';
  friendReqBtn.disabled = true;
});

blockBtn.addEventListener('click', async () => {
  if (!profileTargetKey) return;
  const me = emailKey(currentUser.email);
  const target = profileTargetKey;
  const path = `users/${me}/blocked/${target}`;
  const currently = (currentUserData.blocked || {})[target];
  if (currently) { await remove(ref(db, path)); alert('Unblocked'); } else { await set(ref(db, path), { time: Date.now() }); alert('Blocked'); }
  profilePanel.classList.add('hidden');
});

muteBtn.addEventListener('click', async () => {
  if (!profileTargetKey) return;
  const me = emailKey(currentUser.email);
  const target = profileTargetKey;
  const path = `users/${me}/muted/${target}`;
  const currently = (currentUserData.muted || {})[target];
  if (currently) { await remove(ref(db, path)); alert('Unmuted'); } else { await set(ref(db, path), { time: Date.now() }); alert('Muted'); }
  profilePanel.classList.add('hidden');
});

closeProfile.addEventListener('click', () => profilePanel.classList.add('hidden'));

// typing indicator
function markTyping() {
  if (!currentUser) return;
  const key = emailKey(currentUser.email);
  set(ref(db, `typing/${key}`), { name: currentUserData.name || currentUser.email, time: Date.now() });
  if (typingTimer) clearTimeout(typingTimer);
  typingTimer = setTimeout(stopTyping, 1500);
}
function stopTyping() {
  if (!currentUser) return;
  remove(ref(db, `typing/${emailKey(currentUser.email)}`));
  if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
}
function listenTyping() {
  onValue(ref(db, 'typing'), (snap) => {
    const val = snap.val() || {};
    const others = Object.keys(val).filter(k => k !== emailKey(currentUser.email));
    if (others.length) {
      const names = others.map(k => val[k].name || k).join(', ');
      typingIndicator.textContent = `${names} is typing...`;
      typingIndicator.classList.remove('hidden');
    } else {
      typingIndicator.classList.add('hidden');
    }
  });
}

// clear all (admin)
clearAllBtn.addEventListener('click', async () => {
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) return alert('Only admin can clear all.');
  if (!confirm('Delete ALL messages?')) return;
  await remove(ref(db, 'messages'));
  alert('All messages deleted.');
});

// logout
logoutBtn.addEventListener('click', async () => {
  if (!currentUser) return;
  await update(ref(db, 'users/' + emailKey(currentUser.email)), { online: false });
  await signOut(auth);
  window.location.href = 'index.html';
});
