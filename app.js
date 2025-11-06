// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD94dXb9-A5oBppsfDKDL6m9OYs47fVwr0",
  authDomain: "zhobchat-33d8e.firebaseapp.com",
  databaseURL: "https://zhobchat-33d8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhobchat-33d8e",
  storageBucket: "zhobchat-33d8e.appspot.com",
  messagingSenderId: "214203221621",
  appId: "1:214203221621:web:b42f2fcdfc4e4c78487ed5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// References
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messageBox = document.getElementById("messageBox");

// When message is sent
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    const newMessageRef = db.ref("messages").push();
    newMessageRef.set({
      text: message,
      time: new Date().toLocaleTimeString()
    });
    messageInput.value = "";
  }
});

// Show messages in real-time
db.ref("messages").on("value", (snapshot) => {
  messageBox.innerHTML = "";
  snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();
    const p = document.createElement("p");
    p.textContent = `${data.time} - ${data.text}`;
    messageBox.appendChild(p);
  });
  messageBox.scrollTop = messageBox.scrollHeight;
});
