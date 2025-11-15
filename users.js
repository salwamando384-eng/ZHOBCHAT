import { auth, db } from "./firebase_config.js";
import {
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";


// CHECK LOGIN
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  }
});


// LOAD USERS
const usersBox = document.getElementById("usersList");

const usersRef = ref(db, "users");

onValue(usersRef, snap => {
  usersBox.innerHTML = "";

  snap.forEach(child => {
    let u = child.val();

    let dp = u.dp ? u.dp : "default-dp.png";
    let name = u.name ? u.name : "User";
    let city = u.city ? u.city : "";
    let online = u.online ? "🟢 Online" : "⚪ Offline";

    usersBox.innerHTML += `
      <div class="user-card">
        <img src="${dp}" class="msg-dp" />
        <div>
          <strong>${name}</strong><br>
          <small>${city}</small><br>
          <small>${online}</small>
        </div>
      </div>
    `;
  });
});
