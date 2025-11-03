// Firebase initialization
const db = firebase.database();

// User list load
const userList = document.getElementById('users');
const userProfile = document.getElementById('userProfile');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const closeProfile = document.getElementById('closeProfile');

db.ref("users").on("value", (snapshot) => {
  userList.innerHTML = "";
  snapshot.forEach(child => {
    const user = child.val();
    const li = document.createElement("li");
    li.innerHTML = `<img src="${user.dp || 'default_dp.png'}"><span>${user.name}</span>`;
    li.onclick = () => showProfile(user);
    userList.appendChild(li);
  });
});

function showProfile(user) {
  document.getElementById('profileDp').src = user.dp || "default_dp.png";
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileAge').textContent = `Age: ${user.age || '--'}`;
  document.getElementById('profileGender').textContent = `Gender: ${user.gender || '--'}`;
  userProfile.style.display = "flex";
}

closeProfile.onclick = () => {
  userProfile.style.display = "none";
};

// Send message
sendBtn.onclick = () => {
  const msg = messageInput.value.trim();
  if (msg !== "") {
    const newMsg = db.ref("messages").push();
    newMsg.set({
      name: "You",
      text: msg,
      time: new Date().toLocaleTimeString()
    });
    messageInput.value = "";
  }
};

// Load messages
db.ref("messages").on("child_added", (snapshot) => {
  const msg = snapshot.val();
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<strong>${msg.name}:</strong> ${msg.text}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
