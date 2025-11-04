// index.js — Signup & Login (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  update
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// ---------- Firebase config (your project) ----------
const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.firebasestorage.app",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218",
  measurementId: "G-LX9P9LRLV8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

const $ = id => document.getElementById(id);
const emailKey = (e) => (e || '').split('.').join('_');

const signupBtn = $('signupBtn');
const loginBtn = $('loginBtn');
const showLogin = $('showLogin');
const showSignup = $('showSignup');

showLogin.addEventListener('click', (e) => { e.preventDefault(); $('signupBox').classList.add('hidden'); $('loginBox').classList.remove('hidden'); });
showSignup.addEventListener('click', (e) => { e.preventDefault(); $('loginBox').classList.add('hidden'); $('signupBox').classList.remove('hidden'); });

signupBtn.addEventListener('click', async () => {
  $('signupMsg').textContent = 'Signing up...';
  const name = $('su_name').value.trim();
  const gender = $('su_gender').value;
  const age = $('su_age').value.trim();
  const city = $('su_city').value.trim();
  const email = $('su_email').value.trim();
  const password = $('su_password').value;
  const nameColor = $('su_nameColor').value || '#ff4d4d';
  const msgColor = $('su_msgColor').value || '#ffffff';
  const dpFile = $('su_dp').files[0];

  if (!name || !email || !password) { $('signupMsg').textContent = 'Please fill name, email, password'; return; }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;
    const key = emailKey(email);

    // upload DP if provided
    let dpURL = 'default_dp.png';
    if (dpFile) {
      const storageRef = sRef(storage, 'dp/' + key);
      await uploadBytes(storageRef, dpFile);
      dpURL = await getDownloadURL(storageRef);
    }

    const userObj = {
      uid,
      email,
      name,
      gender,
      age,
      city,
      dpURL,
      nameColor,
      msgColor,
      online: true
    };

    await set(ref(db, 'users/' + key), userObj);

    $('signupMsg').textContent = 'Signup success — Redirecting...';
    setTimeout(() => { window.location.href = 'chat.html'; }, 700);
  } catch (err) {
    $('signupMsg').textContent = 'Error: ' + (err.message || err);
  }
});

loginBtn.addEventListener('click', async () => {
  $('loginMsg').textContent = 'Logging in...';
  const email = $('li_email').value.trim();
  const password = $('li_password').value;
  if (!email || !password) { $('loginMsg').textContent = 'Enter email and password'; return; }
  try {
    await signInWithEmailAndPassword(auth, email, password);
    const key = emailKey(email);
    await update(ref(db, 'users/' + key), { online: true });
    window.location.href = 'chat.html';
  } catch (err) {
    $('loginMsg').textContent = 'Error: ' + (err.message || err);
  }
});

// if already logged in, redirect to chat
onAuthStateChanged(auth, (user) => {
  if (user) {
    // user stays logged in until explicit logout
    // redirect to chat if user visits index
    window.location.href = 'chat.html';
  }
});
