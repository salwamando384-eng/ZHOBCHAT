// chat.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, onValue, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getStorage, ref as sRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// ===== same firebaseConfig =====
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
const appDiv = el('app');
const messagesDiv = el('messages');
const onlineList = el('onlineList');
const sendBtn = el('sendBtn');
const messageInput = el('messageInput');
const logoutBtn = el('logoutBtn');
const currentName = el('currentName');
const currentDP = el('currentDP');
const onlineCountEl = el('onlineCount');

const profilePanel = el('profilePanel');
const profileDP = el('profileDP');
const profileName = el('profileName');
const profileInfo = el('profileInfo');
const closeProfile = el('closeProfile');
const startPrivateBtn = el('startPrivateBtn');
const viewProfileBtn = el('viewProfileBtn');

let currentUser = null;
let chatTarget = null; // for private (not fully implemented threads here)

// Auth guard — redirect to index if not logged in
onAuthStateChanged(auth, async (user) => {
  if(!user){
    window.location.href = "index.html";
    return;
  }
  // user is logged in
  currentUser = user;
  // fetch user data from DB
  const key = emailKey(user.email);
  const userRef = ref(db,"users/"+key);
  onValue(userRef, snap=>{
    const u = snap.val();
    if(u){
      currentName.textContent = u.name || user.email;
      currentDP.src = u.dpURL || "default_dp.png";
    }
  });
  // show app
  appDiv.classList.remove('hidden');

  // mark online true (persist until explicit logout)
  update(ref(db,"users/"+key), { online:true });

  // start listening
  listenMessages();
  listenUsers();
});

// Send message
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown',(e)=>{ if(e.key === "Enter") sendMessage(); });

function sendMessage(){
  const text = messageInput.value.trim();
  if(!text || !currentUser) return;
  const userKey = emailKey(currentUser.email);
  // message object
  const msg = {
    name: currentUser.displayName || null,
    email: currentUser.email,
    text,
    time: new Date().toLocaleTimeString()
  };
  push(ref(db,"messages"), msg);
  messageInput.value = "";
}

// listen messages
function listenMessages(){
  messagesDiv.innerHTML = "";
  onChildAdded(ref(db,"messages"), snapshot=>{
    const msg = snapshot.val();
    appendMessage(msg);
  });
}
function appendMessage(msg){
  const row = document.createElement('div');
  row.className = "msg-row";
  const dp = document.createElement('img');
  dp.className = "msg-dp";
  dp.src = msg.dpURL || "default_dp.png";

  const bubble = document.createElement('div');
  bubble.className = "msg-bubble";

  const meta = document.createElement('div');
  meta.className = "msg-meta";

  const nameDiv = document.createElement('div');
  nameDiv.className = "msg-name";
  nameDiv.textContent = msg.name || msg.email;

  // colon is visual (we display name + :)
  const colon = document.createElement('span');
  colon.textContent = ":";

  const textDiv = document.createElement('div');
  textDiv.className = "msg-text";
  textDiv.textContent = msg.text;

  const timeDiv = document.createElement('div');
  timeDiv.className = "msg-time";
  timeDiv.textContent = msg.time || "";

  // apply colors if present
  if(msg.nameColor) nameDiv.style.color = msg.nameColor;
  if(msg.msgColor) textDiv.style.color = msg.msgColor;

  meta.appendChild(nameDiv);
  meta.appendChild(colon);
  bubble.appendChild(meta);
  bubble.appendChild(textDiv);
  bubble.appendChild(timeDiv);

  // click on dp or name opens profile
  dp.addEventListener('click', ()=> showUserProfileByEmail(msg.email));
  nameDiv.addEventListener('click', ()=> showUserProfileByEmail(msg.email));

  row.appendChild(dp);
  row.appendChild(bubble);
  messagesDiv.appendChild(row);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// listen users
function listenUsers(){
  onValue(ref(db,"users"), snapshot=>{
    onlineList.innerHTML = "";
    let count = 0;
    snapshot.forEach(child=>{
      const u = child.val();
      const li = document.createElement('li');
      li.className = "user-item";
      const img = document.createElement('img');
      img.src = u.dpURL || "default_dp.png";
      const nameDiv = document.createElement('div');
      nameDiv.className = "user-name";
      nameDiv.textContent = u.name || u.email;
      li.appendChild(img);
      li.appendChild(nameDiv);
      li.addEventListener('click', ()=> showUserProfile(u));
      onlineList.appendChild(li);
      if(u.online) count++;
    });
    onlineCountEl.textContent = `(${count})`;
  });
}

// show profile panel
function showUserProfile(u){
  profileDP.src = u.dpURL || "default_dp.png";
  profileName.textContent = u.name || u.email;
  profileInfo.textContent = `${u.age || ''} · ${u.gender || ''} · ${u.city || ''}`;
  profilePanel.classList.remove('hidden');
}
function showUserProfileByEmail(email){
  const key = emailKey(email);
  onValue(ref(db,"users/"+key), snap=>{
    const u = snap.val();
    if(u) showUserProfile(u);
  }, { onlyOnce:true });
}

// close profile
closeProfile.addEventListener('click', ()=> profilePanel.classList.add('hidden'));

// logout
logoutBtn.addEventListener('click', async ()=>{
  if(!currentUser) return;
  const key = emailKey(currentUser.email);
  await update(ref(db,"users/"+key), { online:false });
  await signOut(auth);
  window.location.href = "index.html";
});
