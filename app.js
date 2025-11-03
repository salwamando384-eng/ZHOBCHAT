// ------------------------
// Firebase config & initialization
// ------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218",
  measurementId: "G-LX9P9LRLV8"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

// ------------------------
// DOM elements
// ------------------------
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

// ------------------------
// Variables
// ------------------------
let currentUser = null;
let privateTarget = null;

// ------------------------
// Sign up / login
// ------------------------
signupBtn.addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  
  if(name && email && password){
    currentUser = { name, email };
    localStorage.setItem("zhobUser", JSON.stringify(currentUser));
    db.ref("online/"+name).set(true); // mark user online
    authSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
  } else {
    alert("Please fill all fields");
  }
});

// ------------------------
// Logout
// ------------------------
logoutBtn.addEventListener("click", () => {
  if(currentUser){
    db.ref("online/"+currentUser.name).remove();
  }
  localStorage.removeItem("zhobUser");
  chatSection.classList.add("hidden");
  authSection.classList.remove("hidden");
});

// ------------------------
// Send message
// ------------------------
sendBtn.addEventListener("click", () => {
  sendMessage(messageInput.value);
  messageInput.value = "";
});

function sendMessage(text, fileURL=null){
  if(!text && !fileURL) return;
  db.ref("messages").push({
    name: currentUser.name,
    text: text || "",
    file: fileURL || "",
    time: new Date().toLocaleTimeString(),
    private: privateTarget || null
  });
}

// ------------------------
// Show messages
// ------------------------
db.ref("messages").on("child_added", snapshot => {
  const msg = snapshot.val();
  
  // Show private messages only to sender/receiver
  if(msg.private && msg.private !== currentUser.name && msg.name !== currentUser.name) return;

  const div = document.createElement("div");
  div.classList.add("message", msg.name===currentUser.name?"user":"other");
  
  let content = `[${msg.time}] ${msg.name}: ${msg.text}`;
  if(msg.file) content += ` 📎 <a href="${msg.file}" target="_blank">file</a>`;
  
  div.innerHTML = content;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// ------------------------
// Online users
// ------------------------
db.ref("online").on("value", snapshot => {
  usersList.innerHTML = "";
  const users = snapshot.val() || {};
  Object.keys(users).forEach(u => {
    const li = document.createElement("li");
    li.textContent = u;
    li.addEventListener("click", () => showUserDetail(u));
    usersList.appendChild(li);
  });
});

// ------------------------
// Show user detail + private message
// ------------------------
function showUserDetail(u){
  detailName.textContent = u;
  detailEmail.textContent = "Email: hidden";
  detailStatus.textContent = "Status: Online";
  privateTarget = u;
  userDetail.classList.remove("hidden");
}

closeDetailBtn.addEventListener("click", () => {
  userDetail.classList.add("hidden");
  privateTarget = null;
});

privateMsgBtn.addEventListener("click", () => {
  messageInput.placeholder = "Private message to " + privateTarget;
  userDetail.classList.add("hidden");
});

// ------------------------
// Emoji picker
// ------------------------
emojiBtn.addEventListener("click", () => emojiPicker.classList.toggle("hidden"));
emojiPicker.addEventListener("click", (e) => {
  if(e.target.tagName==="SPAN") messageInput.value += e.target.textContent;
});

// ------------------------
// File upload
// ------------------------
fileBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if(!file) return;
  const storageRef = storage.ref("files/"+Date.now()+"_"+file.name);
  storageRef.put(file).then(() => {
    storageRef.getDownloadURL().then(url => sendMessage("", url));
  });
});

// ------------------------
// Delete all messages (Admin)
deleteAllBtn.addEventListener("click", () => {
  if(confirm("Are you sure to delete all messages?")){
    db.ref("messages").remove();
  }
});

// ------------------------
// Auto login if user exists
// ------------------------
window.addEventListener("load", () => {
  const storedUser = localStorage.getItem("zhobUser");
  if(storedUser){
    currentUser = JSON.parse(storedUser);
    authSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
    db.ref("online/"+currentUser.name).set(true);
  }
});

// ------------------------
// Remove user from online list on close
// ------------------------
window.addEventListener("beforeunload", () => {
  if(currentUser) db.ref("online/"+currentUser.name).remove();
});
