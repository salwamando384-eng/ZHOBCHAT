import { auth, db } from "./firebase_config.js";
import {
  ref,
  push,
  onChildAdded,
  get
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";


auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const uid = user.uid;

  // Load DP
  const userRef = ref(db, "users/" + uid);
  const snap = await get(userRef);

  if (snap.exists() && snap.val().dp) {
    document.getElementById("chatDp").src = snap.val().dp;
  }

  loadMessages(uid);
});


const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messagesBox = document.getElementById("messages");


sendBtn.onclick = async () => {
  const msg = messageInput.value.trim();
  if (msg === "") return;

  const user = auth.currentUser;

  await push(ref(db, "messages"), {
    uid: user.uid,
    text: msg,
    time: Date.now()
  });

  messageInput.value = "";
};


function loadMessages(currentUid) {
  const msgRef = ref(db, "messages");

  onChildAdded(msgRef, async (snap) => {
    const m = snap.val();

    const userRef = ref(db, "users/" + m.uid);
    const userSnap = await get(userRef);

    let dp = "default_dp.png";
    let name = "User";

    if (userSnap.exists()) {
      if (userSnap.val().dp) dp = userSnap.val().dp;
      if (userSnap.val().name) name = userSnap.val().name;
    }

    messagesBox.innerHTML += `
      <div class="message-row ${m.uid === currentUid ? "my-msg" : "other-msg"}">
        <img src="${dp}" class="msg-dp">
        <div class="msg-bubble">
          <strong>${name}</strong><br>
          ${m.text}
        </div>
      </div>
    `;

    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}


document.getElementById("logoutBtn").onclick = () => {
  auth.signOut();
  window.location.href = "login.html";
};
