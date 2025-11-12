// users.js
import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const usersTable = document.getElementById("usersTable");

onAuthStateChanged(auth, user => {
  if (!user) { window.location.href = "login.html"; return; }
  const uRef = ref(db, "users");
  onValue(uRef, snap => {
    usersTable.innerHTML = "";
    snap.forEach(child => {
      const u = child.val();
      const div = document.createElement("div");
      div.className = "userRowFull";
      div.innerHTML = `<img src="${u.dp||'default_dp.png'}" class="dpSmall"/><div><b>${escapeHtml(u.name)}</b><br/>${escapeHtml(u.age)} | ${escapeHtml(u.gender)} | ${escapeHtml(u.city)}<br/><small>${escapeHtml(u.status)}</small></div>
        <div><button onclick="(function(){ localStorage.setItem('profileView','${child.key}'); location.href='profile.html' })()">Profile</button></div>`;
      usersTable.appendChild(div);
    });
  });
});

function escapeHtml(s=""){ return (s+"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
