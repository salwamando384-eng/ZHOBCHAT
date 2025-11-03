import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onValue, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig={
  apiKey:"AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain:"zhobchat-33d8e.firebaseapp.com",
  databaseURL:"https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:"zhobchat-33d8e",
  storageBucket:"zhobchat-33d8e.appspot.com",
  messagingSenderId:"116466089929",
  appId:"1:116466089929:web:06e914c8ed81ba9391f218"
};

const app=initializeApp(firebaseConfig);
const db=getDatabase(app);
const auth=getAuth(app);

const signupBtn=document.getElementById("signupBtn");
const loginBtn=document.getElementById("loginBtn");
const logoutBtn=document.getElementById("logoutBtn");
const sendBtn=document.getElementById("sendBtn");
const messageInput=document.getElementById("messageInput");
const messagesDiv=document.getElementById("messages");
const usersList=document.getElementById("usersList");
const authSection=document.getElementById("auth-section");
const chatSection=document.getElementById("chat-section");
const deleteAllBtn=document.getElementById("deleteAllBtn");

let currentUser=null;

// Signup
signupBtn.addEventListener("click",()=>{
  const name=document.getElementById("name").value.trim();
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value.trim();
  if(!name||!email||!password)return alert("Fill all fields");
  createUserWithEmailAndPassword(auth,email,password)
  .then(userCred=>{
    currentUser={name,email};
    authSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
    set(ref(db,"online/"+name),true);
  }).catch(err=>alert(err.message));
});

// Login
loginBtn.addEventListener("click",()=>{
  const name=document.getElementById("name").value.trim();
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value.trim();
  if(!name||!email||!password)return alert("Fill all fields");
  signInWithEmailAndPassword(auth,email,password)
  .then(userCred=>{
    currentUser={name,email};
    authSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
    set(ref(db,"online/"+name),true);
  }).catch(err=>alert(err.message));
});

// Logout
logoutBtn.addEventListener("click",()=>{
  if(currentUser) remove(ref(db,"online/"+currentUser.name));
  signOut(auth);
  authSection.classList.remove("hidden");
  chatSection.classList.add("hidden");
});

// Send message
sendBtn.addEventListener("click",()=>{
  const text=messageInput.value.trim();
  if(!text) return;
  push(ref(db,"messages"),{
    name:currentUser.name,
    text,
    time:new Date().toLocaleTimeString()
  });
  messageInput.value="";
});

// Show messages
onChildAdded(ref(db,"messages"),snapshot=>{
  const msg=snapshot.val();
  const div=document.createElement("div");
  div.textContent=`[${msg.time}] ${msg.name}: ${msg.text}`;
  div.classList.add("message",msg.name===currentUser.name?"user":"other");
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop=messagesDiv.scrollHeight;
});

// Online users
onValue(ref(db,"online"),snapshot=>{
  usersList.innerHTML="";
  const users=snapshot.val()||{};
  Object.keys(users).forEach(u=>{
    const li=document.createElement("li");
    li.textContent=u;
    usersList.appendChild(li);
  });
});

// Admin delete all
deleteAllBtn.addEventListener("click",()=>{
  if(confirm("Delete all messages?")) remove(ref(db,"messages"));
});
