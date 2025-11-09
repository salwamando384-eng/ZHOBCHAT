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
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const chatWithName = document.getElementById("chatWithName");

auth.onAuthStateChanged(async user => {
  if (!user) return location.href = "login.html";
  const other = localStorage.getItem("chatWith");
  if (!other) { alert("No chat target"); return location.href="users.html"; }

  // canonical chat id so both users use same node
  const chatId = (user.uid < other) ? user.uid + "_" + other : other + "_" + user.uid;
  const chatRef = db.ref("privateChats/" + chatId);

  // show other user name
  const otherSnap = await db.ref("users/" + other).once("value");
  const otherData = otherSnap.val() || {};
  chatWithName.textContent = otherData.name || "User";

  sendBtn.onclick = () => {
    const text = msgInput.value.trim();
    if (!text) return;
    chatRef.push({ sender: user.uid, text, time: Date.now() });
    msgInput.value = "";
  };

  chatRef.on("child_added", async snap => {
    const m = snap.val();
    // if current user has blocked sender -> skip
    const meSnap = await db.ref("users/" + user.uid).once("value");
    const me = meSnap.val() || {};
    if (me.blockedUsers && me.blockedUsers.includes(m.sender)) return;

    const senderSnap = await db.ref("users/" + m.sender).once("value");
    const s = senderSnap.val() || {};
    const div = document.createElement("div");
    div.innerHTML = `<b>${s.name||'User'}:</b> ${m.text}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
});
