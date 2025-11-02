// app.js
// Chat logic: loads users, messages, bots, send/delete, private stub.
// This file is imported by chat.html

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getDatabase, ref, push, onChildAdded, set, get, remove, update
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
const userDetails = document.getElementById('userDetails');
const userDetailDp = document.getElementById('userDetailDp');
const userDetailName = document.getElementById('userDetailName');
const userDetailAge = document.getElementById('userDetailAge');
const userDetailGender = document.getElementById('userDetailGender');
const privateChatBtn = document.getElementById('privateChatBtn');

const username = localStorage.getItem('username');
const email = localStorage.getItem('email') || '';
if (!username) { window.location.href = 'index.html'; throw new Error('Not logged in'); }

const isAdmin = (localStorage.getItem('email') === 'admin@gmail.com') || false;

const usersRef = ref(db, 'users/');
const messagesRef = ref(db, 'messages/');

// Save / ensure current user in users list (status stays until explicit logout)
set(ref(db, 'users/' + username), {
  name: username,
  email: email || '',
  dp: 'https://i.ibb.co/0F8VbW5/default_dp.png',
  status: 'online',
  role: isAdmin ? 'admin' : 'user',
  age: localStorage.getItem('age') || '',
  gender: localStorage.getItem('gender') || ''
});

// Load users from Firebase + robots
async function loadUsers() {
  userListEl.innerHTML = '';
  // Firebase users
  const snapshot = await get(usersRef);
  if (snapshot.exists()) {
    const obj = snapshot.val();
    Object.keys(obj).forEach(k=>{
      const u = obj[k];
      addUserToList(u);
    });
  }
  // Robots after real users
  robots.forEach(r => addUserToList({ name: r.name, dp: r.dp, status: 'online', gender: r.gender }));
}

function addUserToList(u) {
  const li = document.createElement('li');
  li.className = 'user-row';
  li.innerHTML = `
    <img src="${u.dp || 'https://i.ibb.co/0F8VbW5/default_dp.png'}" class="user-dp" />
    <div>
      <div class="user-name">${u.name}</div>
      <div style="font-size:12px;color:#666">${u.gender || ''} ${u.age ? '• ' + u.age + ' yrs' : ''}</div>
    </div>
  `;
  li.onclick = ()=> showUserDetails(u);
  userListEl.appendChild(li);
}

// Show user details in right panel
function showUserDetails(u){
  userDetailDp.src = u.dp || 'https://i.ibb.co/0F8VbW5/default_dp.png';
  userDetailName.textContent = u.name || '';
  userDetailAge.textContent = u.age ? 'Age: ' + u.age : '';
  userDetailGender.textContent = u.gender ? 'Gender: ' + u.gender : '';
  privateChatBtn.onclick = ()=> {
    // Create a simple private room id
    const roomId = [username, u.name].sort().join('_');
    // store current private room in localStorage and reload chat (simpler flow)
    localStorage.setItem('currentRoom', roomId);
    localStorage.setItem('currentRoomName', 'Private: ' + u.name);
    // clear messages view and rebind to private room
    messagesEl.innerHTML = '';
    bindMessages(roomId);
    alert('Private chat opened with ' + u.name + '.');
  };
}

// Messages binding utility
let currentBoundRoom = localStorage.getItem('currentRoom') || 'global';
function bindMessages(roomId){
  currentBoundRoom = roomId;
  // Use messages/<roomId>/ path
  const roomRef = ref(db, 'messages/' + roomId + '/');
  // Clear existing
  messagesEl.innerHTML = '';
  // Listen
  onChildAdded(roomRef, (snap)=>{
    const m = snap.val();
    const key = snap.key;
    renderMessage(m, key, roomRef);
  });
}

// Render message node
function renderMessage(m, key, roomRef){
  const div = document.createElement('div');
  const isMe = m.name === username;
  div.className = 'msg ' + (isMe ? 'me' : '');
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = `<strong>${m.name}</strong><div style="font-size:13px;margin-top:4px;">${m.text || ''}</div><div class="meta">${m.time || ''}</div>`;
  const img = document.createElement('img');
  img.src = m.dp || 'https://i.ibb.co/0F8VbW5/default_dp.png';
  img.className = 'user-dp';
  div.appendChild(img);
  div.appendChild(bubble);

  // Delete button for message owner or admin
  if (isMe || isAdmin) {
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.className = 'icon-btn';
    del.style.marginLeft = '8px';
    del.onclick = async ()=>{
      if(confirm('Delete this message?')) {
        await remove(ref(db, `messages/${currentBoundRoom}/${key}`));
      }
    };
    div.appendChild(del);
  }

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Bind initial (global) room
bindMessages(currentBoundRoom);

// Send message
sendBtn.addEventListener('click', async ()=>{
  const text = messageInput.value.trim();
  if(!text) return;
  const payload = {
    name: username,
    email: email || '',
    dp: 'https://i.ibb.co/0F8VbW5/default_dp.png',
    text,
    time: new Date().toLocaleTimeString()
  };
  await push(ref(db, `messages/${currentBoundRoom}`), payload);
  messageInput.value = '';
});

// Emoji button toggles user list (simple)
emojiBtn.addEventListener('click', ()=> {
  const ul = document.querySelector('.users-list');
  if(ul.style.display === 'none' || !ul.style.display) { ul.style.display = 'block'; }
  else { ul.style.display = 'none'; }
});

// Clear all messages (admin only)
clearChatBtn.addEventListener('click', async ()=>{
  if(!isAdmin) return alert('Only admin can clear chat');
  if(confirm('Clear all messages in this room?')) {
    await remove(ref(db, `messages/${currentBoundRoom}`));
    messagesEl.innerHTML = '';
  }
});

// Logout
logoutBtn.addEventListener('click', async ()=>{
  // set offline explicitly and clear local storage
  await set(ref(db, 'users/' + username + '/status'), 'offline');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  localStorage.removeItem('currentRoom');
  window.location.href = 'index.html';
});

// Periodically refresh users (and add robots)
setInterval(loadUsers, 6000);
loadUsers();

// Bots schedule — bots push messages to global room (or current public room)
function startBotSchedule(){
  // each bot sends on its own timer
  robots.forEach((bot, idx)=>{
    setInterval(async ()=>{
      const text = bot.messages[Math.floor(Math.random()*bot.messages.length)];
      const payload = { name: bot.name, dp: bot.dp, text, time: new Date().toLocaleTimeString() };
      await push(ref(db, 'messages/global'), payload);
    }, 25000 + idx * 8000); // staggered
  });
}
startBotSchedule();
