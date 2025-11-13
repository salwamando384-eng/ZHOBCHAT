import { auth, db } from './firebase_config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    // Find user by name in database
    let userUid = null;
    const snapshot = await get(ref(db, 'users'));
    snapshot.forEach(child => {
      if (child.val().name === name) {
        userUid = child.key;
      }
    });

    if (!userUid) throw new Error('User not found');

    // Use email hack (since signup uses dummy email)
    const email = name.replace(/\s+/g, '') + Date.now() + '@example.com';

    await signInWithEmailAndPassword(auth, email, password);

    localStorage.setItem('userUid', userUid);

    window.location.href = "chat.html";

  } catch (error) {
    alert(error.message);
  }
});
