// chat.js
import { auth, db } from "./firebase_config.js";
import {
  ref,
  push,
  onChildAdded,
  onValue
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const uid = auth.currentUser.uid;

const userRef = ref(db, "users/" + uid);

// Load own dp in header
onValue(userRef, snap => {
  let data = snap.val();
  if (data && data.dp) {
    document.getElementById("chatDp").src = data.dp;
  }
});

// Send Message
sendBtn.onclick = () => {
  push(ref(db, "messages"), {
    uid: uid,
    text: messageInput.value
  });
  messageInput.value = "";
};

// Load messages (with dp)
onChildAdded(ref(db, "messages"), snap => {
  let msg = snap.val();

  onValue(ref(db, "users/" + msg.uid), userSnap => {
    let user = userSnap.val();

    let dp = user && user.dp ? user.dp : "default_dp.png";

    messages.innerHTML += `
      <div class="message">
        <img src="${dp}" class="msg-dp">
        <div>${msg.text}</div>
      </div>`;
  });
});
