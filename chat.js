import { auth, db } from "./firebase_config.js";

import {
  ref,
  push,
  onChildAdded,
  onValue,
  get
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";


// ---------------- CHECK LOGIN ----------------
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const uid = user.uid;

  // Load Profile DP in header
  const userRef = ref(db, "users/" + uid);
  const snap = await get(userRef);

  if (snap.exists() && snap.val().dp) {
    document.getElementById("chatDp").src = snap.val().dp;
  }

  loadMessages(uid);
});


// ---------------- ELEMENTS ----------------
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messagesBox = document.getElementById("messages");


// ---------------- SEND MESSAGE ----------------
sendBtn.onclick = async () => {
  const text = messageInput.value.trim();
  if (text === "") return;

  const user = auth.currentUser;
  const uid = user.uid;

  const msgRef = ref(db, "messages");

  await push(msgRef, {
    uid: uid,
    text: text,
    time: Date.now()
  });

  messageInput.value = "";
};



// ---------------- LOAD MESSAGES ----------------
function loadMessages(currentUid) {
  const msgRef = ref(db, "messages");

  onChildAdded(msgRef, async (snap) => {
    const msg = snap.val();

    // fetch sender info
    const userRef = ref(db, "users/" + msg.uid);
    const userSnap = await get(userRef);

    let dp = "default-dp.png";
    if (userSnap.exists() && userSnap.val().dp) dp = userSnap.val().dp;

    let name = userSnap.exists() && userSnap.val().name
      ? userSnap.val().name
      : "User";

    // message display
    messagesBox.innerHTML += `
      <div class="message-row ${msg.uid === currentUid ? "my-msg" : "other-msg"}">
        <img src="${dp}" class="msg-dp">
        <div class="msg-bubble">
          <strong>${name}</strong><br>
          ${msg.text}
        </div>
      </div>
    `;

    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}



// ---------------- PROFILE BUTTON ----------------
document.getElementById("profileBtn").onclick = () => {
  window.location.href = "profile.html";
};



// ---------------- LOGOUT BUTTON ----------------
document.getElementById("logoutBtn").onclick = () => {
  auth.signOut();
  window.location.href = "login.html";
};
