import { auth, db } from './firebase_config.js';
import { ref, push, onChildAdded, update, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const messagesDiv = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const logoutBtn = document.getElementById('logoutBtn');

const userUid = localStorage.getItem('userUid');

auth.onAuthStateChanged(user => {
  if (!user) location.href = 'login.html';

  const messagesRef = ref(db, 'messages');
  onChildAdded(messagesRef, snap => {
    const msg = snap.val();
    const div = document.createElement('div');
    div.style.color = msg.textColor || '#000';
    div.innerHTML = `<b style="color:${msg.nameColor||'#000'}">${msg.name}</b>: ${msg.text}`;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
});

sendBtn.addEventListener('click', () => {
  const text = msgInput.value.trim();
  if (!text) return;
  push(ref(db, 'messages'), {
    name: userUid, // we can change to real name
    text,
    nameColor: '#000000',
    textColor: '#000000',
    timestamp: Date.now()
  });
  msgInput.value = '';
});

logoutBtn.addEventListener('click', () => {
  auth.signOut();
  localStorage.removeItem('userUid');
  location.href = 'login.html';
});
