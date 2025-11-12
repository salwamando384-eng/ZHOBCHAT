import { auth, db } from "./firebase_config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, push, onChildAdded, update, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const logoutBtn = document.getElementById("logoutBtn");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const messagesContainer = document.getElementById("messagesContainer");
const usersBtn = document.getElementById("usersBtn");
const usersListDiv = document.getElementById("usersList");

let currentUser;

// Load current user
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    listenMessages();
    loadUsers();
  } else {
    window.location.href = "login.html";
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  if (currentUser) {
    await update(ref(db, "users/" + currentUser.uid), { status: "offline" });
    await signOut(auth);
    window.location.href = "login.html";
  }
});

// Send message
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";

  const msgRef = ref(db, "messages/");
  await push(msgRef, {
    fromUid: currentUser.uid,
    fromName: currentUser.displayName,
    text,
    color: "#000000",
    time: new Date().toLocaleTimeString()
  });
});

// Listen messages
function listenMessages() {
  const msgRef = ref(db, "messages/");
  onChildAdded(msgRef, (snap) => {
    const msg = snap.val();
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = `<strong style="color:${msg.color}">${msg.fromName}:</strong> ${msg.text} <span class="time">${msg.time}</span>`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}

// Load users
function loadUsers() {
  const usersRef = ref(db, "users/");
  onValue(usersRef, (snap) => {
    usersListDiv.innerHTML = "";
    snap.forEach((child) => {
      const user = child.val();
      const userDiv = document.createElement("div");
      userDiv.className = "user-item";
      userDiv.innerHTML = `${user.name} (${user.status})`;
      userDiv.addEventListener("click", () => openUserProfile(user));
      usersListDiv.appendChild(userDiv);
    });
  });
}

function openUserProfile(user) {
  alert(`Name: ${user.name}\nAge: ${user.age}\nGender: ${user.gender}\nEmail: ${user.email}`);
  // Future: Add private message / friend request options
}

// Users list toggle
usersBtn.addEventListener("click", () => {
  usersListDiv.classList.toggle("show");
});
