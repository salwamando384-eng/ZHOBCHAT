import { auth, db } from "./firebase_config.js";
import {
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const usersList = document.getElementById("usersList");

// Load all users from database
function loadUsers() {
  const usersRef = ref(db, "users");

  onValue(usersRef, (snapshot) => {
    usersList.innerHTML = ""; // clear list

    snapshot.forEach((child) => {
      const user = child.val();
      const uid = child.key;

      const card = document.createElement("div");
      card.className = "user-card";

      card.innerHTML = `
        <img src="${user.dp ? user.dp : 'default_dp.png'}" alt="DP">
        <div class="user-info">
          <h3>${user.name || "Unknown"}</h3>
          <p>${user.city || ""}</p>
        </div>
      `;

      // Click user → open chat
      card.onclick = () => {
        localStorage.setItem("chatUser", uid);
        window.location.href = "private_chat.html";
      };

      usersList.appendChild(card);
    });
  });
}

loadUsers();
