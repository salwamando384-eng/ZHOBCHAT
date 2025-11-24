// users.js
import { auth, db } from "./firebase_config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const usersList = document.getElementById("usersList");

auth.onAuthStateChanged(user => {
  if (!user) { window.location.href = "login.html"; return; }
  loadUsers(user.uid);
});

function loadUsers(currentUid) {
  const usersRef = ref(db, "users");
  onValue(usersRef, snapshot => {
    usersList.innerHTML = "";
    snapshot.forEach(child => {
      const uid = child.key;
      if (uid === currentUid) return; // skip self
      const u = child.val();
      const card = document.createElement("div");
      card.className = "user-card";
      card.innerHTML = `
        <img src="${u.dp || 'default_dp.png'}" alt="dp" />
        <div class="user-info">
          <h3>${u.name || 'Unknown'}</h3>
          <p>${u.city || ''}</p>
        </div>
      `;
      card.onclick = () => {
        // open private chat with uid
        location.href = `private_chat.html?uid=${uid}`;
      };
      usersList.appendChild(card);
    });
  });
}
