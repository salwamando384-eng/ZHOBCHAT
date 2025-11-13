import { auth, db } from './firebase_config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');

let userName = "Anonymous"; // default

// ✅ جب user login ہوا، اس کا UID اور نام Firebase DB سے لوڈ کرو
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const snapshot = await get(ref(db, 'users/' + uid));
    if (snapshot.exists()) {
      const userData = snapshot.val();
      userName = userData.name || "User";
    }
  }
});

sendBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  await push(ref(db, 'messages'), {
    name: userName,
    text
  });

  messageInput.value = '';
});

// ✅ Messages display
onChildAdded(ref(db, 'messages'), (data) => {
  const msg = data.val();
  const div = document.createElement('div');
  div.textContent = `${msg.name}: ${msg.text}`;
  messagesDiv.appendChild(div);
});
