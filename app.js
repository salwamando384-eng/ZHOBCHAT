// ✅ Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyXXXXX-REPLACE-WITH-YOURS",
  authDomain: "zhobchat.firebaseapp.com",
  databaseURL: "https://zhobchat-default-rtdb.firebaseio.com/",
  projectId: "zhobchat",
  storageBucket: "zhobchat.appspot.com",
  messagingSenderId: "0000000000",
  appId: "1:0000000000:web:xxxxxxxxxxxxxx"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ DOM Elements
const userList = document.getElementById("userList");
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatWith = document.getElementById("chatWith");

let currentUser = "You";
let chattingWith = "General Room";

// Sample Users List (can come from Firebase later)
const users = ["Ali", "Sara", "Bilal", "Hamza", "Ayesha"];
users.forEach(u => {
  const li = document.createElement("li");
  li.textContent = u;
  li.addEventListener("click", () => {
    chattingWith = u;
    chatWith.textContent = "Chat with " + u;
    chatMessages.innerHTML = "";
  });
  userList.appendChild(li);
});

// ✅ Send Message
sendBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message === "") return;

  const msgRef = ref(db, "messages/" + chattingWith);
  push(msgRef, {
    sender: currentUser,
    text: message
  });

  messageInput.value = "";
});

// ✅ Receive Messages
users.forEach(u => {
  const msgRef = ref(db, "messages/" + u);
  onChildAdded(msgRef, (data) => {
    const msg = data.val();
    const div = document.createElement("div");
    div.classList.add("message");
    if (msg.sender === currentUser) div.classList.add("self");
    div.textContent = msg.sender + ": " + msg.text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
});
