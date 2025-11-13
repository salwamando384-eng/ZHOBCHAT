import { db } from './firebase_config.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const userUid = localStorage.getItem('userUid');
if (!userUid) {
  // Redirect if not logged in
  location.href = 'login.html';
}

// Fetch user info from DB
const userRef = ref(db, 'users/' + userUid);
get(userRef).then(snapshot => {
  if (snapshot.exists()) {
    const user = snapshot.val();
    document.getElementById('welcomeMsg').textContent = `Welcome, ${user.name}!`;
    document.getElementById('chatContainer').style.color = user.textColor || '#000';
  }
});

// Logout button
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('userUid');
  localStorage.removeItem('userName');
  location.href = 'login.html';
});
