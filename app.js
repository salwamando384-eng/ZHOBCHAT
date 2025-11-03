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

// Elements
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");
const usersToggle = document.getElementById("usersToggle");
const usersPanel = document.querySelector(".users-panel");
const onlineList = document.getElementById("onlineList");
const offlineList = document.getElementById("offlineList");
const authSection = document.getElementById("auth-section");
const chatSection = document.getElementById("chat-section");
const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emojiPicker");
const userProfile = document.getElementById("userProfile");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileGender = document.getElementById("profileGender");
const profileAge = document.getElementById("profileAge");
const profileCity = document.getElementById("profileCity");
const profileDP = document.getElementById("profileDP");
const privateChatBtn = document.getElementById("privateChatBtn");
const closeProfile = document.getElementById("closeProfile");

let currentUser = null;
let chatTarget = null;
const userColors = {};
function getRandomColor(){ return "#"+Math.floor(Math.random()*16777215).toString(16); }

// ===== Signup =====
signupBtn.addEventListener("click",()=>{
  const name=document.getElementById("name").value.trim();
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value.trim();
  const gender=document.getElementById("gender").value.trim();
  const age=document.getElementById("age").value.trim();
  const city=document.getElementById("city").value.trim();
  
  if(!name||!email||!password){ alert("Fill Name, Email, Password!"); return; }

  createUserWithEmailAndPassword(auth,email,password)
  .then(u=>{
    currentUser={name,email,gender,age,city,dp:"default.png"};
    userColors[name]=getRandomColor();
    set(ref(db,"users/"+name),currentUser);
    authSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
  }).catch(e=>alert(e.message));
});

// ===== Login =====
loginBtn.addEventListener("click",()=>{
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value.trim();
  signInWithEmailAndPassword(auth,email,password)
  .then(u=>{
    const name=email.split("@")[0];
    currentUser={name,email,dp:"default.png"};
    userColors[name]=getRandomColor();
    set(ref(db,"users/"+name+"/online"),true);
    authSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
  }).catch(e=>alert(e.message));
});

// ===== Logout =====
logoutBtn.addEventListener("click",()=>{
  signOut(auth);
  if(currentUser) remove(ref(db,"users/"+currentUser.name+"/online"));
  currentUser=null;
  authSection.classList.remove("hidden");
  chatSection.classList.add("hidden");
});

// ===== Send Message =====
sendBtn.addEventListener("click",()=>{
  const text=messageInput.value.trim();
  if(!text) return;
  push(ref(db,"messages"),{
    name:currentUser.name,
    text:text,
    color:userColors[currentUser.name],
    time:new Date().toLocaleTimeString(),
    target:chatTarget||""
  });
  messageInput.value="";
});

// ===== Receive Messages =====
onChildAdded(ref(db,"messages"),snapshot=>{
  const msg=snapshot.val();
  const div=document.createElement("div");
  div.classList.add(msg.target? "private-message":"message");
  div.classList.add(msg.name===currentUser.name?"user":"other");
  div.style.borderLeft=`4px solid ${msg.color}`;
  div.textContent=`${msg.name}: ${msg.text} (${msg.time})`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop=messagesDiv.scrollHeight;
});

// ===== Toggle Users Panel =====
usersToggle.addEventListener("click",()=>usersPanel.classList.toggle("hidden"));

// ===== Online / Offline Users =====
onValue(ref(db,"users"),snapshot=>{
  onlineList.innerHTML="";
  offlineList.innerHTML="";
  snapshot.forEach(snap=>{
    const user=snap.val();
    const li=document.createElement("li");
    li.textContent=user.name;
    li.style.color=userColors[user.name]||getRandomColor();
    li.addEventListener("click",()=>showProfile(user.name));
    if(user.online) onlineList.appendChild(li);
    else offlineList.appendChild(li);
  });
});

// ===== Show Profile =====
function showProfile(name){
  onValue(ref(db,"users/"+name),snapshot=>{
    const user=snapshot.val();
    if(!user) return;
    profileName.textContent=user.name;
    profileEmail.textContent=user.email||"";
    profileGender.textContent=user.gender||"";
    profileAge.textContent=user.age||"";
    profileCity.textContent=user.city||"";
    profileDP.src=user.dp||"default.png";
    userProfile.classList.remove("hidden");
    chatTarget=user.name;
  });
}

privateChatBtn.addEventListener("click",()=>{
  alert("Private Chat started with "+chatTarget);
  userProfile.classList.add("hidden");
});

closeProfile.addEventListener("click",()=>userProfile.classList.add("hidden"));

// ===== Emoji Picker =====
emojiBtn.addEventListener("click",()=>emojiPicker.classList.toggle("hidden"));
emojiPicker.querySelectorAll("span").forEach(span=>{
  span.addEventListener("click",e=>{
    messageInput.value+=e.target.textContent;
    emojiPicker.classList.add("hidden");
  });
});
