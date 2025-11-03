import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onValue, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

const signupBtn = document.getElementById("signupBtn");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
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
const userDetail = document.getElementById("user-detail");
const detailName = document.getElementById("detailName");
const detailEmail = document.getElementById("detailEmail");
const detailStatus = document.getElementById("detailStatus");
const privateMsgBtn = document.getElementById("privateMsgBtn");
const closeDetailBtn = document.getElementById("closeDetailBtn");

let currentUser = null;
let privateTarget = null;

// --- Sign up / login ---
signupBtn.addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if(name && email && password){
    currentUser = {name,email};
    localStorage.setItem("zhobUser", JSON.stringify(currentUser));
    set(ref(db, "online/"+name), true);
    authSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
  }else{ alert("Please fill all fields"); }
});

// --- Logout ---
logoutBtn.addEventListener("click", ()=>{
  remove(ref(db,"online/"+currentUser.name));
  localStorage.removeItem("zhobUser");
  chatSection.classList.add("hidden");
  authSection.classList.remove("hidden");
});

// --- Send message ---
sendBtn.addEventListener("click", ()=>{
  sendMessage(messageInput.value);
  messageInput.value = "";
});

function sendMessage(text, fileURL=null){
  if(!text && !fileURL) return;
  push(ref(db,"messages"),{
    name:currentUser.name,
    text:text || "",
    file:fileURL||"",
    time:new Date().toLocaleTimeString(),
    private: privateTarget || null
  });
}

// --- Show messages ---
onChildAdded(ref(db,"messages"), snapshot=>{
  const msg = snapshot.val();
  const div = document.createElement("div");
  div.classList.add("message");
  div.classList.add(msg.name===currentUser.name?"user":"other");
  if(msg.private && msg.private!==currentUser.name && msg.name!==currentUser.name) return;
  let content = `[${msg.time}] ${msg.name}: ${msg.text}`;
  if(msg.file) content += ` 📎 <a href="${msg.file}" target="_blank">file</a>`;
  div.innerHTML = content;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// --- Online users ---
onValue(ref(db,"online"), snapshot=>{
  usersList.innerHTML="";
  const users = snapshot.val()||{};
  Object.keys(users).forEach(u=>{
    const li = document.createElement("li");
    li.textContent = u;
    li.addEventListener("click", ()=> showUserDetail(u));
    usersList.appendChild(li);
  });
});

// --- User detail ---
function showUserDetail(u){
  detailName.textContent = u;
  detailEmail.textContent = "Email: hidden";
  detailStatus.textContent = "Status: Online";
  privateTarget = u;
  userDetail.classList.remove("hidden");
}
closeDetailBtn.addEventListener("click", ()=> { userDetail.classList.add("hidden"); privateTarget=null; });

// --- Private message button ---
privateMsgBtn.addEventListener("click", ()=>{
  messageInput.placeholder = "Private message to "+privateTarget;
  userDetail.classList.add("hidden");
});

// --- Emoji ---
emojiBtn.addEventListener("click", ()=> emojiPicker.classList.toggle("hidden"));
emojiPicker.addEventListener("click",(e)=>{ if(e.target.tagName==="SPAN") messageInput.value+=e.target.textContent; });

// --- File upload ---
fileBtn.addEventListener("click", ()=>fileInput.click());
fileInput.addEventListener("change", ()=>{
  const file = fileInput.files[0];
  if(!file) return;
  const storageRef = sRef(storage,"files/"+Date.now()+"_"+file.name);
  uploadBytes(storageRef,file).then(()=>getDownloadURL(storageRef)).then(url=>{
    sendMessage("",url);
  });
});

// --- Delete all messages (Admin) ---
deleteAllBtn.addEventListener("click", ()=>{
  if(confirm("Are you sure to delete all messages?")){
    remove(ref(db,"messages"));
  }
});

// --- Auto login ---
window.addEventListener("load", ()=>{
  const storedUser = localStorage.getItem("zhobUser");
  if(storedUser){
    currentUser = JSON.parse(storedUser);
    authSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
    set(ref(db,"online/"+currentUser.name),true);
  }
});

// --- Remove user on close ---
window.addEventListener("beforeunload", ()=>{
  if(currentUser) remove(ref(db,"online/"+currentUser.name));
});
