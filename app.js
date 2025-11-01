// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// DOM elements
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messageBox = document.getElementById("messageBox");
const usersList = document.getElementById("usersList");
const privateChatBox = document.getElementById("privateChatBox");
const privateMessages = document.getElementById("privateMessages");
const privateInput = document.getElementById("privateInput");
const privateSend = document.getElementById("privateSend");

let currentUser = null;
let chattingWith = null;

// ----------------------
//  USER AUTHENTICATION
// ----------------------
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    console.log("Logged in:", user.email);

    // Set user online
    const userRef = db.ref(`users/${user.uid}`);
    userRef.set({
      email: user.email,
      status: "online",
      lastActive: Date.now()
    });
    userRef.onDisconnect().update({
      status: "offline",
      lastActive: Date.now()
    });

    loadMessages();
    loadUsers();
  } else {
    console.log("User not logged in.");
  }
});

// ----------------------
//  PUBLIC CHAT
// ----------------------
sendButton.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (!message || !currentUser) return;

  db.ref("messages").push({
    text: message,
    user: currentUser.email,
    timestamp: Date.now()
  });
  messageInput.value = "";
});

function loadMessages() {
  db.ref("messages").on("child_added", snapshot => {
    const msg = snapshot.val();
    const p = document.createElement("p");
    p.textContent = `${msg.user}: ${msg.text}`;
    messageBox.appendChild(p);
    messageBox.scrollTop = messageBox.scrollHeight;
  });
}

// ----------------------
//  ONLINE USERS
// ----------------------
function loadUsers() {
  db.ref("users").on("value", snapshot => {
    usersList.innerHTML = "";
    snapshot.forEach(child => {
      const user = child.val();
      const li = document.createElement("li");
      li.textContent = `${user.email} (${user.status})`;
      li.className = user.status === "online" ? "online" : "offline";

      if (currentUser && user.email !== currentUser.email) {
        li.addEventListener("click", () => openPrivateChat(child.key, user.email));
      }
      usersList.appendChild(li);
    });
  });
}

// ----------------------
//  PRIVATE CHAT
// ----------------------
function openPrivateChat(uid, email) {
  chattingWith = { uid, email };
  privateChatBox.style.display = "block";
  privateMessages.innerHTML = "";
  loadPrivateMessages(uid);
}

function loadPrivateMessages(uid) {
  const chatId = getChatId(currentUser.uid, uid);
  db.ref(`privateChats/${chatId}`).on("child_added", snapshot => {
    const msg = snapshot.val();
    const p = document.createElement("p");
    p.textContent = `${msg.sender}: ${msg.text}`;
    privateMessages.appendChild(p);
    privateMessages.scrollTop = privateMessages.scrollHeight;
  });
}

privateSend.addEventListener("click", () => {
  const text = privateInput.value.trim();
  if (!text || !chattingWith) return;

  const chatId = getChatId(currentUser.uid, chattingWith.uid);
  db.ref(`privateChats/${chatId}`).push({
    sender: currentUser.email,
    text,
    timestamp: Date.now()
  });
  privateInput.value = "";
});

function getChatId(uid1, uid2) {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}
