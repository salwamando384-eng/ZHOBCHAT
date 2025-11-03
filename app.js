// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.getAuth(app);
const db = firebase.getDatabase(app);

// Elements
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const authMsg = document.getElementById('auth-msg');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');
const userListDiv = document.getElementById('user-list');

let currentUser = null;
let activeChatUser = "public";

// Login
loginBtn.onclick = async () => {
  const email = email.value.trim();
  const password = password.value.trim();
  try {
    await firebase.signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    authMsg.textContent = err.message;
  }
};

// Signup
signupBtn.onclick = async () => {
  const email = email.value.trim();
  const password = password.value.trim();
  try {
    await firebase.createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    authMsg.textContent = err.message;
  }
};

// Auth state
firebase.onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    authContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    loadUsers();
    loadMessages(activeChatUser);
  } else {
    currentUser = null;
    chatContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
  }
});

// Logout
logoutBtn.onclick = () => firebase.signOut(auth);

// Send message
sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (!text) return;

  const msgRef = firebase.push(firebase.ref(db, `messages/${activeChatUser}`));
  firebase.set(msgRef, {
    text,
    sender: currentUser.email,
    time: new Date().toLocaleTimeString(),
  });
  messageInput.value = "";
};

// Load messages
function loadMessages(chatId) {
  messagesDiv.innerHTML = "";
  const msgRef = firebase.ref(db, `messages/${chatId}`);
  firebase.onChildAdded(msgRef, (snap) => {
    const msg = snap.val();
    const div = document.createElement('div');
    div.textContent = `${msg.sender}: ${msg.text}`;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// Load users
function loadUsers() {
  const userRef = firebase.ref(db, "users");
  firebase.onValue(userRef, (snap) => {
    const data = snap.val() || {};
    userListDiv.innerHTML = "<h3>Users</h3>";
    Object.keys(data).forEach(uid => {
      const user = data[uid];
      const div = document.createElement('div');
      div.textContent = user.email;
      div.onclick = () => {
        activeChatUser = uid;
        messagesDiv.innerHTML = "";
        loadMessages(uid);
      };
      userListDiv.appendChild(div);
    });
  });
}
