import { auth, db } from './firebase_config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const signupForm = document.getElementById('signupForm');
const statusDiv = document.getElementById('status');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user info in DB
    await set(ref(db, 'users/' + user.uid), {
      name: name,
      email: email,
      dp: "default_dp.png"
    });

    statusDiv.textContent = "✅ Account created successfully!";
    setTimeout(() => {
      location.href = 'index.html';
    }, 1500);

  } catch (err) {
    statusDiv.textContent = "⚠️ " + err.message;
  }
});
