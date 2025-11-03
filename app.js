import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onValue, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// ===== Firebase Config =====
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
const storage = getStorage(app);

// ===== Elements =====
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
const dpUpload = document.getElementById("dpUpload");
const nameColorInput = document.getElementById("nameColor");
const msgColorInput = document.getElementById("msgColor");

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

// ===== Helper =====
function createMessageDiv(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<span style="color:${msg.nameColor}">${msg.name}:</span> <span style="color:${msg.msgColor}">${msg.text}</span>`;
  div.addEventListener("click",()=>{
    showUserProfile(msg);
  });
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ===== Utility: safe email key =====
function emailKey(email){
  return email.split('.').join('_');
}

// ===== Signup =====
signupBtn.addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const gender = document.getElementById("gender").value;
  const age = document.getElementById("age").value.trim();
  const city = document.getElementById("city").value.trim();
  const nameColor = nameColorInput.value || "#00bfff";
  const msgColor = msgColorInput.value || "#ffffff";
  const dpFile = dpUpload.files[0];

  if(!name || !email || !password){
    alert("Please fill Name, Email, Password"); 
    return;
  }

  let dpURL = "default.png";
  try{
    if(dpFile){
      const storageRef = sRef(storage, "dp/"+emailKey(email));
      await uploadBytes(storageRef, dpFile);
      dpURL = await getDownloadURL(storageRef);
    }

    await createUserWithEmailAndPassword(auth, email, password);

    currentUser = {name,email,gender,age,city,nameColor,msgColor,dpURL,online:true};
    localStorage.setItem("zhobUser", JSON.stringify(currentUser));

    update(ref(db,"users/"+emailKey(email)), currentUser);
    
    authSection.classList.add("hidden");
    chatSection.classList.remove("hidden");

    listenMessages();
    listenUsers();

  } catch(err){
    alert("Signup Error: "+err.message);
  }
});

// ===== Login =====
loginBtn.addEventListener("click", async ()=>{
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if(!email || !password){ alert("Enter Email and Password"); return; }

  try{
    await signInWithEmailAndPassword(auth,email,password);
    
    const userRef = ref(db,"users/"+emailKey(email));
    onValue(userRef, snapshot=>{
      currentUser = snapshot.val();
      if(!currentUser){
        alert("User data not found in database!");
        return;
      }
      currentUser.online = true;
      localStorage.setItem("zhobUser", JSON.stringify(currentUser));
      authSection.classList.add("hidden");
      chatSection.classList.remove("hidden");
      update(userRef,currentUser);
      listenMessages();
      listenUsers();
    });
    
  } catch(err){
    alert("Login Error: "+err.message);
  }
});

// ===== Logout =====
logoutBtn.addEventListener("click", ()=>{
  if(currentUser){
    const userRef = ref(db,"users/"+emailKey(currentUser.email));
    update(userRef,{online:false});
  }
  signOut(auth);
  localStorage.removeItem("zhobUser");
  chatSection.classList.add("hidden");
  authSection.classList.remove("hidden");
});

// ===== Send Message =====
sendBtn.addEventListener("click", ()=>{
  const text = messageInput.value.trim();
  if(!text) return;
  const msg = {
    name: currentUser.name,
    email: currentUser.email,
    text,
    nameColor: currentUser.nameColor,
    msgColor: currentUser.msgColor,
    dpURL: currentUser.dpURL,
    time: new Date().toLocaleTimeString(),
    private: chatTarget || null
  };
  push(ref(db, chatTarget ? "private/"+chatTarget+"/"+emailKey(currentUser.email) : "messages"), msg);
  messageInput.value="";
});

// ===== Listen Messages =====
function listenMessages(){
  messagesDiv.innerHTML="";
  onChildAdded(ref(db,"messages"), snapshot=>{
    const msg = snapshot.val();
    createMessageDiv(msg);
  });
}

// ===== Users Toggle =====
usersToggle.addEventListener("click",()=>{
  usersPanel.classList.toggle("hidden");
});

// ===== Listen Users =====
function listenUsers(){
  onValue(ref(db,"users"), snapshot=>{
    onlineList.innerHTML="";
    offlineList.innerHTML="";
    snapshot.forEach(child=>{
      const u = child.val();
      const li = document.createElement("li");
      li.textContent = u.name;
      li.style.cursor="pointer";
      li.addEventListener("click",()=>{ showUserProfile(u); });
      if(u.online){ onlineList.appendChild(li); }
      else { offlineList.appendChild(li); }
    });
  });
}

// ===== Show User Profile =====
function showUserProfile(u){
  profileName.textContent=u.name;
  profileEmail.textContent=u.email;
  profileGender.textContent=u.gender;
  profileAge.textContent=u.age;
  profileCity.textContent=u.city;
  profileDP.src=u.dpURL || "default.png";
  userProfile.classList.remove("hidden");
  chatTarget = emailKey(u.email);
}

// ===== Close Profile =====
closeProfile.addEventListener("click",()=>{
  userProfile.classList.add("hidden");
  chatTarget = null;
});

// ===== Init if already logged in =====
window.addEventListener("load",()=>{
  const user = JSON.parse(localStorage.getItem("zhobUser"));
  if(user){
    currentUser = user;
    authSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
    listenMessages();
    listenUsers();
    update(ref(db,"users/"+emailKey(currentUser.email)), {...currentUser, online:true});
  }
});
