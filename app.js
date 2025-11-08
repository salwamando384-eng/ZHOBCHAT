// =====================
// 🔹 ZHOB CHAT - DEBUG MODE
// =====================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.firebaseio.com",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 🟢 Initialize Firebase
let debugDiv = document.createElement("div");
debugDiv.style.position = "fixed";
debugDiv.style.bottom = "0";
debugDiv.style.left = "0";
debugDiv.style.right = "0";
debugDiv.style.maxHeight = "200px";
debugDiv.style.overflowY = "auto";
debugDiv.style.background = "#000";
debugDiv.style.color = "#0f0";
debugDiv.style.fontFamily = "monospace";
debugDiv.style.fontSize = "12px";
debugDiv.style.padding = "10px";
debugDiv.style.zIndex = "99999";
debugDiv.innerText = "🟡 Connecting to Firebase...";
document.body.appendChild(debugDiv);

function logDebug(msg) {
  console.log(msg);
  debugDiv.innerText += "\n" + msg;
}

// Firebase Initialization
let app, database, auth;

try {
  app = firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  auth = firebase.auth();
  logDebug("✅ Firebase SDK initialized");
} catch (e) {
  logDebug("❌ Firebase init failed: " + e.message);
}

// Test Firebase connection
try {
  firebase.database().ref(".info/connected").on("value", (snap) => {
    if (snap.val() === true) {
      logDebug("✅ Firebase Realtime DB connected");
    } else {
      logDebug("⚠️ Firebase not connected");
    }
  });
} catch (e) {
  logDebug("❌ DB check error: " + e.message);
}

// =====================
// 🔹 SIGNUP / LOGIN
// =====================
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");

if (signupBtn && loginBtn) {
  signupBtn.onclick = () => {
    const email = emailInput.value;
    const pass = passInput.value;
    auth.createUserWithEmailAndPassword(email, pass)
      .then(user => {
        logDebug("✅ Signup success: " + user.user.email);
        alert("Signup success!");
      })
      .catch(err => logDebug("❌ Signup error: " + err.message));
  };

  loginBtn.onclick = () => {
    const email = emailInput.value;
    const pass = passInput.value;
    auth.signInWithEmailAndPassword(email, pass)
      .then(user => {
        logDebug("✅ Login success: " + user.user.email);
        alert("Login success!");
      })
      .catch(err => logDebug("❌ Login error: " + err.message));
  };
} else {
  logDebug("⚠️ Login/Signup buttons not found in DOM");
}

// =====================
// 🔹 CHAT MESSAGE SYSTEM
// =====================
const msgForm = document.getElementById("msgForm");
const msgInput = document.getElementById("msgInput");
const msgBox = document.getElementById("msgBox");

if (msgForm && msgInput && msgBox) {
  msgForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = msgInput.value.trim();
    if (msg !== "") {
      firebase.database().ref("messages").push({
        text: msg,
        time: new Date().toISOString()
      })
      .then(() => {
        logDebug("✅ Message sent: " + msg);
        msgInput.value = "";
      })
      .catch(err => logDebug("❌ Message send failed: " + err.message));
    }
  });

  // Listen for new messages
  firebase.database().ref("messages").on("child_added", (snap) => {
    const msg = snap.val();
    const p = document.createElement("p");
    p.textContent = msg.text;
    msgBox.appendChild(p);
  });
} else {
  logDebug("⚠️ Chat elements missing");
}
