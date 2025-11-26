// users.js
import { db, auth } from "./firebase_config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const usersList = document.getElementById("usersList");

const usersRef = ref(db, "users");
onValue(usersRef, (snapshot) => {
  usersList.innerHTML = "";
  snapshot.forEach(child => {
    const user = child.val();
    const uid = child.key;

    const card = document.createElement("div");
    card.className = "user-card";
    card.innerHTML = `
      <img src="${user.dp || 'default_dp.png'}" class="user-dp" />
      <div class="user-info">
        <h3>${user.name || 'User'}</h3>
        <p>${user.city || ''}</p>
      </div>
    `;
    card.onclick = () => {
      localStorage.setItem("chatUser", uid);
      location.href = "private_chat.html";
    };
    usersList.appendChild(card);
  });
});
