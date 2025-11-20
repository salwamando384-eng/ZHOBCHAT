import { auth, db } from "./firebase_config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const liEmail = document.getElementById("liEmail");
const liPass = document.getElementById("liPass");
const loginBtn = document.getElementById("loginBtn");
const liMsg = document.getElementById("liMsg");

loginBtn.onclick = async ()=>{
  liMsg.textContent = "";
  const email = liEmail.value.trim();
  const pass = liPass.value;
  if(!email || !pass){ liMsg.textContent="Enter email & password"; return; }
  try{
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const uid = userCred.user.uid;
    await set(ref(db, `users/${uid}/online`), true);
    await set(ref(db, `users/${uid}/lastSeen`), Date.now());
    window.location.href = "chat.html";
  }catch(e){
    liMsg.textContent = e.message;
  }
}
