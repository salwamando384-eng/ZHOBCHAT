import { auth, db } from "./firebase_config.js";
import { ref, onChildAdded, push, set, get } 
from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const messagesBox = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");

const profileBtn = document.getElementById("profileBtn");
const myDp = document.getElementById("myDp");
const myName = document.getElementById("myName");

let uid;
let myData = {};

// LOAD CURRENT USER DATA
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  uid = user.uid;

  const snap = await get(ref(db, "users/" + uid));
  if (snap.exists()) {
    myData = snap.val();

    // FORCE NEW IMAGE LOAD
    myDp.src = myData.dp ? myData.dp + "?v=" + Date.now() : "default_dp.png";
    myName.textContent = myData.name || "Unknown";
  }
});

// Send Message
sendBtn.onclick = async () => {
  const text = msgInput.value.trim();
  if (text === "") return;

  await push(ref(db, "messages"), {
    uid: uid,
    name: myData.name,
    dp: myData.dp + "?v=" + Date.now(),
    text: text,
    time: Date.now()
  });

  msgInput.value = "";
};

// Load Messages Live
onChildAdded(ref(db, "messages"), (snapshot) => {
  const msg = snapshot.val();

  const div = document.createElement("div");
  div.classList.add("msg-box");

  div.innerHTML = `
    <img class="msg-dp" src="${msg.dp}">
    <div class="msg-content">
      <b>${msg.name}</b>
      <p>${msg.text}</p>
    </div>
  `;

  messagesBox.appendChild(div);
  messagesBox.scrollTop = messagesBox.scrollHeight;
});

// Go to Profile Page
profileBtn.onclick = () => {
  window.location.href = "profile.html";
};
