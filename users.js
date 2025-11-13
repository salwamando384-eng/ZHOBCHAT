import { db } from './firebase_config.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const usersDiv = document.getElementById('usersList');
const backBtn = document.getElementById('backBtn');

backBtn.addEventListener('click', () => {
  location.href = 'chat.html';
});

get(ref(db, 'users')).then(snapshot => {
  snapshot.forEach(child => {
    const u = child.val();
    const div = document.createElement('div');
    div.innerHTML = `<b>${u.name}</b> (${u.gender}) - ${u.city} 
      <button onclick="viewProfile('${child.key}')">Profile</button>
      <button onclick="startPrivateChat('${child.key}')">Chat</button>`;
    usersDiv.appendChild(div);
  });
});

window.viewProfile = (uid) => {
  localStorage.setItem('profileView', uid);
  location.href = 'profile.html';
}

window.startPrivateChat = (uid) => {
  localStorage.setItem('chatWith', uid);
  location.href = 'private_chat.html';
}
