import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.firebasestorage.app",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const chatForm = document.getElementById("chatForm");
const msgInput = document.getElementById("msgInput");
const messages = document.getElementById("messages");

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = msgInput.value.trim();
  if (!text) return;

  push(ref(db, "messages"), {
    text,
    time: new Date().toLocaleTimeString()
  });

  msgInput.value = "";
});

onChildAdded(ref(db, "messages"), (snapshot) => {
  const msg = snapshot.val();
  const div = document.createElement("div");
  div.className = "msg";
  div.textContent = `${msg.time} : ${msg.text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

window.addEventListener("error", (e) => alert("⚠️ Error: " + e.message));
