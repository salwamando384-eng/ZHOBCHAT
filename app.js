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

// Initialize Firebase
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
const userDetail = document.getElementById("user-detail");
const detailName = document.getElementById("detailName");
const privateMsgBtn = document.getElementById("privateMsgBtn");
const closeDetailBtn = document.getElementById("closeDetailBtn");

let currentUser = null;
let privateTarget = null;

// --------------------
// Signup
signupBtn.addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if(!name || !email || !password) return alert("Fill all fields");

  auth.createUserWithEmailAndPassword(email, password)
      .then(userCred => {
        currentUser = { name, email };
        localStorage.setItem("zhobUser", JSON.stringify(currentUser));
        db.ref("online/"+name).set(true);
        authSection.classList.add("hidden");
        chatSection.classList.remove("hidden");
      })
      .catch(err => alert(err.message));
});

// --------------------
// Login
loginBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const name = document.getElementById("name").value.trim();
  if(!email || !password || !name) return alert("Fill all fields");

  auth.signInWithEmailAndPassword(email,password)
      .then(userCred => {
        currentUser = { name, email };
        localStorage.setItem("zhobUser", JSON.stringify(currentUser));
        db.ref("online/"+name).set(true);
        authSection.classList.add("hidden");
        chatSection.classList.remove("hidden");
      })
      .catch(err => alert(err.message));
});

// --------------------
// Logout
logoutBtn.addEventListener("click", ()=>{
  if(currentUser) db.ref("online/"+currentUser.name).remove();
  auth.signOut();
  localStorage.removeItem("zhobUser");
  chatSection.classList.add("hidden");
  authSection.classList.remove("hidden");
});

// --------------------
// Send message
sendBtn.addEventListener("click", ()=>{ sendMessage(messageInput.value); messageInput.value=""; });
function sendMessage(text, fileURL=null){
  if(!text && !fileURL) return;
  db.ref("messages").push({
    name: currentUser.name,
    text:text||"",
    file:fileURL||"",
    time:new Date().toLocaleTimeString(),
    private:privateTarget||null
  });
}

// --------------------
// Display messages
db.ref("messages").on("child_added", snapshot=>{
  const msg = snapshot.val();
  if(msg.private && msg.private!==currentUser.name && msg.name!==currentUser.name) return;

  const div = document.createElement("div");
  div.classList.add("message", msg.name===currentUser.name?"user":"other");
  let content = `[${msg.time}] ${msg.name}: ${msg.text}`;
  if(msg.file) content += ` 📎 <a href="${msg.file}" target="_blank">file</a>`;
  div.innerHTML = content;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// --------------------
// Online users
db.ref("online").on("value", snapshot=>{
  usersList.innerHTML="";
  const users = snapshot.val()||{};
  Object.keys(users).forEach(u=>{
    const li = document.createElement("li");
    li.textContent = u;
    li.addEventListener("click", ()=> showUserDetail(u));
    usersList.appendChild(li);
  });
});

// --------------------
// User detail / private message
function showUserDetail(u){
  detailName.textContent = u;
  privateTarget = u;
  userDetail.classList.remove("hidden");
}
closeDetailBtn.addEventListener("click", ()=>{ userDetail.classList.add("hidden"); privateTarget=null; });
privateMsgBtn.addEventListener("click", ()=>{ messageInput.placeholder="Private message to "+privateTarget; userDetail.classList.add("hidden"); });

// --------------------
// Emoji picker
emojiBtn.addEventListener("click", ()=> emojiPicker.classList.toggle("hidden"));
emojiPicker.addEventListener("click", e=>{ if(e.target.tagName==="SPAN") messageInput.value+=e.target.textContent; });

// --------------------
// File upload
fileBtn.addEventListener("click", ()=> fileInput.click());
fileInput.addEventListener("change", ()=>{
  const file = fileInput.files[0];
  if(!file) return;
  const storageRef = storage.ref("files/"+Date.now()+"_"+file.name);
  storageRef.put(file).then(()=>{ storageRef.getDownloadURL().then(url=> sendMessage("",url)); });
});

// --------------------
// Delete all messages (Admin)
deleteAllBtn.addEventListener("click", ()=>{
  if(confirm("Delete all messages?")) db.ref("messages").remove();
});

// --------------------
// Auto-login
window.addEventListener("load", ()=>{
  const stored = localStorage.getItem("zhobUser");
  if(stored){
    currentUser = JSON.parse(stored);
    authSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
    db.ref("online/"+currentUser.name).set(true);
  }
});
window.addEventListener("beforeunload", ()=>{ if(currentUser) db.ref("online/"+currentUser.name).remove(); });
