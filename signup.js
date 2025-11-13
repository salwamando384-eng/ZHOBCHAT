import { auth, db } from './firebase_config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const signupForm = document.getElementById('signupForm');
const statusDiv = document.getElementById('status');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const age = document.getElementById('age').value;
  const gender = document.getElementById('gender').value;
  const city = document.getElementById('city').value.trim();
  const nameColor = document.getElementById('nameColor').value;
  const textColor = document.getElementById('textColor').value;
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Save user info in Realtime DB
    await set(ref(db, 'users/' + uid), {
      name,
      age,
      gender,
      city,
      nameColor,
      textColor,
      dp: '' // default, optional
    });

    // Store uid in localStorage for session
    localStorage.setItem('userUid', uid);
    localStorage.setItem('userName', name);

    statusDiv.textContent = "Account created successfully!";
    location.href = 'chat.html';
  } catch (err) {
    statusDiv.textContent = "Error: " + err.message;
  }
});
