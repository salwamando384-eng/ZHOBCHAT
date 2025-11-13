// Firebase imports
import { getDatabase, ref, push, onChildAdded } from "firebase/database";

// Firebase app already initialized in firebase_config.js
const db = getDatabase();

// DOM elements
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');

// Replace 'group1' with your actual chat room ID or user IDs for private chat
const chatRoomId = 'group1';
const messagesRef = ref(db, 'chats/' + chatRoomId);

// Send message
sendBtn.addEventListener('click', () => {
  const text = messageInput.value.trim();
  if (text !== '') {
    const newMessageRef = push(messagesRef);
    newMessageRef.set({
      text: text,
      sender: 'YourUsername', // replace with actual username
      timestamp: Date.now()
    });
    messageInput.value = '';
  }
});

// Listen for new messages
onChildAdded(messagesRef, (snapshot) => {
  const msg = snapshot.val();
  displayMessage(msg);
});

// Function to display messages in the UI
function displayMessage(msg) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message');

  const senderSpan = document.createElement('span');
  senderSpan.classList.add('sender');
  senderSpan.textContent = msg.sender + ': ';

  const textSpan = document.createElement('span');
  textSpan.classList.add('text');
  textSpan.textContent = msg.text;

  msgDiv.appendChild(senderSpan);
  msgDiv.appendChild(textSpan);

  messagesDiv.appendChild(msgDiv);

  // Scroll to bottom automatically
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
