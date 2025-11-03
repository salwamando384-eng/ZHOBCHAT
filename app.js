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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// DOM Elements
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");
const usersList = document.getElementById("usersList");
const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emojiPicker");
const fileInput = document.getElementById("fileInput");
const fileBtn = document.getElementById("fileBtn");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const authSection = document.getElementById("auth-section");
const chatSection = document.getElementById("chat-section");

let currentUser = null;

// Signup
signupBtn.addEventListener("click",()=>{
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if(!name || !email || !password) return alert("Fill all fields");
  auth.createUserWithEmailAndPassword(email,password)
  .then(userCred=>{
    currentUser={name,email};
    localStorage.setItem("zhobUser",JSON.stringify(currentUser));
    authSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
    db.ref("online/"+name).set(true);
  }).catch(err=>alert(err.message));
});

// Login
loginBtn.addEventListener("click",()=>{
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if(!name||!email||!password) return alert("Fill all fields");
  auth.signInWithEmailAndPassword(email,password)
  .then(userCred=>{
    currentUser={name,email};
    localStorage.setItem("zhobUser",JSON.stringify(currentUser));
    authSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
    db.ref("online/"+name).set(true);
  }).catch(err=>alert(err.message));
});

// Logout
logoutBtn.addEventListener("click",()=>{
  if(currentUser) db.ref("online/"+currentUser.name).remove();
  auth.signOut();
  localStorage.removeItem("zhobUser");
  chatSection.classList.add("hidden");
  authSection.classList.remove("hidden");
});

// Send Message
sendBtn.addEventListener("click",()=>{
  const text = messageInput.value.trim();
  if(!text) return;
  db.ref("messages").push({
    name: currentUser.name,
    text,
    time: new Date().toLocaleTimeString()
  });
  messageInput.value="";
});

// Show Messages
db.ref("messages").on("child_added",snapshot=>{
  const msg = snapshot.val();
  const div = document.createElement("div");
  div.classList.add("message",msg.name===currentUser.name?"user":"other");
  div.textContent=`[${msg.time}] ${msg.name}: ${msg.text}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop=messagesDiv.scrollHeight;
});

// Online Users
db.ref("online").on("value",snapshot=>{
  usersList.innerHTML="";
  const users=snapshot.val()||{};
  Object.keys(users).forEach(u=>{
    const li=document.createElement("li");
    li.textContent=u;
    usersList.appendChild(li);
  });
});

// Delete all (admin)
deleteAllBtn.addEventListener("click",()=>{
  if(confirm("Delete all messages?")) db.ref("messages").remove();
});

// Auto-login
window.addEventListener("load",()=>{
  const stored=localStorage.getItem("zhobUser");
  if(stored){
    currentUser=JSON.parse(stored);
    authSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
    db.ref("online/"+currentUser.name).set(true);
  }
});
window.addEventListener("beforeunload",()=>{
  if(currentUser) db.ref("online/"+currentUser.name).remove();
});
