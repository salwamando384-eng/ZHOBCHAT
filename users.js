import { auth, db } from "./firebase_config.js";

import {
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

auth.onAuthStateChanged(user => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  loadUsers(user.uid);
});


function loadUsers(currentUid) {
  const userList = document.getElementById("userList");

  const usersRef = ref(db, "users");

  onValue(usersRef, snap => {
    userList.innerHTML = "";

    snap.forEach(child => {
      let uid = child.key;
      let data = child.val();

      if (uid === currentUid) return; // skip own profile

      let dp = data.dp ? data.dp : "default_dp.png";
      let name = data.name ? data.name : "Unknown User";

      userList.innerHTML += `
        <div class="user-card" onclick="openChat('${uid}')">
          <img src="${dp}">
          <div class="user-info">
            <h3>${name}</h3>
            <p>Tap to chat</p>
          </div>
        </div>
      `;
    });
  });
}


window.openChat = function (uid) {
  location.href = "private_chat.html?uid=" + uid;
};
