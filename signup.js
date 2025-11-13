// signup.js (robust version — paste/replace your old signup.js)
import { auth, db } from './firebase_config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set as dbSet } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const signupForm = document.getElementById('signupForm');
const statusDiv = document.getElementById('status');

function showStatus(text, color = "#000") {
  if (statusDiv) {
    statusDiv.style.color = color;
    statusDiv.textContent = text;
  }
  console.log("[signup] " + text);
}

// Ensure persistence is set before creating account
(async function ensurePersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence);
    showStatus("Auth persistence enabled (local).", "green");
  } catch (err) {
    console.warn("Could not set persistence:", err);
    showStatus("Warning: could not set persistence. Proceeding...", "#b85f00");
  }
})();

async function waitForAuth(timeoutMs = 8000) {
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(null); // timed out
      }
    }, timeoutMs);

    const off = onAuthStateChanged(auth, (user) => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        off(); // unsubscribe
        resolve(user || null);
      }
    });
  });
}

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showStatus("Signing up...", "#000");

  const name = document.getElementById('name').value.trim();
  const age = document.getElementById('age').value;
  const gender = document.getElementById('gender').value;
  const city = document.getElementById('city').value.trim();
  const nameColor = document.getElementById('nameColor').value;
  const textColor = document.getElementById('textColor').value;
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!name || !email || !password) {
    showStatus("Please fill required fields (name, email, password).", "red");
    return;
  }

  try {
    // 1) Create account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    showStatus("Account created in Firebase auth. Saving profile...", "green");

    // 2) Save profile in Realtime DB
    await dbSet(ref(db, 'users/' + uid), {
      name,
      age,
      gender,
      city,
      nameColor,
      textColor,
      dp: '', // default dp; no storage upload in free plan
      status: "online",
      joinedAt: new Date().toISOString()
    });
    showStatus("Profile saved. Waiting for auth state...", "green");

    // 3) Wait for auth state to reflect the signed-in user (timeout if something blocks)
    const userNow = await waitForAuth(8000); // wait up to 8s
    if (userNow && userNow.uid === uid) {
      showStatus("User is signed in. Redirecting to chat...", "green");
      localStorage.setItem('userUid', uid);
      // use replace so back-button doesn't go back to signup
      window.location.replace('chat.html');
      return;
    }

    // 4) Fallback: if auth state didn't update, try explicit sign-in (shouldn't normally be needed)
    showStatus("Auth state not detected automatically — trying explicit sign-in...", "#b85f00");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showStatus("Sign-in successful (fallback). Redirecting...", "green");
      localStorage.setItem('userUid', uid);
      window.location.replace('chat.html');
      return;
    } catch (signinErr) {
      console.warn("Fallback signIn failed:", signinErr);
      showStatus("Could not sign you in automatically. Please try logging in.", "red");
    }

  } catch (err) {
    console.error("Signup error:", err);
    // show user friendly messages for common errors
    if (err.code === 'auth/email-already-in-use') {
      showStatus("This email is already in use. Try logging in.", "red");
    } else if (err.code === 'auth/weak-password') {
      showStatus("Password is too weak (min 6 chars).", "red");
    } else if (err.code === 'auth/invalid-email') {
      showStatus("Invalid email address.", "red");
    } else {
      showStatus("Error: " + (err.message || err.toString()), "red");
    }
  }
});
