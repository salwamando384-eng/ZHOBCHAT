// ===== FIREBASE CONFIG =====
const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.firebasestorage.app",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

const authPage = document.getElementById("authPage");
const chatPage = document.getElementById("chatPage");
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const userList = document.getElementById("userList");
const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const emojiBtn = document.getElementById("emojiBtn");
const logoutBtn = document.getElementById("logoutBtn");

// === Switch between login & signup ===
document.getElementById("loginSwitch").onclick = () => {
  signupForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
};
document.getElementById("signupSwitch").onclick = () => {
  loginForm.classList.add("hidden");
  signupForm.classList.remove("hidden");
};

// === Signup ===
signupForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const gender = document.getElementById("gender").value;
  const age = document.getElementById("age").value;

  auth.createUserWithEmailAndPassword(email, pass)
    .then(user => {
      db.ref("users/" + user.user.uid).set({ name, email, gender, age, online: true });
      localStorage.setItem("userName", name);
      loadChat();
    })
    .catch(err => alert(err.message));
});

// === Login ===
loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;
  auth.signInWithEmailAndPassword(email, pass)
    .then(() => loadChat())
    .catch(err => alert(err.message));
});

// === Auto login if already logged in ===
auth.onAuthStateChanged(user => {
  if (user) loadChat();
});

// === Load chat ===
function loadChat() {
  authPage.classList.add("hidden");
  chatPage.classList.remove("hidden");
  updateUserList();
  loadMessages();
}

// === Logout ===
logoutBtn.onclick = () => {
  auth.signOut();
  chatPage.classList.add("hidden");
  authPage.classList.remove("hidden");
};

// === Send Message ===
sendBtn.onclick = () => {
  const msg = messageInput.value.trim();
  if (!msg) return;
  const user = auth.currentUser;
  db.ref("messages").push({
    name: localStorage.getItem("userName"),
    text: msg,
    time: Date.now()
  });
  messageInput.value = "";
};

// === Load Messages ===
function loadMessages() {
  db.ref("messages").on("value", snap => {
    messages.innerHTML = "";
    snap.forEach(child => {
      const msg = child.val();
      const div = document.createElement("div");
      div.className = "message other";
      if (msg.name === localStorage.getItem("userName")) div.classList.add("self");
      div.innerHTML = `<div class="sender">${msg.name}</div><div>${msg.text}</div>`;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    });
  });
}

// === User List with Robots ===
function updateUserList() {
  userList.innerHTML = "";
  robots.forEach(r => {
    const li = document.createElement("li");
    li.className = "online";
    li.innerHTML = `<img src="${r.dp}" style="width:24px;height:24px;border-radius:50%;margin-right:5px;"> ${r.name}`;
    userList.appendChild(li);
  });
}
