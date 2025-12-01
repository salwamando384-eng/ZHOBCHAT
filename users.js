// users.js
import { db } from "./firebase_config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const usersList = document.getElementById("usersList");
const usersRef = ref(db, "users");

onValue(usersRef, snap => {
  usersList.innerHTML = "";
  snap.forEach(child => {
    const u = child.val(); const uid = child.key;
    const card = document.createElement("div");
    card.className = "user-card";
    card.innerHTML = `
      <img src="${u.dp || 'default_dp.png'}" class="dp-thumb" />
      <div style="flex:1; padding-left:12px;">
        <div style="font-weight:bold">${u.name || 'User'}</div>
        <div style="color:#666">${u.city || ''}</div>
      </div>
      <div>
        <button class="small-btn view-btn">View</button>
      </div>
    `;
    card.querySelector(".view-btn").onclick = () => {
      localStorage.setItem("chatUser", uid);
      // open overlay style using same overlay component as chat uses:
      if (typeof openUsersOverlay === "function") openUsersOverlay(); // will display overlay and detail; it reads selected localStorage value in our implementation
      else location.href = "private_chat.html";
    };
    usersList.appendChild(card);
  });
});
