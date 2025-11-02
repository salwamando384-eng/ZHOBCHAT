// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const authBox = document.getElementById('auth-container');
const chatBox = document.getElementById('chat-container');
const signupBtn = document.getElementById('signupBtn');
const loginLink = document.getElementById('loginLink');
const sendBtn = document.getElementById('sendBtn');
const logoutBtn = document.getElementById('logoutBtn');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');

let currentUser = localStorage.getItem("zhobUser");

// ✅ اگر یوزر پہلے سے لاگ ان ہے
if (currentUser) {
  authBox.classList.add("hidden");
  chatBox.classList.remove("hidden");
  loadMessages();
}

// ✅ Signup
signupBtn.addEventListener("click", () => {
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const gender = document.getElementById('gender').value.trim();
  const age = document.getElementById('age').value.trim();

  if (!username || !email || !password) {
    alert("Please fill all fields!");
    return;
  }

  const userData = { username, email, password, gender, age };
  localStorage.setItem("zhobUser", JSON.stringify(userData));

  authBox.classList.add("hidden");
  chatBox.classList.remove("hidden");
  loadMessages();
});

// ✅ Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("zhobUser");
  chatBox.classList.add("hidden");
  authBox.classList.remove("hidden");
});

// ✅ Send Message
sendBtn.addEventListener("click", () => {
  const msg = messageInput.value.trim();
  if (msg === "") return;

  const user = JSON.parse(localStorage.getItem("zhobUser"));
  db.ref("messages").push({
    name: user.username,
    text: msg,
    time: new Date().toLocaleTimeString()
  });
  messageInput.value = "";
});

// ✅ Load Messages in Real Time
function loadMessages() {
  db.ref("messages").on("value", (snapshot) => {
    messagesDiv.innerHTML = "";
    snapshot.forEach((child) => {
      const msg = child.val();
      const div = document.createElement("div");
      div.className = "message";
      div.textContent = `${msg.name}: ${msg.text}`;
      messagesDiv.appendChild(div);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}
