import { auth, db } from './firebase_config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');
const logoutBtn = document.getElementById('logoutBtn');

let userName = "User";

// ✅ Login ہونے کے بعد user کا نام Firebase سے حاصل کرو
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const userRef = ref(db, 'users/' + uid);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      userName = userData.name || "User";
    }
  } else {
    // اگر login نہیں ہوا تو واپس login صفحے پر بھیج دو
    location.href = "index.html";
  }
});

// ✅ جب "Send" دبایا جائے
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

// ✅ Messages کو Firebase سے live دکھاؤ
onChildAdded(ref(db, 'messages'), (snapshot) => {
  const msg = snapshot.val();
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<strong>${msg.name}:</strong> ${msg.text}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // خودکار scroll نیچے
});

// ✅ Logout
logoutBtn.addEventListener('click', () => {
  auth.signOut();
  localStorage.removeItem('userUid');
  location.href = 'index.html';
});
