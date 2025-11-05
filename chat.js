// --- Firebase initialization ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  databaseURL: "https://your-app-default-rtdb.firebaseio.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messageBox = document.getElementById('messageBox');
const userList = document.getElementById('userList');

// --- 5 Robot Users (dummy display only) ---
const robotUsers = [
  {
    name: "Abid",
    email: "abid@zhobchat.ai",
    dp: "https://randomuser.me/api/portraits/men/22.jpg"
  },
  {
    name: "Hina",
    email: "hina@zhobchat.ai",
    dp: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    name: "Akbar Khan",
    email: "akbar@zhobchat.ai",
    dp: "https://randomuser.me/api/portraits/men/55.jpg"
  },
  {
    name: "Junaid",
    email: "junaid@zhobchat.ai",
    dp: "https://randomuser.me/api/portraits/men/33.jpg"
  },
  {
    name: "Shaista",
    email: "shaista@zhobchat.ai",
    dp: "https://randomuser.me/api/portraits/women/45.jpg"
  }
];

// --- Function to show robot users in user list ---
function showRobotUsers() {
  robotUsers.forEach(bot => {
    const li = document.createElement("li");
    li.classList.add("user-item");
    li.innerHTML = `
      <img src="${bot.dp}" class="user-dp" alt="DP">
      <span>${bot.name}</span>
    `;
    userList.appendChild(li);
  });
}

// --- Load logged-in user ---
auth.onAuthStateChanged(user => {
  if (user) {
    // Show robot users after user logged in
    showRobotUsers();

    // Show other users (from Firebase)
    db.ref("users").on("value", snapshot => {
      userList.innerHTML = ""; // clear list first
      showRobotUsers(); // show robots again

      snapshot.forEach(child => {
        const data = child.val();
        if (data.email !== user.email) {
          const li = document.createElement("li");
          li.classList.add("user-item");
          li.innerHTML = `
            <img src="${data.dp || 'default_dp.png'}" class="user-dp">
            <span>${data.name}</span>
          `;
          userList.appendChild(li);
        }
      });
    });

    // Show chat messages
    db.ref("messages").on("child_added", snapshot => {
      const msg = snapshot.val();
      const div = document.createElement("div");
      div.classList.add("message");
      div.innerHTML = `<strong>${msg.name}:</strong> ${msg.text}`;
      messageBox.appendChild(div);
      messageBox.scrollTop = messageBox.scrollHeight;
    });

    // Send message
    messageForm.addEventListener("submit", e => {
      e.preventDefault();
      const text = messageInput.value.trim();
      if (text !== "") {
        db.ref("messages").push({
          name: user.displayName || user.email,
          text: text,
          timestamp: Date.now()
        });
        messageInput.value = "";
      }
    });
  } else {
    window.location.href = "index.html";
  }
});
