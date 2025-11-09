// Firebase init (same config)
const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const usersBtn = document.getElementById("usersBtn");
const logoutBtn = document.getElementById("logoutBtn");
const myInfo = document.getElementById("myInfo");
const status = document.getElementById("status");

usersBtn.addEventListener("click", () => location.href = "users.html");
logoutBtn.addEventListener("click", () => auth.signOut().then(()=> location.href="login.html"));

auth.onAuthStateChanged(user => {
  if (!user) return location.href = "login.html";
  status.textContent = "Logged in";
  // show my info
  db.ref("users/" + user.uid).once("value").then(snap => {
    const d = snap.val() || {};
    myInfo.innerHTML = `<img src="${d.dp || 'default_dp.png'}" class="dp"/> <div><b>${d.name||'You'}</b></div>`;
  });

  // send message
  sendBtn.onclick = () => {
    const text = input.value.trim();
    if (!text) return;
    // write to global messages
    db.ref("messages").push({
      sender: user.uid,
      text,
      time: Date.now()
    });
    input.value = "";
  };

  // listen messages
  db.ref("messages").limitToLast(200).on("child_added", async snap => {
    const m = snap.val();
    // check block: if current user has blocked sender -> skip
    const meSnap = await db.ref("users/" + user.uid).once("value");
    const me = meSnap.val() || {};
    if (me.blockedUsers && me.blockedUsers.includes(m.sender)) return;

    // get sender data
    const s = (await db.ref("users/" + m.sender).once("value")).val() || {};
    const dp = s.dp || 'default_dp.png';
    const name = s.name || 'User';
    const div = document.createElement('div');
    div.className = 'msg';
    div.innerHTML = `<img src="${dp}" class="dp"/> <b>${name}:</b> ${m.text}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
});
