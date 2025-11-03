// index.js (module)
// Firebase v11 modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, set, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// ====== your firebaseConfig (from you) ======
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

// helpers
const el = id => document.getElementById(id);
const emailKey = (email) => email.split('.').join('_');

// DOM
const signupBtn = el('signupBtn');
const loginBtn = el('loginBtn');
const signupMsg = el('signupMsg');
const loginMsg = el('loginMsg');
const su_dp = el('su_dp');

// SIGNUP
signupBtn.addEventListener('click', async ()=>{
  signupMsg.textContent = "Signing up...";
  const name = el('su_name').value.trim();
  const gender = el('su_gender').value;
  const age = el('su_age').value.trim();
  const city = el('su_city').value.trim();
  const email = el('su_email').value.trim();
  const password = el('su_password').value;
  const nameColor = el('su_nameColor').value || "#ff4d4d";
  const msgColor = el('su_msgColor').value || "#ffffff";
  const dpFile = su_dp.files[0];

  if(!name || !email || !password){ signupMsg.textContent = "Fill name, email, password"; return; }

  try{
    // create auth user
    await createUserWithEmailAndPassword(auth, email, password);

    // upload dp if provided
    let dpURL = "default_dp.png";
    if(dpFile){
      const storageRef = sRef(storage, "dp/"+emailKey(email));
      await uploadBytes(storageRef, dpFile);
      dpURL = await getDownloadURL(storageRef);
    }

    // create user object
    const userObj = { name, email, gender, age, city, dpURL, nameColor, msgColor, online:true };
    const key = emailKey(email);
    await set(ref(db,"users/"+key), userObj);

    signupMsg.textContent = "Signup successful — Redirecting...";
    // keep session and redirect to chat page after small delay
    setTimeout(()=> window.location.href = "chat.html", 700);

  } catch(err){
    signupMsg.textContent = "Error: " + err.message;
  }
});

// LOGIN
loginBtn.addEventListener('click', async ()=>{
  loginMsg.textContent = "Logging in...";
  const email = el('li_email').value.trim();
  const password = el('li_password').value;
  if(!email || !password){ loginMsg.textContent = "Enter email and password"; return; }

  try{
    await signInWithEmailAndPassword(auth, email, password);
    // mark online true in DB
    const key = emailKey(email);
    await update(ref(db,"users/"+key), { online:true });
    // redirect
    window.location.href = "chat.html";
  } catch(err){
    loginMsg.textContent = "Error: " + err.message;
  }
});

// Keep signed in until logout — onAuthStateChanged used on chat page to persist session
onAuthStateChanged(auth, (user)=>{
  // we don't auto-redirect away from index if already logged in, but could
  if(user){
    // optional: if user on index page and logged in, go to chat
    // window.location.href = "chat.html";
  }
});
