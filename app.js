// app.js
// Main chat logic: Firebase initialization, load users + robots, send/receive messages, admin delete, private rooms.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getDatabase, ref, push, onChildAdded, set, get, remove
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import { firebaseConfig } from "./firebase_config.js";
import { robots } from "./robots.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM
const userListEl = document.getElementById('userList');
const messagesEl = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const emojiBtn = document.getElementById('emojiBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userDetailDp = document.getElementById('userDetailDp');
const userDetailName = document.getElementById('userDetailName');
const userDetailAge = document.getElementById('userDetailAge');
const userDetailGender = document.getElementById('userDetailGender');
const privateChatBtn = document.getElementById('privateChatBtn');
const roomTitle = document.getElementById('roomTitle');

const username = localStorage.getItem('username');
const email = localStorage.getItem('email') || '';
if (!username) { window.location.href = 'index.html'; throw new Error('Not logged in'); }

const isAdmin = (email === 'admin@gmail.com');

const usersRef = ref(db, 'users/');
const messagesBaseRef = ref(db, 'messages/');

// Save current user (status remains online until explicit logout)
await set(ref(db, 'users/' + username), {
  name: username,
  email: email,
  dp: 'https://i.ibb.co/0F8VbW5/default_dp.png',
  status: 'online',
  role: isAdmin ? 'admin' : 'user',
  age: localStorage.getItem('age') || '',
  gender: localStorage.getItem('gender') || ''
});

// current room (global by default)
let currentRoom = localStorage.getItem('currentRoom') || 'global';
roomTitle.textContent = currentRoom === 'global' ? 'General Chat' : localStorage.getItem('currentRoomName') || currentRoom;

// load users + robots
async function loadUsers(){
  userListEl.innerHTML = '';
  const snap = await get(usersRef);
  if (snap.exists()){
    const obj = snap.val();
    Object.keys(obj).forEach(k=>{
      const u = obj[k];
      addUserRow(u);
    });
  }
  // add robots after real users
  robots.forEach(r => addUserRow({ name: r.name, dp: r.dp, status: 'online', gender: r.gender }));
}
function addUserRow(u){
  const li = document.createElement('li');
  li.className = 'user-row';
  li.innerHTML = `
    <img src="${u.dp || 'https://i.ibb.co/0F8VbW5/default_dp.png'}" class="user-dp" />
    <div>
      <div class="user-name">${u.name}</div>
      <div style="font-size:12px;color:#666">${u.gender ? u.gender + (u.age ? ' • ' + u.age + ' yrs' : '') : ''}</div>
    </div>
  `;
  li.onclick = ()=> { showUserDetails(u); };
  userListEl.appendChild(li);
}
function showUserDetails(u){
  userDetailDp.src = u.dp || 'https://i.ibb.co/0F8VbW5/default_dp.png';
  userDetailName.textContent = 'Name: ' + (u.name || '');
  userDetailAge.textContent = u.age ? 'Age: ' + u.age : '';
  userDetailGender.textContent = u.gender ? 'Gender: ' + u.gender : '';
  privateChatBtn.onclick = ()=> {
    const roomId = [username, u.name].sort().join('_');
    localStorage.setItem('currentRoom', roomId);
    localStorage.setItem('currentRoomName', 'Private: ' + u.name);
    currentRoom = roomId;
    roomTitle.textContent = 'Private: ' + u.name;
    messagesEl.innerHTML = '';
    bindMessages(currentRoom);
  };
}

// messages binding
function bindMessages(roomId){
  messagesEl.innerHTML = '';
  const rRef = ref(db, `messages/${roomId}/`);
  onChildAdded(rRef, (snap)=>{
    const m = snap.val();
    const key = snap.key;
    renderMessage(m, key, roomId);
  });
}
function renderMessage(m, key, roomId){
  const div = document.createElement('div');
  const isMe = m.name === username;
  div.className = 'msg ' + (isMe ? 'me' : '');
  const img = document.createElement('img');
  img.className = 'user-dp';
  img.src = m.dp || 'https://i.ibb.co/0F8VbW5/default_dp.png';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = `<strong>${m.name}</strong><div style="font-size:13px;margin-top:6px;">${m.text || ''}</div><div class="meta">${m.time || ''}</div>`;
  div.appendChild(img);
  div.appendChild(bubble);

  if (isMe || isAdmin) {
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.className = 'icon-btn';
    del.style.marginLeft = '8px';
    del.onclick = async ()=>{
      if (confirm('Delete this message?')) {
        await remove(ref(db, `messages/${roomId}/${key}`));
      }
    };
    div.appendChild(del);
  }

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// initial bind
bindMessages(currentRoom);

// send message
sendBtn.addEventListener('click', async ()=>{
  const text = messageInput.value.trim();
  if (!text) return;
  const payload = {
    name: username,
    email,
    dp: 'https://i.ibb.co/0F8VbW5/default_dp.png',
    text,
    time: new Date().toLocaleTimeString()
  };
  await push(ref(db, `messages/${currentRoom}`), payload);
  messageInput.value = '';
});

// enter key sends
messageInput.addEventListener('keypress', (e)=> { if(e.key === 'Enter') sendBtn.click(); });

// toggle users list (emoji button)
emojiBtn.addEventListener('click', ()=> {
  const ul = document.querySelector('.users-list');
  ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
});

// clear room (admin)
clearChatBtn.addEventListener('click', async ()=>{
  if (!isAdmin) return alert('Only admin can clear this room');
  if (confirm('Clear all messages in this room?')) {
    await remove(ref(db, `messages/${currentRoom}`));
    messagesEl.innerHTML = '';
  }
});

// logout
logoutBtn.addEventListener('click', async ()=>{
  await set(ref(db, 'users/' + username + '/status'), 'offline');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  localStorage.removeItem('currentRoom');
  localStorage.removeItem('currentRoomName');
  window.location.href = 'index.html';
});

// refresh users periodically
setInterval(loadUsers, 6000);
loadUsers();

// start bots: each bot pushes to global room at staggered intervals
function startBots(){
  robots.forEach((bot, idx)=>{
    setInterval(async ()=>{
      const text = bot.messages[Math.floor(Math.random() * bot.messages.length)];
      const payload = {
        name: bot.name,
        dp: bot.dp,
        text,
        time: new Date().toLocaleTimeString()
      };
      await push(ref(db, 'messages/global'), payload);
    }, 25000 + idx * 8000);
  });
}
startBots();
