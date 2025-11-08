import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

// Firebase config (اپنا config یہاں لگائیں)
const firebaseConfig = {
  apiKey: "AIzaSyDiso8BvuRZSWko7kTEsBtu99MKKGD7Myk",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "116466089929",
  appId: "1:116466089929:web:06e914c8ed81ba9391f218",
  measurementId: "G-LX9P9LRLV8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Ensure user is logged in
onAuthStateChanged(auth, (user) => {
  if (!user) window.location = "signup.html";
});

// Send message
sendBtn.addEventListener("click", async () => {
  const text = messageInput.value;
  if (!text) return;

  const userId = auth.currentUser.uid;
  await push(ref(database, "messages"), {
    senderId: userId,
    text: text,
    timestamp: Date.now()
  });

  messageInput.value = "";
});

// Listen for messages
onChildAdded(ref(database, "messages"), async (snapshot) => {
  const msg = snapshot.val();
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message");

  // Get sender info
  const userSnap = await get(ref(database, `users/${msg.senderId}`));
  const user = userSnap.val();
  const dpUrl = user.dp || "default_dp.png";

  msgDiv.innerHTML = `<img src="${dpUrl}" class="dp"/> <span class="sender">${user.name}:</span> ${msg.text}`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});
