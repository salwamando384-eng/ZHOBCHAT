import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, onChildAdded } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const myDp = document.getElementById("myDp");

onAuthStateChanged(auth, (user)=>{
  if(!user) location.href = "login.html";

  // Load user's DP
  fetchUserDp(user.uid);
});

async function fetchUserDp(uid){
  const dpRef = ref(db, "users/" + uid + "/dp");
  onChildAdded(dpRef, ()=>{}); // placeholder
}

/* Send Message */
sendBtn.onclick = ()=>{};
logoutBtn.onclick = ()=> signOut(auth);
