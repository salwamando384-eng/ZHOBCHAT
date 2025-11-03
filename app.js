import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onValue, set, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// ===== Firebase Config =====
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

// ===== Elements =====
const signupBtn=document.getElementById("signupBtn");
const loginBtn=document.getElementById("loginBtn");
const logoutBtn=document.getElementById("logoutBtn");
const sendBtn=document.getElementById("sendBtn");
const messageInput=document.getElementById("messageInput");
const messagesDiv=document.getElementById("messages");
const usersToggle=document.getElementById("usersToggle");
const usersPanel=document.querySelector(".users-panel");
const onlineList=document.getElementById("onlineList");
const offlineList=document.getElementById("offlineList");
const authSection=document.getElementById("auth-section");
const chatSection=document.getElementById("chat-section");
const userProfile=document.getElementById("userProfile");
const profileName=document.getElementById("profileName");
const profileEmail=document.getElementById("profileEmail");
const profileGender=document.getElementById("profileGender");
const profileAge=document.getElementById("profileAge");
const profileCity=document.getElementById("profileCity");
const profileDP=document.getElementById("profileDP");
const privateChatBtn=document.getElementById("privateChatBtn");
const closeProfile=document.getElementById("closeProfile");

let currentUser=null;
let chatTarget=null;
const userColors={};
const messageColors={};

function getRandomColor(){ return "#"+Math.floor(Math.random()*16777215).toString(16); }

// ===== Signup =====
signupBtn.addEventListener("click",()=>{
  const name=document.getElementById("name").value.trim();
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value.trim();
  const gender=document.getElementById("gender").value.trim();
  const age=document.getElementById("age").value.trim();
  const city=document.getElementById("city").value.trim();
  const nameColor=document.getElementById("nameColor").value.trim()||"#00bfff";
  const msgColor=document.getElementById("msgColor").value.trim()||"#ffffff";

  if(!name||!email||!password){ alert("Fill Name, Email, Password!"); return; }

  userColors[name]=nameColor;
  messageColors[name]=msgColor;

  createUserWithEmailAndPassword(auth,email,password).then(u=>{
    currentUser={name,email,gender,age,city,dp:"default.png",nameColor,msgColor,online:true};
    set(ref(db,"users/"+name),currentUser);
    authSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
  }).catch(e=>alert(e.message));
});

// ===== Login =====
loginBtn.addEventListener("click",()=>{
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value.trim();
  if(!email||!password){ alert("Fill Email & Password!"); return; }

  signInWithEmailAndPassword(auth,email,password).then(userCredential=>{
    const u=userCredential.user;
    // Fetch user info from DB
    onValue(ref(db,"users"),snapshot=>{
      snapshot.forEach(child=>{
        if(child.val().email===email){
          currentUser=child.val();
          authSection.classList.add("hidden");
          chatSection.classList.remove("hidden");
          update(ref(db,"users/"+currentUser.name),{online:true});
        }
      });
    });
  }).catch(e=>alert(e.message));
});

// ===== Logout =====
logoutBtn.addEventListener("click",()=>{
  if(currentUser){
    update(ref(db,"users/"+currentUser.name),{online:false});
    currentUser=null;
  }
  authSection.classList.remove("hidden");
  chatSection.classList.add("hidden");
});

// ===== Toggle Users Panel =====
usersToggle.addEventListener("click",()=>{
  usersPanel.classList.toggle("hidden");
});

// ===== Send Message =====
sendBtn.addEventListener("click",()=>{
  const text=messageInput.value.trim();
  if(!text||!currentUser)return;

  const msgData={
    sender:currentUser.name,
    text,
    time:new Date().toLocaleTimeString(),
    nameColor:currentUser.nameColor,
    msgColor:currentUser.msgColor,
    privateTo:chatTarget||null
  };

  push(ref(db,"messages"),msgData);
  messageInput.value="";
  chatTarget=null; // reset after sending
});

// ===== Display Messages =====
onChildAdded(ref(db,"messages"),snapshot=>{
  const msg=snapshot.val();
  if(msg.privateTo && msg.privateTo!==currentUser?.name && msg.sender!==currentUser?.name) return;

  const div=document.createElement("div");
  div.classList.add("message");
  div.style.color=msg.msgColor;
  div.innerHTML=`<span style="color:${msg.nameColor}; font-weight:bold;">${msg.sender}:</span> ${msg.text}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop=messagesDiv.scrollHeight;
});

// ===== Users List =====
onValue(ref(db,"users"),snapshot=>{
  onlineList.innerHTML=""; offlineList.innerHTML="";
  snapshot.forEach(child=>{
    const u=child.val();
    const li=document.createElement("li");
    li.textContent=u.name;
    li.style.color=u.nameColor||"#00bfff";
    li.addEventListener("click",()=>showUserProfile(u));
    if(u.online){
      onlineList.appendChild(li);
    }else{
      offlineList.appendChild(li);
    }
  });
});

// ===== Show User Profile =====
function showUserProfile(u){
  profileName.textContent=u.name;
  profileEmail.textContent=u.email;
  profileGender.textContent=u.gender;
  profileAge.textContent=u.age;
  profileCity.textContent=u.city;
  profileDP.src=u.dp||"default.png";
  userProfile.classList.remove("hidden");

  privateChatBtn.onclick=()=>{
    chatTarget=u.name;
    userProfile.classList.add("hidden");
  };
}

closeProfile.addEventListener("click",()=>userProfile.classList.add("hidden"));
