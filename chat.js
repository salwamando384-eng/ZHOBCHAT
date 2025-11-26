// chat.js
import { auth, db } from "./firebase_config.js";
import { ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const messagesBox = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const myDpHeader = document.getElementById("myDpHeader");

let currentUid = null;
let myProfile = { name: "User", dp: "default_dp.png" };

// get profile and listen for dp changes
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUid = user.uid;

  // load user data once (dp may be base64 or filename)
  const snap = await get(ref(db, "users/" + currentUid));
  if (snap.exists()) {
    myProfile = snap.val();
    myDpHeader.src = myProfile.dp || "default_dp.png";
  }

  // listen for any changes in user's own data (dp updates will reflect)
  const userRef = ref(db, "users/" + currentUid);
  userRef.on('value', (s) => {
    const d = s.val();
    if (d && d.dp) myDpHeader.src = d.dp;
  });
});

// send message — include name + dp so recipients see correct dp
sendBtn.onclick = async () => {
  const text = msgInput.value.trim();
  if (!text || !currentUid) return;

  // get latest profile
  const snap = await get(ref(db, "users/" + currentUid));
  const profile = snap.exists() ? snap.val() : { name: "User", dp: "default_dp.png" };

  await push(ref(db, "messages"), {
    uid: currentUid,
    name: profile.name || "User",
    dp: profile.dp || "default_dp.png",
    text: text,
    time: Date.now()
  });

  msgInput.value = "";
};

// load messages
onChildAdded(ref(db, "messages"), (snap) => {
  const msg = snap.val();
  const div = document.createElement("div");
  div.className = "msg-row";

  // msg.dp may be base64 or image path
  div.innerHTML = `
    <img class="msg-dp" src="${msg.dp || 'default_dp.png'}" />
    <div class="msg-bubble">
      <strong>${msg.name || 'User'}</strong>
      <p>${msg.text}</p>
    </div>
  `;
  messagesBox.appendChild(div);
  messagesBox.scrollTop = messagesBox.scrollHeight;
});

// logout
logoutBtn.onclick = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};
