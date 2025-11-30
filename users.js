// users.js
import { auth, db } from "./firebase_config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const usersList = document.getElementById("usersList") || document.getElementById("list");
const detailsBox = document.getElementById("detailBox") || document.getElementById("details");
const openUsersBtn = document.getElementById("openUsers");

let meUid = null;
onAuthStateChanged(auth, (u) => { if (u) meUid = u.uid; });

function startListening() {
  onValue(ref(db, "users"), (snap) => {
    const users = snap.val() || {};
    usersList.innerHTML = "";
    Object.keys(users).forEach(uid => {
      const user = users[uid];
      const div = document.createElement("div");
      div.className = "uItem";
      div.textContent = user.name || "User";
      div.onclick = () => showDetails(uid, user);
      usersList.appendChild(div);
    });
  });
}

function showDetails(uid, user) {
  detailsBox.style.display = "block";
  detailsBox.innerHTML = `
    <div style="text-align:center">
      <img src="${user.dp || 'default_dp.png'}" style="width:96px;height:96px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 8px" />
      <h3>${user.name || "User"}</h3>
      <div>Gender: ${user.gender || "-"}</div>
      <div>Age: ${user.age || "-"}</div>
      <div>City: ${user.city || "-"}</div>
      <div style="margin-top:10px">
        <button id="pmBtn" class="btn">Private Message</button>
        <button id="frBtn" class="btn">Friend Request</button>
      </div>
    </div>
  `;
  document.getElementById("pmBtn").onclick = () => {
    localStorage.setItem("chatUser", uid);
    window.location.href = "private_chat.html";
  };
  document.getElementById("frBtn").onclick = async () => {
    // friend request implementation (simple DB push)
    if (!meUid) return alert("Login required");
    try {
      await push(ref(db, `friend_requests/${uid}`), { from: meUid, time: Date.now() });
      alert("Friend request sent");
    } catch (err) {
      console.error(err);
      alert("Request failed");
    }
  };
}

// Start
startListening();
