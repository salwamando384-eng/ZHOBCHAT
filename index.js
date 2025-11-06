// index.js (module)
import { auth, db, storage } from "./firebase_config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref as dbRef, set, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const el = id => document.getElementById(id);

// tabs
const tabLogin = el('tabLogin'), tabSignup = el('tabSignup');
const loginForm = el('loginForm'), signupForm = el('signupForm');

tabLogin.addEventListener('click', ()=> { tabLogin.classList.add('active'); tabSignup.classList.remove('active'); loginForm.classList.remove('hidden'); signupForm.classList.add('hidden'); });
tabSignup.addEventListener('click', ()=> { tabSignup.classList.add('active'); tabLogin.classList.remove('active'); signupForm.classList.remove('hidden'); loginForm.classList.add('hidden'); });

// login
const loginBtn = el('loginBtn'), loginMsg = el('loginMsg');
loginBtn.addEventListener('click', async ()=>{
  loginMsg.textContent = "Logging in…";
  const email = el('li_email').value.trim();
  const password = el('li_password').value;
  if(!email || !password){ loginMsg.textContent = "Enter email & password"; return; }
  try{
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.textContent = "Success — Redirecting…";
    location.href = "chat.html";
  } catch(e){ loginMsg.textContent = e.message; }
});

// signup
const signupBtn = el('signupBtn'), signupMsg = el('signupMsg');
signupBtn.addEventListener('click', async ()=>{
  signupMsg.textContent = "Signing up…";
  const name = el('su_name').value.trim();
  const gender = el('su_gender').value;
  const age = el('su_age').value;
  const city = el('su_city').value.trim();
  const email = el('su_email').value.trim();
  const password = el('su_password').value;
  const nameColor = el('su_nameColor').value || "#e74c3c";
  const msgColor = el('su_msgColor').value || "#000000";
  const dpFile = el('su_dp').files[0];

  if(!name || !email || !password){ signupMsg.textContent = "Name, email, password required"; return; }
  try{
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;
    // upload dp if any
    let dpURL = "default_dp.png";
    if(dpFile){
      const path = `dp/${user.uid}/${dpFile.name}`;
      const sref = sRef(storage, path);
      await uploadBytes(sref, dpFile);
      dpURL = await getDownloadURL(sref);
    }
    // update displayName locally
    await updateProfile(user, { displayName: name, photoURL: dpURL }).catch(()=>{});
    // save to RTDB
    const userObj = { name, email, gender, age, city, dpURL, nameColor, msgColor, online:true, uid:user.uid, theme: "default" };
    await set(dbRef(db, "users/" + user.uid), userObj);
    signupMsg.textContent = "Signup successful — Redirecting…";
    setTimeout(()=> location.href = "chat.html", 700);
  } catch(e){
    signupMsg.textContent = e.message;
  }
});

// if user already logged in, go to chat
onAuthStateChanged(auth, user=>{
  if(user) {
    location.href = "chat.html";
  }
});
