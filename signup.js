import { auth, db } from './firebase_config.js';
import { 
  createUserWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const signupForm = document.getElementById('signupForm');
const statusDiv = document.getElementById('status');

// ✅ Login session محفوظ رکھنے کے لیے (Fix redirect issue)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Auth persistence enabled (local storage).");
  })
  .catch((error) => {
    console.error("Persistence error:", error);
  });

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

  // ✅ Check required fields
  if (!name || !email || !password) {
    statusDiv.textContent = "Please fill in all required fields!";
    return;
  }

  try {
    // ✅ Create new user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // ✅ Store user info in Realtime Database
    await set(ref(db, 'users/' + uid), {
      name,
      age,
      gender,
      city,
      nameColor,
      textColor,
      dp: '' // optional profile picture (can be updated later)
    });

    // ✅ Success message
    statusDiv.textContent = "Account created successfully! Redirecting...";

    // ✅ Save UID in localStorage and redirect
    localStorage.setItem('userUid', uid);
    window.location.href = 'chat.html';

  } catch (err) {
    // ✅ Error handling
    statusDiv.textContent = "Error: " + err.message;
    console.error("Signup error:", err);
  }
});
