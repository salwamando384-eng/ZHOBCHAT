import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onValue, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// DOM Elements
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");
const onlineUsers = document.getElementById("onlineUsers");
const offlineUsers = document.getElementById("offlineUsers");
const authSection = document.getElementById("auth-section");
const chatSection = document.getElementById("chat-section");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emojiPicker");
const userProfile = document.getElementById("userProfile");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const privateChatBtn = document.getElementById("privateChatBtn");
const closeProfile = document.getElementById("closeProfile");

let currentUser = null;
let chatTarget = null;
const userColors = {};

// Random color for each user
function getRandomColor(){ return "#"+Math.floor(Math.random()*16777215).toString(16); }

// Signup
signupBtn.addEventListener("click",()=>{
  const name=document.getElementById("name").value.trim();
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value.trim();
  if(!name||!email||!password) return alert("Fill all fields");
  createUserWithEmailAndPassword(auth,email,password)
  .then(()=>{ currentUser={name,email}; startChat(); })
  .catch(err=>alert(err.message));
});

// Login
loginBtn.addEventListener("click",()=>{
  const name=document.getElementById("name").value.trim();
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value.trim();
  if(!name||!email||!password) return alert("Fill all fields");
  signInWithEmailAndPassword(auth,email,password)
  .then(()=>{ currentUser={name,email}; startChat(); })
  .catch(err=>alert(err.message));
});

// Start Chat
function startChat(){
  authSection.classList.add("hidden");
  chatSection.classList.remove("hidden");
  if(!userColors[currentUser.name]) userColors[currentUser.name] = getRandomColor();
  set(ref(db,"online/"+currentUser.name), {email:currentUser.email,color:userColors[currentUser.name]});
  loadUsers();
  loadMessages("messages");
}

// Logout
logoutBtn.addEventListener("click",()=>{
  if(currentUser) remove(ref(db,"online/"+currentUser.name));
  signOut(auth);
  authSection.classList.remove("hidden");
  chatSection.classList.add("hidden");
  currentUser=null;
  chatTarget=null;
  messagesDiv.innerHTML="";
});

// Send message
sendBtn.addEventListener("click", sendMessage);
function sendMessage(){
  const text = messageInput.value.trim();
  if(!text) return;
  const path = chatTarget ? `private/${[currentUser.name,chatTarget].sort().join("_")}` : "messages";
  push(ref(db,path),{
    name:currentUser.name,
    target:chatTarget||"",
    text:text,
    color:userColors[currentUser.name],
    time:new Date().toLocaleTimeString()
  });
  messageInput.value="";
}

// Load messages
function loadMessages(path){
  messagesDiv.innerHTML="";
  onChildAdded(ref(db,path), snapshot=>{
    const msg = snapshot.val();
    if(chatTarget && msg.target!==currentUser.name && msg.target!==chatTarget) return;
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(msg.name===currentUser.name ? "user" : "other");
    div.style.color=msg.color;
    div.textContent = `[${msg.time}] ${msg.name}: ${msg.text}`;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// Load online/offline users
function loadUsers(){
  onValue(ref(db,"online"), snapshot=>{
    onlineUsers.innerHTML="";
    const users = snapshot.val() || {};
    Object.keys(users).forEach(name=>{
      const li=document.createElement("li");
      li.textContent=name;
      li.style.color=users[name].color;
      li.addEventListener("click",()=>showProfile(name,users[name].email));
      onlineUsers.appendChild(li);
    });
  });
}

// Show profile modal
function showProfile(name,email){
  profileName.textContent=name;
  profileEmail.textContent=email;
  chatTarget = name;
  userProfile.classList.remove("hidden");
}

// Close profile
closeProfile.addEventListener("click", ()=>{
  userProfile.classList.add("hidden");
  chatTarget=null;
});

// Start private chat
privateChatBtn.addEventListener("click", ()=>{
  loadMessages(`private/${[currentUser.name,chatTarget].sort().join("_")}`);
  userProfile.classList.add("hidden");
});

// Admin delete all messages
deleteAllBtn.addEventListener("click", ()=>{
  if(currentUser.name==="Admin") remove(ref(db,"messages"));
  else alert("Only Admin can delete messages");
});

// Emoji picker
emojiBtn.addEventListener("click",()=>emojiPicker.classList.toggle("hidden"));
emojiPicker.querySelectorAll("span").forEach(e=>{
  e.addEventListener("click",()=>{ messageInput.value+=e.textContent; });
});
