// users.js
import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const usersList = document.getElementById("usersList");

onAuthStateChanged(auth, (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  loadUsers();
});

function loadUsers() {
  onValue(ref(db, "users"), (snap) => {
    usersList.innerHTML = "";
    snap.forEach(child => {
      const u = child.val();
      const uid = child.key;
      const div = document.createElement("div");
      div.className = "user-card";
      div.innerHTML = `<img src="${u.dp||'default_dp.png'}"><div><strong>${u.name||'User'}</strong><br>${u.city||''}</div>`;
      div.onclick = () => {
        localStorage.setItem("chatUser", uid);
        window.location.href = "private_chat.html";
      };
      usersList.appendChild(div);
    });
  });
}
