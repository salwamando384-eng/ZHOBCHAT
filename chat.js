import { auth, db } from './firebase_config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');
const logoutBtn = document.getElementById('logoutBtn');
const profileBtn = document.getElementById('profileBtn');

let currentUser = null;
let userName = "User";
let userDP = "default_dp.png";

// Load current user data
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = 'index.html';
    return;
  }
  currentUser = user;

  // Get user info from database
  const snapshot = await get(ref(db, 'users/' + user.uid));
  if (snapshot.exists()) {
    const data = snapshot.val();
    userName = data.name || user.email.split('@')[0];
    userDP = data.dp || 'default_dp.png';
  }
});

// Send Message
sendBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  await push(ref(db, 'messages'), {
    name: userName,
    dp: userDP,
    text: text,
    time: Date.now()
  });
  messageInput.value = '';
});

// Receive messages
onChildAdded(ref(db, 'messages'), (snapshot) => {
  const msg = snapshot.val();
  const div = document.createElement('div');
  div.classList.add('message');

  const dpImg = document.createElement('img');
  dpImg.src = msg.dp || 'default_dp.png';
  dpImg.classList.add('dp');

  const textDiv = document.createElement('div');
  textDiv.classList.add('text-content');
  textDiv.innerHTML = `<strong>${msg.name}:</strong> ${msg.text}`;

  div.appendChild(dpImg);
  div.appendChild(textDiv);
  messagesDiv.appendChild(div);

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Logout
logoutBtn.addEventListener('click', () => {
  signOut(auth);
  location.href = 'index.html';
});

// Go to Profile
profileBtn.addEventListener('click', () => {
  location.href = 'profile.html';
});
