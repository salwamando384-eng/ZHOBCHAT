import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const chatWith = localStorage.getItem("chatWith");
const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const chatWithName = document.getElementById("chatWithName");

let currentUser;

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location = "signup.html";
  currentUser = user;

  const userSnap = await get(ref(db, `users/${chatWith}`));
  const u = userSnap.val();
  chatWithName.textContent = u ? u.name : "User";

  const chatId = currentUser.uid < chatWith
    ? currentUser.uid + "_" + chatWith
    : chatWith + "_" + currentUser.uid;

  const chatRef = ref(db, `privateChats/${chatId}`);

  sendBtn.addEventListener("click", async () => {
    const text = msgInput.value.trim();
    if (!text) return;

    await push(chatRef, {
      sender: currentUser.uid,
      text,
      timestamp: Date.now()
    });
    msgInput.value = "";
  });

  onChildAdded(chatRef, async (snap) => {
    const msg = snap.val();
    const senderSnap = await get(ref(db, `users/${msg.sender}`));
    const sender = senderSnap.val();

    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<b class="sender">${sender.name}:</b> ${msg.text}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
});
