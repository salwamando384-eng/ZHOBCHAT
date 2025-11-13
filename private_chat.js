import { auth, db } from './firebase_config.js';
import { ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const messagesDiv = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const backBtn = document.getElementById('backBtn');

const userUid = localStorage.getItem('userUid');
const chatWithUid = localStorage.getItem('chatWith');

if (!userUid || !chatWithUid) location.href = 'chat.html';

auth.onAuthStateChanged(user => {
  if (!user) location.href = 'login.html';

  const privateRef = ref(db, `privateMessages/${userUid}_${chatWithUid}`);
  onChildAdded(privateRef, snap => {
    const msg = snap.val();
    const div = document.createElement('div');
    div.innerHTML = `<b>${msg.senderName}</b>: ${msg.text}`;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
});

sendBtn.addEventListener('click', () => {
  const text = msgInput.value.trim();
  if (!text) return;

  const messageObj = {
    sender: userUid,
    receiver: chatWithUid,
    senderName: userUid, // we can change to actual name
    text,
    timestamp: Date.now()
  };

  // Store in both user's private chat node
  push(ref(db, `privateMessages/${userUid}_${chatWithUid}`), messageObj);
  push(ref(db, `privateMessages/${chatWithUid}_${userUid}`), messageObj);

  msgInput.value = '';
});

backBtn.addEventListener('click', () => {
  location.href = 'chat.html';
});
