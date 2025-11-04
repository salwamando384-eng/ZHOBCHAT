// chat.js (ZHOBCHAT V2)
// Modules (v11)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getDatabase, ref, push, onChildAdded, onChildRemoved, onValue, remove, set, update
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getStorage, ref as sRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// ---------- Config (your project) ----------
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

// ---------- Admin email ----------
const ADMIN_EMAIL = "salwamando384@gmail.com"; // owner

// ---------- init ----------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// ---------- helpers ----------
const $ = id => document.getElementById(id);
const emailKey = e => e.replaceAll('.', '_');

// DOM
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
let currentUserData = null;
let blockedSet = new Set();
let mutedSet = new Set();
let friendsSet = new Set();
let typingTimer = null;

// ---------- auth guard ----------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  currentUser = user;
  await loadCurrentUserData();
  // show top info
  currentNameEl.textContent = currentUserData?.name || currentUser.email;
  currentDP.src = currentUserData?.dpURL || 'default_dp.png';
  centerLabel.textContent = 'User';
  // show admin controls if admin
  if (currentUser.email === ADMIN_EMAIL) clearAllBtn.classList.remove('hidden');
  // mark online
  await update(ref(db, 'users/' + emailKey(currentUser.email)), { online: true });
  // start listeners
  listenUsers();
  listenMessages();
  listenTyping();
});

// ---------- load current user data & lists ----------
async function loadCurrentUserData(){
  const key = emailKey(currentUser.email);
  const userRef = ref(db, 'users/' + key);
  onValue(userRef, snap => {
    currentUserData = snap.val() || {};
    // blocked / muted / friends stored under each user node as objects
    blockedSet = new Set(Object.keys(currentUserData.blocked || {}));
    mutedSet = new Set(Object.keys(currentUserData.muted || {}));
    friendsSet = new Set(Object.keys(currentUserData.friends || {}));
  }, { onlyOnce: false });
}

// ---------- send message ----------
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
  startTyping();
  if (e.key === 'Enter') sendMessage();
});

async function sendMessage(){
  const text = messageInput.value.trim();
  if (!text || !currentUser) return;
  // fetch user data once
  const key = emailKey(currentUser.email);
  const userSnap = (await (await fetchUserOnce(key)));
  const u = userSnap || currentUserData;
  const msgObj = {
    uid: currentUser.uid,
    email: currentUser.email,
    name: u.name || currentUser.email,
    dpURL: u.dpURL || 'default_dp.png',
    nameColor: u.nameColor || '#ff4d4d',
    msgColor: u.msgColor || '#ffffff',
    text,
    time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
    timestamp: Date.now()
  };
  await push(ref(db, 'messages'), msgObj);
  messageInput.value = '';
  stopTyping();
}

function fetchUserOnce(key){
  return new Promise((res) => {
    onValue(ref(db, 'users/' + key), snap => res(snap.val()), { onlyOnce: true });
  });
}

// ---------- listen messages with skip for blocks ----------
function listenMessages(){
  messagesEl.innerHTML = '';
  onChildAdded(ref(db, 'messages'), (snap) => {
    const msg = snap.val();
    const id = snap.key;
    // if current user blocked sender => skip showing
    if (blockedSet.has(emailKey(msg.email))) return;
    // if sender blocked current user? still show — blocking is per viewer
    appendMessage(msg, id);
  });
  // remove handler for deletes (so removed messages disappear)
  onChildRemoved(ref(db, 'messages'), (snap) => {
    const id = snap.key;
    const el = document.querySelector(`[data-msgid="${id}"]`);
    if (el) el.remove();
  });
}

function appendMessage(msg, id){
  // if current user muted the sender, show but dim (or optionally hide)
  const senderKey = emailKey(msg.email || msg.uid || '');
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
  nameSpan.textContent = msg.name + (msg.name ? ':' : '');
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

  // actions (delete) — show if owner or admin
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'msg-actions';
  // delete btn for own message
  if (currentUser && (msg.uid === currentUser.uid || currentUser.email === ADMIN_EMAIL)) {
    const delBtn = document.createElement('button');
    delBtn.className = 'msg-action';
    delBtn.textContent = (msg.uid === currentUser.uid) ? 'Delete' : 'Delete (Admin)';
    delBtn.addEventListener('click', async () => {
      // confirm
      if (!confirm('Delete this message?')) return;
      await remove(ref(db, 'messages/' + id));
    });
    actionsDiv.appendChild(delBtn);
  }

  // append
  content.appendChild(top);
  content.appendChild(textDiv);
  content.appendChild(actionsDiv);

  // dim if muted
  if (isMuted) content.style.opacity = '0.4';

  row.appendChild(img);
  row.appendChild(content);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ---------- listen users (online+offline) ----------
function listenUsers(){
  usersListEl.innerHTML = '';
  onValue(ref(db, 'users'), (snap) => {
    usersListEl.innerHTML = '';
    let onlineCount = 0;
    snap.forEach(child => {
      const u = child.val();
      const username = u.name || child.key;
      const li = document.createElement('li');
      li.className = 'user-item';
      li.innerHTML = `<img src="${u.dpURL || 'default_dp.png'}"><div><div class="user-name">${username}</div><div class="user-status">${u.online ? 'Online' : 'Offline'}</div></div>`;
      // click to open profile panel
      li.addEventListener('click', () => openProfile(child.key, u));
      usersListEl.appendChild(li);
      if (u.online) onlineCount++;
    });
    $('onlineCount').textContent = `(${onlineCount})`;
  });
}

// ---------- profile panel actions ----------
let profileTargetKey = null;
function openProfile(key, u){
  profileTargetKey = key;
  profileDP.src = u.dpURL || 'default_dp.png';
  profileName.textContent = u.name || key;
  profileInfo.textContent = `${u.age || ''} · ${u.gender || ''} · ${u.city || ''}`;
  profilePanel.classList.remove('hidden');

  // friend request button text
  if ((currentUserData?.friends || {})[key]) {
    friendReqBtn.textContent = 'Friends';
    friendReqBtn.disabled = true;
  } else {
    friendReqBtn.textContent = 'Send Friend Request';
    friendReqBtn.disabled = false;
  }
  // block button state
  blockBtn.textContent = (currentUserData?.blocked || {})[key] ? 'Unblock' : 'Block';
  muteBtn.textContent = (currentUserData?.muted || {})[key] ? 'Unmute' : 'Mute';
}

// friend request
friendReqBtn.addEventListener('click', async () => {
  if (!profileTargetKey) return;
  const senderKey = emailKey(currentUser.email);
  // create request node: requests/{target}/{sender} = {fromEmail, name}
  await set(ref(db, `requests/${profileTargetKey}/${senderKey}`), {
    from: currentUser.email,
    name: currentUserData?.name || currentUser.email,
    time: Date.now()
  });
  alert('Friend request sent');
  friendReqBtn.textContent = 'Requested';
  friendReqBtn.disabled = true;
});

// block
blockBtn.addEventListener('click', async () => {
  if (!profileTargetKey) return;
  const meKey = emailKey(currentUser.email);
  const target = profileTargetKey;
  const blockedPath = `users/${meKey}/blocked/${target}`;
  const currentlyBlocked = (currentUserData?.blocked || {})[target];
  if (currentlyBlocked) {
    await remove(ref(db, blockedPath));
    alert('Unblocked');
  } else {
    await set(ref(db, blockedPath), { time: Date.now() });
    alert('Blocked');
  }
  profilePanel.classList.add('hidden');
});

// mute
muteBtn.addEventListener('click', async () => {
  if (!profileTargetKey) return;
  const meKey = emailKey(currentUser.email);
  const target = profileTargetKey;
  const mutePath = `users/${meKey}/muted/${target}`;
  const currentlyMuted = (currentUserData?.muted || {})[target];
  if (currentlyMuted) {
    await remove(ref(db, mutePath));
    alert('Unmuted');
  } else {
    await set(ref(db, mutePath), { time: Date.now() });
    alert('Muted');
  }
  profilePanel.classList.add('hidden');
});

closeProfile.addEventListener('click', () => profilePanel.classList.add('hidden'));

// ---------- typing indicator ----------
let typingRef = null;
function startTyping(){
  if (!currentUser) return;
  const tRef = ref(db, `typing/${emailKey(currentUser.email)}`);
  set(tRef, { name: currentUserData?.name || currentUser.email, time: Date.now() });
  // clear previous timer
  if (typingTimer) clearTimeout(typingTimer);
  typingTimer = setTimeout(stopTyping, 1500);
}
function stopTyping(){
  if (!currentUser) return;
  const tRef = ref(db, `typing/${emailKey(currentUser.email)}`);
  remove(tRef);
  if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
}
function listenTyping(){
  onValue(ref(db, 'typing'), snap => {
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

// ---------- Clear All (admin) ----------
clearAllBtn.addEventListener('click', async () => {
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) return alert('Only admin can clear all.');
  if (!confirm('Delete ALL messages? This cannot be undone.')) return;
  await remove(ref(db, 'messages'));
  alert('All messages cleared');
});

// ---------- logout ----------
logoutBtn.addEventListener('click', async () => {
  if (!currentUser) return;
  await update(ref(db, 'users/' + emailKey(currentUser.email)), { online: false });
  await signOut(auth);
  window.location.href = 'index.html';
});
