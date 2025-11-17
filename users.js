// users.js
import { auth, db } from "./firebase_config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

auth.onAuthStateChanged(user => {
  if (!user) location.href = "login.html";
  else loadUsers(user.uid);
});

function loadUsers(currentUid) {
  const userList = document.getElementById("userList");
  const usersRef = ref(db, "users");

  onValue(usersRef, snap => {
    userList.innerHTML = "";
    snap.forEach(child => {
      const uid = child.key;
      const data = child.val();
      if (!uid || uid === currentUid) return;
      const dp = data.dp ? data.dp : "default_dp.png";
      const name = data.name ? data.name : "Unknown";

      const card = document.createElement("div");
      card.className = "user-card";
      card.innerHTML = `
        <img src="${dp}" alt="dp">
        <div class="user-info">
          <h3>${name}</h3>
          <p>Tap to chat</p>
        </div>
      `;
      card.onclick = () => { location.href = `private_chat.html?uid=${uid}`; };
      userList.appendChild(card);
    });
  });
}
