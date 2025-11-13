import { auth, db } from './firebase_config.js';
import { ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const uid = localStorage.getItem('userUid');
if (!uid) {
  location.href = 'login.html';
}

const chatBox = document.getElementById('chatBox');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const logoutBtn = document.getElementById('logoutBtn');

const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const closeModal = document.getElementById('closeModal');
const saveProfile = document.getElementById('saveProfile');
const profileName = document.getElementById('profileName');
const profileCity = document.getElementById('profileCity');

// Logout
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  localStorage.removeItem('userUid');
  location.href = 'login.html';
});

// Profile modal
profileBtn.addEventListener('click', () => {
  profileModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
  profileModal.style.display = 'none';
});

// Save profile
saveProfile.addEventListener('click', async () => {
  await update(ref(db, 'users/' + uid), {
    name: profileName.value,
    city: profileCity.value
  });
  profileModal.style.display = 'none';
});

// Chat messages listener (simple)
onValue(ref(db, 'messages/'), (snapshot) => {
  chatBox.innerHTML = '';
  snapshot.forEach(msgSnap => {
    const msg = msgSnap.val();
    const div = document.createElement('div');
    div.textContent = `${msg.name}: ${msg.text}`;
    chatBox.appendChild(div);
  });
});

// Send message
messageForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msgText = messageInput.value.trim();
  if (!msgText) return;
  const userSnap = await ref(db, 'users/' + uid);
  onValue(userSnap, (snapshot) => {
    const user = snapshot.val();
    const newMsgRef = ref(db, 'messages/' + Date.now());
    set(newMsgRef, {
      name: user.name,
      text: msgText
    });
  }, { once: true });
  messageInput.value = '';
});
