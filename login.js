import { auth, db } from './firebase_config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const loginForm = document.getElementById('loginForm');
const statusDiv = document.getElementById('status');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    // Try to sign in
    const userCredential = await signInWithEmailAndPassword(auth, username + "@zhobchat.com", password);
    localStorage.setItem('userUid', userCredential.user.uid);
    location.href = 'chat.html';
  } catch (err) {
    if(err.code === "auth/user-not-found"){
      // Auto-register new user
      const newUser = await createUserWithEmailAndPassword(auth, username + "@zhobchat.com", password);
      await set(ref(db, 'users/' + newUser.user.uid), {
        name: username,
        age: "",
        gender: "",
        city: "",
        dp: ""
      });
      localStorage.setItem('userUid', newUser.user.uid);
      location.href = 'chat.html';
    } else {
      statusDiv.textContent = "Error: " + err.message;
    }
  }
});
