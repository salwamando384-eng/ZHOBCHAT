import { auth } from './firebase_config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const statusDiv = document.getElementById('status');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem('userUid', userCredential.user.uid);
    location.href = 'chat.html';
  } catch (err) {
    statusDiv.textContent = "Error: " + err.message;
  }
});
