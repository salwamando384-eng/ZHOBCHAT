import { auth, db } from "./firebase_config.js";
import {
  ref,
  push,
  set,
  onChildAdded,
  onValue
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const uid = auth.currentUser.uid;
const userRef = ref(db, "users/" + uid);

// Load DP in header
onValue(userRef, snap => {
  let data = snap.val();
  document.getElementById("chatDp").src = data.dp;
});

const msgRef = ref(db, "messages");

// send message
sendBtn.onclick = () => {
  push(msgRef, {
    uid: uid,
    text: messageInput.value
  });
  messageInput.value = "";
};

// load all messages
onChildAdded(msgRef, snap => {
  let msg = snap.val();

  onValue(ref(db, "users/" + msg.uid), u => {
    let dp = u.val().dp;

    messages.innerHTML += `
      <div class="message">
        <img src="${dp}" class="msg-dp">
        <div>${msg.text}</div>
      </div>`;
  });
});
