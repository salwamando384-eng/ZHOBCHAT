// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD94dXb9-A5oBppsfDKDL6m9OYs47fVwr0",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "214203221621",
  appId: "1:214203221621:web:b42f2fcdfc4e4c78487ed5"
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// ✅ Elements references
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messageBox = document.getElementById("messageBox");
const userName = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");

// ✅ Check Login
auth.onAuthStateChanged((user) => {
  if (user) {
    const name = user.displayName || user.email.split("@")[0];
    userName.textContent = name;
  } else {
    window.location.href = "login.html";
  }
});

// ✅ Logout
logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
});

// ✅ Send message
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  const user = auth.currentUser;

  if (msg && user) {
    const name = user.displayName || user.email.split("@")[0];
    const newMsgRef = db.ref("messages").push();
    newMsgRef.set({
      name: name,
      text: msg,
      time: new Date().toLocaleTimeString()
    });
    messageInput.value = "";
  }
});

// ✅ Show all messages in real-time
db.ref("messages").on("value", (snapshot) => {
  messageBox.innerHTML = "";
  snapshot.forEach((child) => {
    const data = child.val();
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");
    msgDiv.innerHTML = `<strong>${data.name}</strong>: ${data.text} <small>(${data.time})</small>`;
    messageBox.appendChild(msgDiv);
  });
  messageBox.scrollTop = messageBox.scrollHeight;
});
