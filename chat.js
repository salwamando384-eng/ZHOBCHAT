// chat.js (module)
import { auth, db, storage } from "./firebase_config.js";
import {
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  ref, push, onChildAdded, onValue, set, update, remove, query, orderByKey
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as sRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const el = id => document.getElementById(id);
const chatBox = el('chatBox');
const msgInput = el('messageInput');
const sendBtn = el('sendBtn');
const logoutBtn = el('logoutBtn');
const usersBtn = el('usersBtn');
const usersPanel = el('usersPanel');
const usersList = el('usersList');
const botsList = el('botsList');
const profileModal = el('profileModal');
const profileDp = el('profileDp');
const profileName = el('profileName');
const profileInfo = el('profileInfo');
const pmBtn = el('pmBtn'), friendBtn = el('friendBtn'), actionBtn = el('actionBtn'), closeProfile = el('closeProfile');
const onlineCount = el('onlineCount');
const themeSelect = el('themeSelect');

let currentUser = null;
let blocked = {}; // local cached blocked list (uids blocked by current user)
const adminEmail = "admin@zhobchat.com"; // change if you want another admin

// apply saved theme for user (if any)
function applyTheme(name){
  document.body.classList.remove('theme-blue','theme-dark','theme-green','theme-purple');
  if(name === 'blue') document.body.classList.add('theme-blue');
  if(name === 'dark') document.body.classList.add('theme-dark');
  if(name === 'green') document.body.classList.add('theme-green');
  if(name === 'purple') document.body.classList.add('theme-purple');
}

// Auth guard
onAuthStateChanged(auth, async (user)=>{
  if(!user){ location.href = "index.html"; return; }
  currentUser = user;
  // load user data to get theme & blocked list
  onValue(ref(db, `users/${user.uid}`), snap=>{
    const u = snap.val();
    if(u && u.theme) applyTheme(u.theme);
  });
  // load blocks
  onValue(ref(db, `blocks/${user.uid}`), snap=>{
    blocked = snap.val() || {};
  });
  loadMessages();
  loadUsers();
  ensureBotsExist();
});

// send message (public)
function sendMessage(){
  const text = msgInput.value.trim();
  if(!text || !currentUser) return;
  const msgRef = ref(db, 'messages');
  const m = {
    uid: currentUser.uid,
    user: currentUser.displayName || currentUser.email,
    text,
    time: new Date().toLocaleTimeString(),
    nameColor: null,
    msgColor: null,
    dpURL: null
  };
  // read current user's saved colors/dp
  onValue(ref(db, `users/${currentUser.uid}`), snap=>{
    const u = snap.val() || {};
    m.nameColor = u.nameColor || null;
    m.msgColor = u.msgColor || null;
    m.dpURL = u.dpURL || null;
    push(msgRef, m);
  }, { onlyOnce:true });
  msgInput.value = "";
}
sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keydown', e=>{ if(e.key === "Enter") sendMessage(); });

// append message on UI
function appendMessage(key, msg){
  // skip if current user blocked sender or sender blocked current user?
  if(blocked && blocked[msg.uid]) return;
  const row = document.createElement('div');
  row.className = 'message-row';
  row.dataset.key = key;

  const dp = document.createElement('img');
  dp.className = 'msg-dp';
  dp.src = msg.dpURL || 'default_dp.png';
  dp.alt = msg.user;

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';

  const meta = document.createElement('div');
  meta.className = 'msg-meta';
  const nameDiv = document.createElement('span');
  nameDiv.className = 'msg-name';
  nameDiv.textContent = msg.user + ':';
  if(msg.nameColor) nameDiv.style.color = msg.nameColor;

  meta.appendChild(nameDiv);

  const textDiv = document.createElement('div');
  textDiv.className = 'msg-text';
  textDiv.textContent = msg.text;
  if(msg.msgColor) textDiv.style.color = msg.msgColor;

  const timeDiv = document.createElement('div');
  timeDiv.className = 'msg-time';
  timeDiv.textContent = msg.time || '';

  bubble.appendChild(meta);
  bubble.appendChild(textDiv);
  bubble.appendChild(timeDiv);

  // delete control for admin or message owner
  if(currentUser && (currentUser.email === adminEmail || currentUser.uid === msg.uid)){
    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑';
    delBtn.title = 'Delete';
    delBtn.className = 'btn small';
    delBtn.style.marginLeft = '8px';
    delBtn.onclick = async ()=> {
      await remove(ref(db, `messages/${key}`));
    };
    bubble.appendChild(delBtn);
  }

  // click on name/dp to open profile modal
  dp.addEventListener('click', ()=> openProfileByUid(msg.uid));
  nameDiv.addEventListener('click', ()=> openProfileByUid(msg.uid));

  row.appendChild(dp);
  row.appendChild(bubble);
  chatBox.appendChild(row);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// load messages realtime
function loadMessages(){
  chatBox.innerHTML = '';
  const mref = ref(db, 'messages');
  // show messages in insertion order using onChildAdded
  onChildAdded(mref, (snap)=>{
    const msg = snap.val();
    appendMessage(snap.key, msg);
  });
  // listen for deletions to remove from UI
  onValue(mref, snapshot=>{
    // ensure UI shows current set (quick sync)
    // remove rows for messages that no longer exist
    const keys = new Set();
    snapshot.forEach(s=> keys.add(s.key));
    [...chatBox.children].forEach(row=>{
      const k = row.dataset.key;
      if(k && !keys.has(k)) row.remove();
    });
  });
}

// load users list
function loadUsers(){
  usersList.innerHTML = '';
  const uref = ref(db, 'users');
  onValue(uref, snapshot=>{
    usersList.innerHTML = '';
    let count = 0;
    snapshot.forEach(child=>{
      const u = child.val();
      const uid = child.key;
      const item = document.createElement('div');
      item.className = 'user-item';
      item.innerHTML = `<img src="${u.dpURL || 'default_dp.png'}"><div><div style="font-weight:700;color:${u.nameColor||'#000'}">${u.name||u.email}</div><div style="font-size:12px;color:var(--muted)">${u.city||''} ${u.online?'<span style="color:green"> • online</span>':''}</div></div>`;
      item.addEventListener('click', ()=> openProfile(uid));
      usersList.appendChild(item);
      if(u.online) count++;
    });
    onlineCount.textContent = `(${count})`;
  });
}

// open profile modal by uid
function openProfile(uid){
  onValue(ref(db, `users/${uid}`), snap=>{
    const u = snap.val();
    if(!u) return;
    profileDp.src = u.dpURL || 'default_dp.png';
    profileName.textContent = u.name || u.email;
    profileInfo.textContent = `${u.gender || ''} · ${u.age || ''} · ${u.city || ''}`;
    profileModal.classList.remove('hidden');
    profileModal.dataset.uid = uid;
  }, { onlyOnce:true });
}
function openProfileByUid(uid){ openProfile(uid); }

// profile actions
pmBtn.addEventListener('click', ()=> {
  const uid = profileModal.dataset.uid;
  if(!uid) return;
  // create/redirect to private thread id deterministic
  const threads = [currentUser.uid, uid].sort().join('_');
  location.href = `private.html?thread=${threads}&uid=${uid}`;
});
friendBtn.addEventListener('click', async ()=>{
  const uid = profileModal.dataset.uid;
  if(!uid) return;
  // push friend request
  await push(ref(db, `friend_requests/${uid}`), { from: currentUser.uid, time:new Date().toLocaleString(), name: currentUser.displayName||currentUser.email });
  alert('Friend request sent');
});
actionBtn.addEventListener('click', async ()=>{
  const uid = profileModal.dataset.uid;
  if(!uid) return;
  // show simple action options: block / mute / clear messages (admin)
  const choice = prompt("action: block / mute /clear (type one)");
  if(!choice) return;
  if(choice === 'block'){
    await set(ref(db, `blocks/${currentUser.uid}/${uid}`), true);
    alert('User blocked');
  } else if(choice === 'mute'){
    await set(ref(db, `mutes/${currentUser.uid}/${uid}`), true);
    alert('User muted');
  } else if(choice === 'clear' && currentUser.email === adminEmail){
    // admin: clear all messages of this user
    const msgs = [];
    onValue(ref(db, 'messages'), snapshot=>{
      snapshot.forEach(child=>{
        const m = child.val();
        if(m.uid === uid) msgs.push(child.key);
      });
      msgs.forEach(k=> remove(ref(db, `messages/${k}`)));
      alert('User messages cleared');
    }, { onlyOnce:true });
  } else alert('unknown action or insufficient rights');
});
closeProfile.addEventListener('click', ()=> profileModal.classList.add('hidden'));

// toggle users panel
usersBtn.addEventListener('click', ()=> usersPanel.classList.toggle('show'));

// logout
logoutBtn.addEventListener('click', async ()=>{
  if(!confirm('Logout?')) return;
  await update(ref(db, `users/${currentUser.uid}`), { online:false, lastSeen: new Date().toLocaleString() });
  await signOut(auth);
  location.href = 'index.html';
});

// ensure bots shown — these are dummy accounts in RTDB under bots/
async function ensureBotsExist(){
  const bots = [
    { id: 'bot_abid', name: 'Abid', dpURL: 'default_dp.png' },
    { id: 'bot_hina', name: 'Hina', dpURL: 'default_dp.png' },
    { id: 'bot_akbar', name: 'Akbar khan', dpURL: 'default_dp.png' },
    { id: 'bot_junaid', name: 'Junaid', dpURL: 'default_dp.png' },
    { id: 'bot_shaista', name: 'Shaista', dpURL: 'default_dp.png' }
  ];
  bots.forEach(b=>{
    set(ref(db, `bots/${b.id}`), b);
  });
  // render bots in UI
  onValue(ref(db, 'bots'), snap=>{
    botsList.innerHTML = '';
    snap.forEach(child=>{
      const b = child.val();
      const div = document.createElement('div');
      div.className = 'user-item';
      div.innerHTML = `<img src="${b.dpURL||'default_dp.png'}"><div><div style="font-weight:700">${b.name}</div><div style="font-size:12px;color:var(--muted)">robot</div></div>`;
      botsList.appendChild(div);
    });
  });
}

// apply theme selection — save to user
themeSelect.addEventListener('change', async ()=>{
  const t = themeSelect.value;
  applyTheme(t);
  if(currentUser) await update(ref(db, `users/${currentUser.uid}`), { theme: t });
});

// helper to apply theme (same as in index.js)
function applyTheme(name){
  document.body.classList.remove('theme-blue','theme-dark','theme-green','theme-purple');
  if(name === 'blue') document.body.classList.add('theme-blue');
  if(name === 'dark') document.body.classList.add('theme-dark');
  if(name === 'green') document.body.classList.add('theme-green');
  if(name === 'purple') document.body.classList.add('theme-purple');
}
