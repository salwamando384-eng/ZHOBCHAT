// chat.js (module)
import { app, auth, db } from "./firebase_config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, push, onChildAdded, remove, onValue, set, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// ----- CONFIG -----
const ADMIN_EMAIL = "salwamando384@gmail.com"; // <-- آپ کا admin email (بدل سکتے ہیں)

// ----- DOM -----
const messagesEl = document.getElementById('messages');
const usersListEl = document.getElementById('usersList');
const sendBtn = document.getElementById('sendBtn');
const messageInput = document.getElementById('messageInput');
const logoutBtn = document.getElementById('logoutBtn');
const currentNameEl = document.getElementById('currentName');
const currentDP = document.getElementById('currentDP');
const adminControls = document.getElementById('adminControls');
const deleteAllBtn = document.getElementById('deleteAllBtn');

const profilePanel = document.getElementById('profilePanel');
const profileDP = document.getElementById('profileDP');
const profileName = document.getElementById('profileName');
const profileInfo = document.getElementById('profileInfo');
const closeProfile = document.getElementById('closeProfile');
const blockBtn = document.getElementById('blockBtn');
const muteBtn = document.getElementById('muteBtn');

// Robots (silent frontend only) — change dp to uploaded files if you want
const robots = [
  { name: "Abid", uid: "robot_abid", dp: "robot1.png" },
  { name: "Hina", uid: "robot_hina", dp: "robot2.png" },
  { name: "Akbar Khan", uid: "robot_akbar", dp: "robot3.png" },
  { name: "Junaid", uid: "robot_junaid", dp: "robot4.png" },
  { name: "Shaista", uid: "robot_shaista", dp: "robot5.png" }
];

// state
let currentUser = null;
let currentUserData = {};
let isAdmin = false;
let profileTargetUid = null;

// helpers
const $ = id => document.getElementById(id);

// Auth guard & init
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  isAdmin = (user.email === ADMIN_EMAIL);
  currentNameEl.textContent = user.displayName || user.email;
  currentDP.src = user.photoURL || 'default_dp.png';
  if(isAdmin) adminControls.classList.remove('hidden');

  // load current user DB data (optional)
  onValue(ref(db, 'users/' + user.uid), snap => {
    currentUserData = snap.val() || {};
  });

  loadUsers();
  listenMessages();
});

// ------------------ MESSAGES ------------------
function listenMessages(){
  messagesEl.innerHTML = '';
  const msgsRef = ref(db, 'messages');
  onChildAdded(msgsRef, snap => {
    const id = snap.key;
    const msg = snap.val();
    // global blocked check: if msg.uid exists in /blocked/<uid> then skip (blocked by admin globally)
    onValue(ref(db, 'blocked/' + msg.uid), bSnap => {
      const isGlobBlocked = bSnap.exists();
      if(isGlobBlocked) {
        // do not show blocked user's messages at all
        return;
      }
      // mute check: if current user has muted this sender, skip showing
      onValue(ref(db, 'users/' + currentUser.uid + '/muted/' + msg.uid), mSnap => {
        const isMuted = mSnap.exists();
        if(isMuted) return;
        appendMessage(msg, id);
      }, { onlyOnce: true });
    }, { onlyOnce: true });
  });
}

function appendMessage(msg, id){
  // prevent duplicate DOM nodes (on re-listen)
  if(messagesEl.querySelector(`[data-msgid="${id}"]`)) return;

  const row = document.createElement('div');
  row.className = 'msg-row';
  row.dataset.msgid = id;

  const img = document.createElement('img');
  img.className = 'msg-dp';
  img.src = msg.dpURL || 'default_dp.png';

  const content = document.createElement('div');
  content.className = 'msg-content';

  const top = document.createElement('div');
  top.className = 'msg-top';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'msg-name';
  nameSpan.textContent = msg.name || msg.email || msg.sender;

  const timeSpan = document.createElement('span');
  timeSpan.className = 'msg-time';
  timeSpan.textContent = msg.time || '';

  top.appendChild(nameSpan);
  top.appendChild(timeSpan);

  const textDiv = document.createElement('div');
  textDiv.className = 'msg-text';
  textDiv.textContent = msg.text || '';

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'msg-actions';

  // show delete button if admin OR message owner
  const isOwner = (currentUser && msg.uid && msg.uid === currentUser.uid);
  if(isAdmin || isOwner){
    const delBtn = document.createElement('button');
    delBtn.className = 'msg-action';
    delBtn.textContent = isAdmin ? 'Delete (Admin)' : 'Delete';
    delBtn.addEventListener('click', async ()=>{
      if(!confirm('Delete this message?')) return;
      await remove(ref(db, 'messages/' + id));
      // remove from DOM
      const el = messagesEl.querySelector(`[data-msgid="${id}"]`);
      if(el) el.remove();
    });
    actionsDiv.appendChild(delBtn);
  }

  content.appendChild(top);
  content.appendChild(textDiv);
  content.appendChild(actionsDiv);

  row.appendChild(img);
  row.appendChild(content);

  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ------------------ USERS LIST ------------------
function loadUsers(){
  usersListEl.innerHTML = '';
  // first show current user at top
  const curLi = document.createElement('li');
  curLi.className = 'user-item';
  curLi.innerHTML = `<img src="${currentUser.photoURL || 'default_dp.png'}"><div><div class="user-name">${currentUser.displayName || currentUser.email}</div><div class="user-status">You</div></div>`;
  usersListEl.appendChild(curLi);

  // show robots (frontend-only)
  robots.forEach(r => {
    const li = document.createElement('li');
    li.className = 'user-item';
    li.innerHTML = `<img src="${r.dp}"><div><div class="user-name">${r.name}</div><div class="user-status">Bot</div></div>`;
    usersListEl.appendChild(li);
  });

  // then load real users from DB
  onValue(ref(db, 'users'), snap => {
    // remove previously added real users (keep first X)
    // clear except first (current) and robots count
    // simpler: rebuild list entirely (we will re-add current + robots first)
    usersListEl.innerHTML = '';
    usersListEl.appendChild(curLi.cloneNode(true));
    robots.forEach(r=>{
      const li = document.createElement('li');
      li.className = 'user-item';
      li.innerHTML = `<img src="${r.dp}"><div><div class="user-name">${r.name}</div><div class="user-status">Bot</div></div>`;
      usersListEl.appendChild(li);
    });

    let onlineCount = 0;
    snap.forEach(child => {
      const key = child.key;
      const u = child.val();
      // skip if same uid as current (already shown)
      if(key === currentUser.uid) return;
      const li = document.createElement('li');
      li.className = 'user-item';
      li.dataset.uid = key;
      li.innerHTML = `<img src="${u.dpURL || 'default_dp.png'}"><div><div class="user-name">${u.name || u.email}</div><div class="user-status">${u.online ? 'Online' : 'Offline'}</div></div>`;
      li.addEventListener('click', ()=> openProfile(key, u));
      usersListEl.appendChild(li);
      if(u.online) onlineCount++;
    });
    document.getElementById('onlineCount').textContent = `(${onlineCount})`;
  });
}

// ------------------ PROFILE / BLOCK / MUTE ------------------
function openProfile(uid, u){
  profileTargetUid = uid;
  profileDP.src = u.dpURL || 'default_dp.png';
  profileName.textContent = u.name || u.email || uid;
  profileInfo.textContent = `${u.age || ''} · ${u.gender || ''} · ${u.city || ''}`;
  profilePanel.classList.remove('hidden');

  // update block/mute buttons based on DB state
  onValue(ref(db, 'blocked/' + uid), snap => {
    // if target is blocked globally? (admin action)
    blockBtn.textContent = snap.exists() ? 'Unblock (Global)' : 'Block (Global)';
  }, { onlyOnce: true });

  onValue(ref(db, `users/${currentUser.uid}/muted/${uid}`), snap => {
    muteBtn.textContent = snap.exists() ? 'Unmute (You)' : 'Mute (You)';
  }, { onlyOnce: true });
}

blockBtn.addEventListener('click', async ()=>{
  if(!profileTargetUid) return;
  // Only admin should block globally (but allow admin only)
  if(!isAdmin){ alert('Only admin can block globally'); return; }
  const path = ref(db, 'blocked/' + profileTargetUid);
  const snap = await new Promise(res => onValue(path, s=>{ res(s); }, { onlyOnce:true }));
  if(snap.exists()){
    // unblock
    await remove(path);
    alert('User unblocked globally');
  } else {
    await set(path, true);
    alert('User blocked globally');
  }
  profilePanel.classList.add('hidden');
});

muteBtn.addEventListener('click', async ()=>{
  if(!profileTargetUid) return;
  const myMutePath = ref(db, `users/${currentUser.uid}/muted/${profileTargetUid}`);
  const snap = await new Promise(res => onValue(myMutePath, s=>{ res(s); }, { onlyOnce:true }));
  if(snap.exists()){
    await remove(myMutePath);
    alert('User unmuted for you');
  } else {
    await set(myMutePath, true);
    alert('User muted for you');
  }
  profilePanel.classList.add('hidden');
});

closeProfile.addEventListener('click', ()=> profilePanel.classList.add('hidden'));

// ------------------ SEND MESSAGE ------------------
sendBtn.addEventListener('click', async ()=>{
  const text = messageInput.value.trim();
  if(!text) return;

  // check if current user is globally blocked
  const blockedSnap = await new Promise(res => onValue(ref(db, 'blocked/' + currentUser.uid), s=>{ res(s); }, { onlyOnce:true }));
  if(blockedSnap.exists()){
    alert('You are blocked. You cannot send messages.');
    return;
  }

  const msgRef = push(ref(db, 'messages'));
  await set(msgRef, {
    uid: currentUser.uid,
    name: currentUserData.name || currentUser.displayName || currentUser.email,
    dpURL: currentUserData.dpURL || currentUser.photoURL || 'default_dp.png',
    text: text,
    time: new Date().toLocaleTimeString(),
    timestamp: Date.now()
  });
  messageInput.value = '';
});

// ------------------ DELETE ALL (ADMIN) ------------------
deleteAllBtn.addEventListener('click', async ()=>{
  if(!confirm('Delete ALL messages? This cannot be undone.')) return;
  if(!isAdmin){ alert('Only admin can delete all messages'); return; }
  await remove(ref(db, 'messages'));
  messagesEl.innerHTML = '';
  alert('All messages deleted by admin.');
});

// ------------------ LOGOUT ------------------
logoutBtn.addEventListener('click', async ()=>{
  await update(ref(db, 'users/' + currentUser.uid), { online: false });
  await signOut(auth);
  window.location.href = 'index.html';
});
