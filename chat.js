import { auth, db } from './firebase_config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');
const logoutBtn = document.getElementById('logoutBtn');

let userName = "User";

onAuthStateChanged(auth, (user) => {
  if (user) {
    userName = user.email.split('@')[0]; // Email سے simple name بناؤ
  } else {
    location.href = 'index.html';
  }
});

sendBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  await push(ref(db, 'messages'), {
    name: userName,
    text: text,
    time: Date.now()
  });
  messageInput.value = '';
});

onChildAdded(ref(db, 'messages'), (snapshot) => {
  const msg = snapshot.val();
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<strong>${msg.name}:</strong> ${msg.text}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

logoutBtn.addEventListener('click', () => {
  signOut(auth);
  location.href = 'index.html';
});
