import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, onChildAdded, push, set, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const userList = document.getElementById("userList");
const profileModal = document.getElementById("profileModal");
const userListBtn = document.getElementById("userListBtn");
const profileBtn = document.getElementById("profileBtn");

onAuthStateChanged(auth, user => {
  if (user) {
    loadMessages();
    loadUsers();
  } else {
    window.location.href = "index.html";
  }
});

window.sendMessage = function () {
  const msg = messageInput.value.trim();
  if (msg === "") return;

  const user = auth.currentUser;
  const time = new Date().toLocaleTimeString();

  push(ref(db, "messages"), {
    name: user.displayName || "Anonymous",
    text: msg,
    time: time
  });
  messageInput.value = "";
};

function loadMessages() {
  const messagesRef = ref(db, "messages");
  onChildAdded(messagesRef, data => {
    const msg = data.val();
    const div = document.createElement("div");
    div.innerHTML = `<b>${msg.name}</b>: ${msg.text} <small>(${msg.time})</small>`;
    chatBox.appendChild(div);
  });
}

function loadUsers() {
  const usersRef = ref(db, "users");
  get(usersRef).then(snapshot => {
    userList.innerHTML = "";
    snapshot.forEach(child => {
      const user = child.val();
      const div = document.createElement("div");
      div.textContent = user.name;
      userList.appendChild(div);
    });
  });
}

window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

// Profile Modal
profileBtn.onclick = () => profileModal.classList.remove("hidden");
window.closeModal = () => profileModal.classList.add("hidden");
userListBtn.onclick = () => userList.classList.toggle("hidden");

window.changeProfilePic = function () {
  const file = document.getElementById("newProfilePic").files[0];
  if (!file) return alert("Please choose a picture!");

  const user = auth.currentUser;
  const storageRef = sRef(storage, `profiles/${user.uid}.jpg`);

  uploadBytes(storageRef, file).then(() => {
    getDownloadURL(storageRef).then(url => {
      updateProfile(user, { photoURL: url });
      set(ref(db, "users/" + user.uid + "/profilePic"), url);
      alert("Profile picture updated!");
    });
  });
};
