import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref as dbRef, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const usersContainer = document.getElementById("usersContainer");

onAuthStateChanged(auth, async user=>{
  if(!user) { location.href="index.html"; return; }
  const snap = await get(dbRef(db, "users"));
  if(!snap.exists()){ usersContainer.innerHTML="No users"; return; }
  const users = snap.val();
  Object.keys(users).forEach(uid=>{
    const u = users[uid];
    usersContainer.innerHTML += `<div style="padding:8px;border-bottom:1px solid #eee"><img src="${u.dp||'default_dp.png'}" style="width:40px;height:40px;border-radius:50%;margin-right:8px;vertical-align:middle">${u.name || 'Unknown'}</div>`;
  });
});
